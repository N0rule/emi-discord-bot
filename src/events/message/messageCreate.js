const { commandHandler, automodHandler, statsHandler } = require("@src/handlers");
const { EMBED_COLORS,PREFIX_COMMANDS } = require("@root/config");
const { getSettings } = require("@schemas/Guild");
const {EmbedBuilder} = require("discord.js");
const { text } = require("stream/consumers");
/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message} message
 * 
 */

module.exports = async (client, message, guild) => {
  if (!message.guild || message.author.bot) return;
  const settings = await getSettings(message.guild);
  const desc = `Приветики я **${message.guild.members.me.displayName}!**\n`;
  desc += `Личный Бот Синдиката 🥰\n`;
  desc += `Мой Префикс \`${settings.prefix}\`\n`;
  desc += `Для помощи используй команду **/help**\n`;

  const embed = new EmbedBuilder()
  .setColor(EMBED_COLORS.BOT_EMBED)
  .setThumbnail(client.user.displayAvatarURL())
  .setDescription(desc);
  // command handler
  let isCommand = false;
  if (PREFIX_COMMANDS.ENABLED) {
    // check for bot mentions
    if (message.content.includes(`${client.user.id}`)) {
      message.channel.safeSend({embeds: [embed]})}

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
};
