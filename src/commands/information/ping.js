/**
 * @type {import("@structures/Command")}
 *
 */
module.exports = {
  name: "ping",
  description: "Показывает Пинг",
  category: "INFORMATION",
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [],
  },

  async messageRun(message, args) {
    await message.safeReply(`🏓 Понг : \`${Math.floor(message.client.ws.ping)}мс\``);
  },

  async interactionRun(interaction) {
    await interaction.followUp(`🏓 Понг : \`${Math.floor(interaction.client.ws.ping)}мс\``);
  },
};
