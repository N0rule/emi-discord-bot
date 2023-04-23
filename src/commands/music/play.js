const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const prettyMs = require("pretty-ms");
const { EMBED_COLORS, MUSIC } = require("@root/config");
const { SpotifyItemType } = require("@lavaclient/spotify");

const search_prefix = {
  YT: "ytsearch",
  YTM: "ytmsearch",
  SC: "scsearch",
};

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "play",
  description: "Играет песню с ютуба",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  cooldown: 3,
  command: {
    enabled: true,
    aliases: ["p"],
    usage: "<song-name>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "query",
        description: "Имя песни или URL",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const query = args.join(" ");
    const response = await play(message, query);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const query = interaction.options.getString("query");
    const response = await play(interaction, query);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {string} query
 */
async function play({ member, guild, channel }, query) {
  if (!member.voice.channel) return "🚫 Для начала нужно находится в голосовом канале";

  let player = guild.client.musicManager.getPlayer(guild.id);
  if (player && !guild.members.me.voice.channel) {
    player.disconnect();
    await guild.client.musicManager.destroyPlayer(guild.id);
  }

  if (player && member.voice.channel !== guild.members.me.voice.channel) {
    return "🚫 Нужно находится в том же голосовом канале что и бот";
  }

  let embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED);
  let tracks;
  let description = "";

  try {
    if (guild.client.musicManager.spotify.isSpotifyUrl(query)) {
      if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        return "🚫 Spotify песни не работают. Обратитесь к N0rule";
      }

      const item = await guild.client.musicManager.spotify.load(query);
      switch (item?.type) {
        case SpotifyItemType.Track: {
          const track = await item.resolveYoutubeTrack();
          tracks = [track];
          description = `[${track.info.title}](${track.info.uri})`;
          break;
        }

        case SpotifyItemType.Artist:
          tracks = await item.resolveYoutubeTracks();
          description = `Артист: [**${item.name}**](${query})`;
          break;

        case SpotifyItemType.Album:
          tracks = await item.resolveYoutubeTracks();
          description = `Альбом: [**${item.name}**](${query})`;
          break;

        case SpotifyItemType.Playlist:
          tracks = await item.resolveYoutubeTracks();
          description = `Плейлист: [**${item.name}**](${query})`;
          break;

        default:
          return "🚫 Произошла ошибка при поиске песни";
      }

      if (!tracks) guild.client.logger.debug({ query, item });
    } else {
      const res = await guild.client.musicManager.rest.loadTracks(
        /^https?:\/\//.test(query) ? query : `${search_prefix[MUSIC.DEFAULT_SOURCE]}:${query}`
      );
      switch (res.loadType) {
        case "LOAD_FAILED":
          guild.client.logger.error("Search Exception", res.exception);
          return "🚫 Произошла ошибка при поиске";

        case "NO_MATCHES":
          return `Нет результатов подходящих под: ${query}`;

        case "PLAYLIST_LOADED":
          tracks = res.tracks;
          description = res.playlistInfo.name;
          break;

        case "TRACK_LOADED":
        case "SEARCH_RESULT": {
          const [track] = res.tracks;
          tracks = [track];
          break;
        }

        default:
          guild.client.logger.debug("Unknown loadType", res.loadType);
          return "🚫 Произошла ошибка при поиске песни";
      }

      if (!tracks) guild.client.logger.debug({ query, res });
    }
  } catch (error) {
    guild.client.logger.error("Search Exception", typeof error === "object" ? JSON.stringify(error) : error);
    return "🚫 Произошла ошибка при поиске песни";
  }

  if (!tracks) return "🚫 Произошла ошибка при поиске песни";

  if (tracks.length === 1) {
    const track = tracks[0];
    if (!player?.playing && !player?.paused && !player?.queue.tracks.length) {
      embed.setAuthor({ name: "Трек добавлен в очередь" });
    } else {
      const fields = [];
      embed
        .setAuthor({ name: "Трек добавлен в очередь" })
        .setDescription(`[${track.info.title}](${track.info.uri})`)
        .setFooter({ text: `Запрошено Пользователем: ${member.user.tag}` });

      fields.push({
        name: "Длительность песни",
        value: "`" + prettyMs(track.info.length, { colonNotation: true }) + "`",
        inline: true,
      });

      if (player?.queue?.tracks?.length > 0) {
        fields.push({
          name: "Позиция в Очереди",
          value: (player.queue.tracks.length + 1).toString(),
          inline: true,
        });
      }
      embed.addFields(fields);
    }
  } else {
    embed
      .setAuthor({ name: "Плейлист добавлен в очередь" })
      .setDescription(description)
      .addFields(
        {
          name: "Исключено",
          value: `${tracks.length} песен`,
          inline: true,
        },
        {
          name: "Длительность Плейлиста",
          value:
            "`" +
            prettyMs(
              tracks.map((t) => t.info.length).reduce((a, b) => a + b, 0),
              { colonNotation: true }
            ) +
            "`",
          inline: true,
        }
      )
      .setFooter({ text: `Запрошено Пользователем: ${member.user.tag}` });
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
