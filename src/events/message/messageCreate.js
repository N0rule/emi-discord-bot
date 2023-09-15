const { commandHandler, automodHandler, statsHandler } = require("@src/handlers");
const { EMBED_COLORS, PREFIX_COMMANDS, AICHAT } = require("@root/config");
const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder } = require("discord.js");
const { text } = require("stream/consumers");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY, basePath: process.env.OPENAI_API_BASE });
const openai = new OpenAIApi(configuration);

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message} message
 *
 */

module.exports = async (client, message, guild) => {
  if (!message.guild || message.author.bot) return;
  const settings = await getSettings(message.guild);
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(
      `Приветики я **${message.guild.members.me.displayName}!**\n Личный Бот **${message.guild.name} 🥰**\nМой Префикс \`${settings.prefix}\`\nДля помощи используй команду **/help**\n`
    );
  // command handler
  let isCommand = false;
  if (PREFIX_COMMANDS.ENABLED) {
    // check for bot mentions
    if (message.content.includes(`${client.user.id}`)) {
      const regextext = /<@[!&]?(\d+)> (.+)/;
      const mentionWithTextMatch = message.content.match(regextext);
      if (mentionWithTextMatch && AICHAT.ENABLED) {
        const mentionedText = mentionWithTextMatch[2];
        try {
          await message.channel.sendTyping();
          message.reply(await runCompletion(mentionedText));
        } catch (error) {
          // Handle the error here, for example:
          message.reply(`Произошла ошибка API,Попробуйте еще раз или напишите Администратору. \n(**${error}**)`);
        }
      } else {
        message.reply({ embeds: [embed] });
      }
    }

    if (message.content && message.content.startsWith(settings.prefix)) {
      const invoke = message.content.replace(`${settings.prefix}`, "").split(/\s+/)[0];
      const cmd = client.getCommand(invoke);
      if (cmd) {
        isCommand = true;
        commandHandler.handlePrefixCommand(message, cmd, settings);
      }
    }
  }

  // stats handler
  if (settings.stats.enabled) await statsHandler.trackMessageStats(message, isCommand, settings);

  // if not a command
  if (!isCommand) await automodHandler.performAutomod(message, settings);

  // runCompletion function to use the OpenAi API to generate results based on user prompts
  async function runCompletion(message) {
    const timeoutPromise = new Promise((reject) => {
      setTimeout(() => {
        reject(new Error());
      }, 35000);
    });

    const completionPromise = await openai.createChatCompletion({
      model: AICHAT.MODEL,
      max_tokens: AICHAT.TOKENS,
      presence_penalty: AICHAT.PRESENCE_PENALTY,
      temperature: AICHAT.TEMPERATURE,
      messages: [
        { role: "system", content: AICHAT.IMAGINEMESSAGE },
        { role: "user", content: message },
      ],
    });
    try {
      const completion = await Promise.race([timeoutPromise, completionPromise]);
      return completion.data.choices[0].message.content;
    } catch (error) {
      throw error;
    }
  }
};
