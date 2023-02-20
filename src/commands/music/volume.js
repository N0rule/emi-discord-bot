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
        description: "укажите громкость [от 0 до 100]",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const amount = args[0];
    const response = await volume(message, amount);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const amount = interaction.options.getInteger("amount");
    const response = await volume(interaction, amount);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function volume({ client, guildId }, volume) {
  const player = client.musicManager.getPlayer(guildId);

  if (!volume) return `> Громкость музыки: \`${player.volume}\`.`;
  if (volume < 1 || volume > 100) return "Вы должны выбрать громкость между 1 и 100.";

  await player.setVolume(volume);
  return `🎶 Громкость музыки установлена на \`${volume}\`.`;
}
