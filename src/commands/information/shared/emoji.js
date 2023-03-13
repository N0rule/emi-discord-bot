const { parseEmoji, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

module.exports = (emoji) => {
  let custom = parseEmoji(emoji);
  if (!custom.id) return "Не правильная эмодзи сервера";

  let url = `https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif?v=1" : "png"}`;

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Информация Эмодзи" })
    .setDescription(
      `**Id:** ${custom.id}\n` + `**Имя:** ${custom.name}\n` + `**Анимирован?:** ${custom.animated ? "Да" : "Не"}`
    )
    .setImage(url);

  return { embeds: [embed] };
};
