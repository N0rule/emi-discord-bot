const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
module.exports = {
  name: "roll",
  description: "Бросить кубик, чтобы получить случайное число.",
  cooldown: 10,
  category: "FUN",
  botPermissions: ["SendMessages"],
  command: {
    enabled: true,
    usage: "<roll_amount>", // Instruction on how to use the command
  },
  slashCommand: {
    enabled: true, // Boolean to turn on or off
    options: [
      {
        name: "amount",
        description: "Максимальное значение для броска.",
        type: ApplicationCommandOptionType.Integer,
        required: false, // Set to false to make it optional
      },
    ],
  },
  async messageRun(message, args) {
    const rollamount = args[0] || 100; // Set default value to 100
    const response = await rollDice(rollamount, message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const rollamount = interaction.options.getInteger("amount") || 100; // Set default value to 100
    const response = await rollDice(rollamount, interaction.user);
    await interaction.followUp(response);
  },
};

function rollDice(rollamount, mauthor) {
  // Generate a random number between 1 and rollamount (inclusive)
  const randomNumber = Math.floor(Math.random() * rollamount) + 1;
  // Create embed
  const embed = new EmbedBuilder()
    .setTitle("**Бросок Кости**")
    .setColor(EMBED_COLORS.SUCCESS)
    .setDescription(`Вам выпало **${randomNumber}** 🎲`)
    .setFooter({
      text: `Запрошено пользователем ${mauthor.tag}`,
    });

  return { embeds: [embed] };
}
