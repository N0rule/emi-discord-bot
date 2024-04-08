const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { getRandomInt } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "anime",
  description: "посмотреть случайный аниме пост",
  category: "ANIME",
  userPermissions: ["AttachFiles"],
  botPermissions: ["EmbedLinks"],
  cooldown: 10,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const choice = args[0];
    const embed = await getRandomEmbed(choice);
    await message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("category");
    const embed = await getRandomEmbed(choice);
    await interaction.followUp({
      embeds: [embed],
    });
  },
};

async function getRandomEmbed(choice) {
  const subReddits = ["animememes", "Animemes"];
  let rand = choice ? choice : subReddits[getRandomInt(subReddits.length - 1)];

  const response = await getJson(`https://meme-api.com/gimme/${rand}`);
  if (!response.success || !response.data) {
    return new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription("Ошибка получения мема. Попробуй снова!");
  }

  const json = response.data;
  if (!json.postLink || !json.url || !json.title || !json.ups) {
    return new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription(`Не найдено не одного мема :() ${choice}`);
  }

  if (json.nsfw === true) {
    return new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription("Этот мем содержит содержание NSFW");
  }
  
  const memeUrl = json.postLink;
  const memeImage = json.url;
  const memeTitle = json.title;
  const memeUpvotes = json.ups;

  return new EmbedBuilder()
    .setAuthor({ name: memeTitle, url: memeUrl })
    .setImage(memeImage)
    .setColor("Random")
    .setFooter({ text: `👍 ${memeUpvotes}` });
}
