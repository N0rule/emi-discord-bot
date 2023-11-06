// Require necessary modules and create configuration
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS, AIIMAGE } = require("@root/config.js");
const { aiImage } = require("@helpers/ImageGeneration");

/**
 * @type {import("@structures/Command")}
 */
// Command Module exporting an object with the command details and properties
module.exports = {
  name: "aiimage",
  description: "промпт для сгенерирования изображения", // String describing the command
  category: "AI", // Category to which the command belongs
  cooldown: 30,
  command: {
    enabled: AIIMAGE.ENABLED, // Boolean to activate or deactivate command
    aliases: ["aii", "gptimage"], // Array of alternate strings used to call command
    usage: "<text>", // Instruction on how to use the command
    minArgsCount: 1, // Integer for minimum arguments count
  },
  slashCommand: {
    enabled: AIIMAGE.ENABLED, // Boolean to turn on or off
    options: [
      {
        name: "prompt", // Option name that is assigned to a value in an object
        description: "промпт для DALLE", // Description of the option
        type: ApplicationCommandOptionType.String, // Data type of the value
        required: true, // Boolean indicating if it is mandatory or not
      },
    ],
  },
  // This function runs when a message with arguments is received
  async messageRun(message, args) {
    // Create an EmbedBuilder object to format the response
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("Генерация Изображений")
      .setDescription("Генерирую...")
      .setFooter({ text: `Запрошено пользователем: ${message.author.username}` });

    let reply = null; // i don't know why, but it fixes multimessages
    // Join the arguments into one string
    const prompt = args.join(" ");

    // Send a message with embed and save it in a variable reply
    reply = await message.reply({ embeds: [embed] });
    // Run the function runCompletion with prompt and get the response from API
    try {
      // Run the function runCompletion with prompt and get the response from API
      const response = await aiImage(prompt);

      // Update the embed with the generated image URL
      embed.setDescription("Ваша фотография Сгенерирована!");
      embed.setImage(response);
    } catch (error) {
      embed.setDescription(error.message);
    }
    // Edit the message reply with the new embed
    await reply.edit({ embeds: [embed] });
  },

  // This function runs when an interaction with option prompt is received
  async interactionRun(interaction) {
    // Create an EmbedBuilder object to format the response
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("Генерация Изображений")
      .setDescription("Генерирую...")
      .setFooter({ text: `Запрошено пользователем: ${interaction.user.username}` });
    // Get the value of option prompt from interaction
    const prompt = interaction.options.getString("prompt");
    // Send an interaction with embed
    await interaction.followUp({ embeds: [embed] });
    try {
      // Run the function runCompletion with prompt and get the response from API
      const response = await aiImage(prompt);
      embed.setDescription("Ваша фотография Сгенерирована!");
      embed.setImage(response);
    } catch (error) {
      embed.setDescription(error.message);
    }
    await interaction.editReply({ embeds: [embed] });
  },
};
