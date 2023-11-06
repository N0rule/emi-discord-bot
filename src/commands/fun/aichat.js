// Require necessary modules and create configuration
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS, AICHAT } = require("@root/config.js");
const { aiChat } = require("@helpers/ChatGeneration");

/**
 * @type {import("@structures/Command")}
 */
// Command Module exporting an object with the command details and properties
module.exports = {
  name: "aichat",
  description: "промпт для ChatGPT", // String describing the command
  category: "AI", // Category to which the command belongs
  cooldown: 10,
  command: {
    enabled: AICHAT.ENABLED, // Boolean to activate or deactivate command
    aliases: ["chat", "gpt"], // Array of alternate strings used to call command
    usage: "<text>", // Instruction on how to use the command
    minArgsCount: 1, // Integer for minimum arguments count
  },
  slashCommand: {
    enabled: AICHAT.ENABLED, // Boolean to turn on or off
    options: [
      {
        name: "prompt", // Option name that is assigned to a value in an object
        description: "промпт для ChatGPT", // Description of the option
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
      .setTitle("ChatAI")
      .setDescription("Отвечаю...")
      .setThumbnail(message.client.user.displayAvatarURL())
      .setFooter({ text: `Запрошено пользователем: ${message.author.username}` });

    let reply = null; // i don't know why, but it fixes multimessages
    // Join the arguments into one string
    const prompt = args.join(" ");

    // Send a message with embed and save it in a variable reply
    reply = await message.reply({ embeds: [embed] });
    // Run the function aichat with prompt and get the response from API
    const response = await aiChat(prompt);
    // Update the embed with the response from API
    embed.setDescription(response.toString());
    // Edit the message reply with the new embed
    await reply.edit({ embeds: [embed] });
  },

  // This function runs when an interaction with option prompt is received
  async interactionRun(interaction) {
    // Create an EmbedBuilder object to format the response
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("ChatAI")
      .setDescription("Отвечаю...")
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: `Запрошено пользователем: ${interaction.user.username}` });
    // Get the value of option prompt from interaction
    const prompt = interaction.options.getString("prompt");
    // Send an interaction with embed
    await interaction.followUp({ embeds: [embed] });
    // Run the function aichat with prompt and get the response from API
    const response = await aiChat(prompt);
    embed.setDescription(response.toString());
    await interaction.editReply({ embeds: [embed] });
  },
};
