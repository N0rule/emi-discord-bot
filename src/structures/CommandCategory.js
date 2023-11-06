const config = require("@root/config");

module.exports = {
  ADMIN: {
    name: "Администрирование",
    image: "https://cdn-icons-png.flaticon.com/512/10024/10024021.png",
    emoji: "⚙️",
  },
  AUTOMOD: {
    name: "Автомод",
    enabled: config.AUTOMOD.ENABLED,
    image: "https://icons.iconarchive.com/icons/google/noto-emoji-smileys/256/10103-robot-face-icon.png",
    emoji: "🤖",
  },
  ANIME: {
    name: "Аниме",
    image: "https://cdn-icons-png.flaticon.com/512/3370/3370972.png",
    emoji: "🎨",
  },
  AI: {
    name: "AI",
    enabled: config.AIIMAGE.ENABLED || config.AICHAT.ENABLED,
    image: "https://cdn-icons-png.flaticon.com/512/5278/5278402.png ",
    emoji: "🤖",
  },
  ECONOMY: {
    name: "Економика",
    enabled: config.ECONOMY.ENABLED,
    image: "https://cdn-icons-png.flaticon.com/512/1108/1108475.png",
    emoji: "🪙",
  },
  FUN: {
    name: "Веселье",
    image: "https://cdn-icons-png.flaticon.com/512/6359/6359280.png",
    emoji: "😂",
  },
  GIVEAWAY: {
    name: "Раздачи",
    enabled: config.GIVEAWAYS.ENABLED,
    image: "https://cdn-icons-png.flaticon.com/512/6021/6021967.png",
    emoji: "🎉",
  },
  IMAGE: {
    name: "Изображения",
    image: "https://cdn-icons-png.flaticon.com/512/9187/9187477.png",
    emoji: "🖼️",
  },
  INVITE: {
    name: "Инвайты",
    enabled: config.INVITE.ENABLED,
    image: "https://cdn-icons-png.flaticon.com/512/9187/9187511.png",
    emoji: "📨",
  },
  INFORMATION: {
    name: "Информация",
    image: "https://cdn-icons-png.flaticon.com/512/9187/9187469.png",
    emoji: "🪧",
  },
  MODERATION: {
    name: "Модерация",
    enabled: config.MODERATION.ENABLED,
    image: "https://cdn-icons-png.flaticon.com/512/9187/9187513.png",
    emoji: "🔨",
  },
  MUSIC: {
    name: "Музыка",
    enabled: config.MUSIC.ENABLED,
    image: "https://cdn-icons-png.flaticon.com/512/9187/9187489.png",
    emoji: "🎵",
  },
  OWNER: {
    name: "Владелец",
    image: "https://cdn-icons-png.flaticon.com/512/9187/9187494.png",
    emoji: "🤴",
  },
  // SOCIAL: {
  //   name: "Социальные",
  //   image: "https://cdn-icons-png.flaticon.com/512/9187/9187513.png",
  //   emoji: "🫂",
  // },
  STATS: {
    name: "Статистика",
    enabled: config.STATS.ENABLED,
    image: "https://cdn-icons-png.flaticon.com/512/9187/9187492.png",
    emoji: "📈",
  },
  SUGGESTION: {
    name: "Предложения",
    enabled: config.SUGGESTIONS.ENABLED,
    image: "https://cdn-icons-png.flaticon.com/512/1484/1484815.png",
    emoji: "📝",
  },
  TICKET: {
    name: "Билеты",
    enabled: config.TICKET.ENABLED,
    image: "https://cdn-icons-png.flaticon.com/512/2545/2545830.png",
    emoji: "🎫",
  },
  UTILITY: {
    name: "Утилити",
    image: "https://cdn-icons-png.flaticon.com/512/5966/5966739.png",
    emoji: "🛠",
  },
};
