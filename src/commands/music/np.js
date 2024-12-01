const { EMBED_COLORS } = require("@root/config");
const { EmbedBuilder } = require("discord.js");
const { formatTime } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "np",
  description: "показать какой трек сейчас играет",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    aliases: ["nowplaying"],
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message) {
    const response = nowPlaying(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = nowPlaying(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
function nowPlaying({ client, guildId, member }) {
  const player = client.musicManager.players.resolve(guildId);
  if (!player || !player.queue.current) return "🚫 Ничего не играет!";

  const track = player.queue.current;
  const totalLength = track.info.length;
  
  // Check if track is longer than 7 days (live stream)
  if (totalLength > 6.048e8) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setAuthor({ name: "Сейчас играет" })
      .setDescription(`[${track.info.title}](${track.info.uri})`)
      .addFields(
        {
          name: "Длительность Песни",
          value:  `\`[🔴 Трансляция]\``,
          inline: true,
        },
        {
          name: "Запрошено Пользователем:",
          value: track.requesterId ? track.requesterId : member.user.displayName,
          inline: true,
        }
      );

    return { embeds: [embed] };
  }

  // Regular track handling
  const position = player.position;
  const progress = Math.round((position / totalLength) * 15);
  const progressBar = `${formatTime(position)} [${"▬".repeat(progress)}🔘${"▬".repeat(15 - progress)}] ${formatTime(totalLength)}`;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Сейчас играет" })
    .setDescription(`[${track.info.title}](${track.info.uri})`)
    .addFields(
      {
        name: "Длительность Песни",
        value: `\`${formatTime(track.info.length)}\``,
        inline: true,
      },
      {
        name: "Запрошено Пользователем:",
        value: track.requesterId ? track.requesterId : member.user.displayName,
        inline: true,
      },
      {
        name: "\u200b",
        value: progressBar,
        inline: false,
      }
    );

  return { embeds: [embed] };
}