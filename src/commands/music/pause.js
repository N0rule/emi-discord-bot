const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "pause",
  description: "остановка музыки",
  category: "MUSIC",
  cooldown: 5,
  validations: musicValidations,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = pause(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = pause(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
function pause({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId);
  if (player.paused) return "Музыка уже остановлена.";

  player.pause(true);
  return "⏸️ Музыка остановлена.";
}
