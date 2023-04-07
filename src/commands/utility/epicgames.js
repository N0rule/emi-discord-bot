const { EmbedBuilder } = require("discord.js");
const { getJson } = require("@helpers/HttpUtils");
const { EMBED_COLORS } = require("@root/config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "epicgames",
  description: "Поиск бесплатных игр в магазине Epic Games на прошлой неделе",
  cooldown: 10,
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["egs"],
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = await searchGame(message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await searchGame(interaction.user);
    await interaction.followUp(response);
  },
};

async function searchGame(author) {
  //search for free games in epic games store
  const response = await getJson(
    "https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=ru-ru"
  );

  const gamess = response.data.data.Catalog.searchStore.elements;
  const matchingGames = gamess.filter((game) => game.title.toLowerCase());

  if (matchingGames.length === 0) {
    const embed = new EmbedBuilder();
    embed.setColor(EMBED_COLORS.ERROR);
    embed.setTitle("Игры не найдены");
    embed.setTimestamp();
    return { embeds: [embed] };
  }

  const embed = new EmbedBuilder();
  embed.setColor(EMBED_COLORS.SUCCESS);
  embed.setTitle("Бесплатные игры в магазине Epic Games на прошлой неделе");
  embed.addFields(matchingGames.map((game) => ({ name: game.title, value: game.description, inline: false })));

  embed.setThumbnail(matchingGames[0].keyImages[0].url);

  embed.setTimestamp();
  return { embeds: [embed] };
}
