const { musicValidations } = require("@helpers/BotUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "volume",
  description: "устанавливает громкость музыки",
  category: "MUSIC",
  validations: musicValidations,
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<1-100>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "amount",
        description: "укажите громкость [от 1 до 100]",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const amount = parseInt(args[0]);
    const response = await getVolume(message, amount);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const amount = parseInt(interaction.options.getInteger("amount"));
    const response = await getVolume(interaction, amount);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function getVolume({ client, guildId }, amount) {
  const player = client.musicManager.players.resolve(guildId);

  if (!amount) return `🎶 Громкость музыки:  \`${player.volume}\`.`;

  if (isNaN(amount) || amount < 0 || amount > 100) {
    return "Вы должны выбрать громкость между 1 и 100.";
  }
  
  await player.setVolume(amount);
  return `🎶 Громкость музыки установлена на \`${amount}\`.`;
}
