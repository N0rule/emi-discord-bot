// Require necessary modules and create configuration
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS, AIPHOTO } = require("@root/config.js");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY, basePath: process.env.OPENAI_API_BASE });
const openai = new OpenAIApi(configuration);

/**
 * @type {import("@structures/Command")}
 */
// Command Module exporting an object with the command details and properties
module.exports = {
  name: "aiphoto",
  description: "промпт для DALLE (Experimental)", // String describing the command
  category: "FUN", // Category to which the command belongs
  cooldown: 120,
  command: {
    enabled: AIPHOTO.ENABLED, // Boolean to activate or deactivate command
    aliases: ["aip", "gptphoto"], // Array of alternate strings used to call command
    usage: "<text>", // Instruction on how to use the command
    minArgsCount: 1, // Integer for minimum arguments count
  },
  slashCommand: {
    enabled: AIPHOTO.ENABLED, // Boolean to turn on or off
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
      .setTitle("PhotoGen")
      .setDescription("Генерирую...")
      .setThumbnail(message.client.user.displayAvatarURL())
      .setFooter({ text: `Запрошено пользователем: ${message.author.username}` });

    let reply = null; // i don't know why, but it fixes multimessages
    try {
      // Join the arguments into one string
      const prompt = args.join(" ");

      // Send a message with embed and save it in a variable reply
      reply = await message.reply({ embeds: [embed] });
      // Run the function runCompletion with prompt and get the response from API
      const response = await runCompletion(prompt);
      // Update the embed with the response from API
      embed.setDescription("Ваша фотография Сгенерирована!");
      embed.setImage(response);
      // Edit the message reply with the new embed
      await reply.edit({ embeds: [embed] });
    } catch (error) {
      // Log the error to console
      // Send a message to user that there was an API error
      embed.setDescription(error.toString());
      await reply.edit({ embeds: [embed] });
    }
  },

  // This function runs when an interaction with option prompt is received
  async interactionRun(interaction) {
    // Create an EmbedBuilder object to format the response
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setTitle("PhotoGen")
      .setDescription("Генерирую...")
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: `Запрошено пользователем: ${interaction.user.username}` });
    try {
      // Get the value of option prompt from interaction
      const prompt = interaction.options.getString("prompt");
      // Send an interaction with embed
      await interaction.followUp({ embeds: [embed] });
      // Run the function runCompletion with prompt and get the response from API
      const response = await runCompletion(prompt);
      embed.setDescription("Ваша фотография Сгенерирована!");
      embed.setImage(response);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      // Log the error to console
      // Send an interaction with a message that there was an API error
      embed.setDescription(error.toString());
      await interaction.editReply({ embeds: [embed] });
    }
  },
};

// runCompletion function to use the OpenAi API to generate results based on user prompts
async function runCompletion(message) {
  const timeoutPromise = new Promise((reject) => {
    setTimeout(() => {
      reject(new Error());
    }, 35000);
  });

  const completionPromise = await openai.createImage({
    prompt: message,
    n: AIPHOTO.Count,
    size: AIPHOTO.size,
  });
  try {
    const completion = await Promise.race([timeoutPromise, completionPromise]);
    return completion.data.data[0].url;
  } catch (error) {
    throw error;
  }
}
