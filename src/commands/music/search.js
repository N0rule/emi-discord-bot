const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ApplicationCommandOptionType,
  ComponentType,
} = require("discord.js");
const prettyMs = require("pretty-ms");
const { EMBED_COLORS, MUSIC } = require("@root/config");

const search_prefix = {
  YT: "ytsearch",
  YTM: "ytmsearch",
  SC: "scsearch",
};

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "search",
  description: "поиск подходящих песен на ютубе",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  cooldown: 10,
  command: {
    enabled: true,
    usage: "<song-name>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "query",
        description: "песня для поиска",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const query = args.join(" ");
    const response = await search(message, query);
    if (response) await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const query = interaction.options.getString("query");
    const response = await search(interaction, query);
    if (response) await interaction.followUp(response);
    else interaction.deleteReply();
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {string} query
 */
async function search({ member, guild, channel }, query) {
  if (!member.voice.channel) return "🚫 Для начала нужно находится в голосовом канале";

  let player = guild.client.musicManager.getPlayer(guild.id);
  if (player && !guild.members.me.voice.channel) {
    player.disconnect();
    await guild.client.musicManager.destroyPlayer(guild.id);
  }
  if (player && member.voice.channel !== guild.members.me.voice.channel) {
    return "🚫 Нужно находится в том же голосовом канале что и бот";
  }

  let res;
  try {
    res = await guild.client.musicManager.rest.loadTracks(
      /^https?:\/\//.test(query) ? query : `${search_prefix[MUSIC.DEFAULT_SOURCE]}:${query}`
    );
  } catch (err) {
    return "🚫 Произошла ошибка при поиске песни";
  }

  let embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED);
  let tracks;

  switch (res.loadType) {
    case "LOAD_FAILED":
      guild.client.logger.error("Search Exception", res.exception);
      return "🚫 Произошла ошибка при поиске песни";

    case "NO_MATCHES":
      return `Нет результатов подходящих под: ${query}`;

    case "TRACK_LOADED": {
      const [track] = res.tracks;
      tracks = [track];
      if (!player?.playing && !player?.paused && !player?.queue.tracks.length) {
        embed.setAuthor({ name: "Песня добавлена в очередь" });
        break;
      }

      const fields = [];
      embed
        .setAuthor({ name: "Песня добавлена в очередь" })
        .setDescription(`[${track.info.title}](${track.info.uri})`)
        .setFooter({ text: `Запрошено Пользователем: ${member.user.tag}` });

      fields.push({
        name: "Длительность песни",
        value: "`" + prettyMs(track.info.length, { colonNotation: true }) + "`",
        inline: true,
      });

      // if (typeof track.displayThumbnail === "function") embed.setThumbnail(track.displayThumbnail("hqdefault"));
      if (player?.queue?.tracks?.length > 0) {
        fields.push({
          name: "Позиция в Очереди",
          value: (player.queue.tracks.length + 1).toString(),
          inline: true,
        });
      }
      embed.addFields(fields);
      break;
    }

    case "PLAYLIST_LOADED":
      tracks = res.tracks;
      embed
        .setAuthor({ name: "Плейлист добавлен в очередь" })
        .setDescription(res.playlistInfo.name)
        .addFields(
          {
            name: "Исключено",
            value: `${res.tracks.length} песен`,
            inline: true,
          },
          {
            name: "Длительность Плейлиста",
            value:
              "`" +
              prettyMs(
                res.tracks.map((t) => t.info.length).reduce((a, b) => a + b, 0),
                { colonNotation: true }
              ) +
              "`",
            inline: true,
          }
        )
        .setFooter({ text: `Запрошено Пользователем: ${member.user.tag}` });
      break;

    case "SEARCH_RESULT": {
      let max = guild.client.config.MUSIC.MAX_SEARCH_RESULTS;
      if (res.tracks.length < max) max = res.tracks.length;

      const results = res.tracks.slice(0, max);
      const options = results.map((result, index) => ({
        label: result.info.title,
        value: index.toString(),
      }));

      const menuRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("search-results")
          .setPlaceholder("Выберите результат поиска")
          .setMaxValues(max)
          .addOptions(options)
      );

      const tempEmbed = new EmbedBuilder()
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setAuthor({ name: "Результат Поиска" })
        .setDescription(`Выберите песню которую хотите добавить в очередь`);

      const sentMsg = await channel.send({
        embeds: [tempEmbed],
        components: [menuRow],
      });

      try {
        const response = await channel.awaitMessageComponent({
          filter: (reactor) => reactor.message.id === sentMsg.id && reactor.user.id === member.id,
          idle: 30 * 1000,
          componentType: ComponentType.StringSelect,
        });

        await sentMsg.delete();
        if (!response) return "🚫 Вы слишком долго выбирали песню";

        if (response.customId !== "search-results") return;
        const toAdd = [];
        response.values.forEach((v) => toAdd.push(results[v]));

        // Only 1 song is selected
        if (toAdd.length === 1) {
          tracks = [toAdd[0]];
          embed.setAuthor({ name: "Песня добавлена в очередь" });
        } else {
          tracks = toAdd;
          embed
            .setDescription(`🎶 добавлено ${toAdd.length} песен в очередь`)
            .setFooter({ text: `Запрошено Пользователем: ${member.user.tag}` });
        }
      } catch (err) {
        console.log(err);
        await sentMsg.delete();
        return "🚫 Ошибка выбора ответа";
      }
    }
  }

  // create a player and/or join the member's vc
  if (!player?.connected) {
    player = guild.client.musicManager.createPlayer(guild.id);
    player.queue.data.channel = channel;
    player.connect(member.voice.channel.id, { deafened: true });
  }

  // do queue things
  const started = player.playing || player.paused;
  player.queue.add(tracks, { requester: member.user.tag, next: false });
  if (!started) {
    await player.queue.start();
  }

  return { embeds: [embed] };
}

