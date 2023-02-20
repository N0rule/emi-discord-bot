const { ChannelType } = require("discord.js");

/**
 * @param {number} type
 */
module.exports = (type) => {
  switch (type) {
    case ChannelType.GuildText:
      return "Сервер Текст";
    case ChannelType.GuildVoice:
      return "Сервер Войс";
    case ChannelType.GuildCategory:
      return "Сервер Категория";
    case ChannelType.GuildAnnouncement:
      return "Сервер Объявление";
    case ChannelType.AnnouncementThread:
      return "Сервер Объявление Тред";
    case ChannelType.PublicThread:
      return "Сервер Публичный Тред";
    case ChannelType.PrivateThread:
      return "Сервер Приватный Тред";
    case ChannelType.GuildStageVoice:
      return "Сервер Войс Сцена";
    case ChannelType.GuildDirectory:
      return "Сервер Деректория";
    case ChannelType.GuildForum:
      return "Сервер Форум";
    default:
      return "Неизвестно";
  }
};
