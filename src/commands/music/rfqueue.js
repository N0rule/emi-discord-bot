const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { musicValidations } = require("@helpers/BotUtils");
const { EMBED_COLORS } = require("@root/config.js");
/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "rfqueue",
  description: "удаляет песню из очереди по номеру",
  category: "MUSIC",
  validations: musicValidations,
  command: {
    enabled: true,
    aliases: ["rfq", "rq"],
    usage: "<song-number>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "id",
        description: "Введите позицию трека в очереди или ID трека",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const player = message.client.musicManager.getPlayer(message.guild.id);
    if (!player) return message.safeReply("🚫 Сейчас музыка не играет.");

    const index = parseInt(args[0]) - 1;
    if (isNaN(index) || index < 0 || index >= player.queue.tracks.length)
      return message.safeReply(`Пожалуйста, введите допустимый номер трека (1-${player.queue.tracks.length}).`);

    const removedTrack = player.queue.remove(index);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setDescription(`✅ **${removedTrack.title}** был удален из очереди.`);

    await message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const player = interaction.client.musicManager.getPlayer(interaction.guild.id);
    if (!player) return interaction.followUp("🚫 Сейчас музыка не играет.");

    const input = interaction.options.getString("id");
    const index = parseInt(input) - 1;

    if (isNaN(index) || index < 0 || index >= player.queue.tracks.length)
      return interaction.followUp(`Пожалуйста, введите допустимый номер трека (1-${player.queue.tracks.length}).`);

    const removedTrack = player.queue.remove(index);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setDescription(`✅ **${removedTrack.title}** был удален из очереди.`);

    await interaction.followUp({ embeds: [embed] });
  }
};