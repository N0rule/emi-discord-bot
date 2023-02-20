const { EmbedBuilder, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { stripIndent } = require("common-tags");
const channelTypes = require("@helpers/channelTypes");

/**
 * @param {import('discord.js').GuildChannel} channel
 */
module.exports = (channel) => {
  const { id, name, parent, position, type } = channel;

  let desc = stripIndent`
      ❯ ID: **${id}**
      ❯ Имя: **${name}**
      ❯ Тип: **${channelTypes(channel.type)}**
      ❯ Категория: **${parent || "НА"}**\n
      `;

  if (type === ChannelType.GuildText) {
    const { rateLimitPerUser, nsfw } = channel;
    desc += stripIndent`
      ❯ Тема: **${channel.topic || "нет темы"}**
      ❯ Позиция: **${position}**
      ❯ Медленный режим: **${rateLimitPerUser}**
      ❯ NSFW?: **${nsfw ? "✓" : "✕"}**\n
      `;
  }

  if (type === ChannelType.GuildPublicThread || type === ChannelType.GuildPrivateThread) {
    const { ownerId, archived, locked } = channel;
    desc += stripIndent`
      ❯ Id Владельца: **${ownerId}**
      ❯ Архивирован?: **${archived ? "✓" : "✕"}**
      ❯ Закрыт?: **${locked ? "✓" : "✕"}**\n
      `;
  }

  if (type === ChannelType.GuildNews || type === ChannelType.GuildNewsThread) {
    const { nsfw } = channel;
    desc += stripIndent`
      ❯ NSFW?: **${nsfw ? "✓" : "✕"}**\n
      `;
  }

  if (type === ChannelType.GuildVoice || type === ChannelType.GuildStageVoice) {
    const { bitrate, userLimit, full } = channel;
    desc += stripIndent`
      ❯ Позиция: **${position}**
      ❯ БитРейт: **${bitrate}**
      ❯ Липит пользователей?: **${userLimit}**
      ❯ Полный?: **${full ? "✓" : "✕"}**\n
      `;
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Детали Канала" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc);

  return { embeds: [embed] };
};
