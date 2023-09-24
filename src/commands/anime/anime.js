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
  let rand = choice ? choice : subReddits[getRandomInt(subReddits.length)];

  const response = await getJson(`https://www.reddit.com/r/${rand}/random/.json`);
  if (!response.success) {
    return new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription("Ошибка получения мема. Попробуй снова!");
  }

  const json = response.data;
  if (!Array.isArray(json) || json.length === 0) {
    return new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription(`Не найдено не одного мема :() ${choice}`);
  }

  try {
    let permalink = json[0].data.children[0].data.permalink;
    let memeUrl = `https://reddit.com${permalink}`;
    let memeImage = json[0].data.children[0].data.url;
    let memeTitle = json[0].data.children[0].data.title;
    let memeUpvotes = json[0].data.children[0].data.ups;
    let memeNumComments = json[0].data.children[0].data.num_comments;

    return new EmbedBuilder()
      .setAuthor({ name: memeTitle, url: memeUrl })
      .setImage(memeImage)
      .setColor("Random")
      .setFooter({ text: `👍 ${memeUpvotes} | 💬 ${memeNumComments}` });
  } catch (error) {
    return new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription("Ошибка получения мема. Попробуй снова!");
  }
}
