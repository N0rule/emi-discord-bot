const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
} = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { getRandomInt } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "meme",
  description: "посмотреть случайный мем",
  category: "FUN",
  userPermissions: ["AttachFiles"],
  botPermissions: ["EmbedLinks"],
  cooldown: 10,
  command: {
    enabled: true,
    usage: "[category]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "category",
        description: "категория мема",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const choice = args[0];

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("regenMemeBtn").setStyle(ButtonStyle.Secondary).setEmoji("🔁")
    );
    const embed = await getRandomEmbed(choice);

    const sentMsg = await message.safeReply({
      embeds: [embed],
      components: [buttonRow],
    });

    const collector = message.channel.createMessageComponentCollector({
      filter: (reactor) => reactor.user.id === message.author.id,
      time: this.cooldown * 1000,
      max: 3,
      dispose: true,
    });

    collector.on("collect", async (response) => {
      if (response.customId !== "regenMemeBtn") return;
      await response.deferUpdate();

      const embed = await getRandomEmbed(choice);
      await sentMsg.edit({
        embeds: [embed],
        components: [buttonRow],
      });
    });

    collector.on("end", () => {
      buttonRow.components.forEach((button) => button.setDisabled(true));
      return sentMsg.edit({
        components: [buttonRow],
      });
    });
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("category");

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("regenMemeBtn").setStyle(ButtonStyle.Secondary).setEmoji("🔁")
    );
    const embed = await getRandomEmbed(choice);

    await interaction.followUp({
      embeds: [embed],
      components: [buttonRow],
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (reactor) => reactor.user.id === interaction.user.id,
      time: this.cooldown * 1000,
      max: 3,
      dispose: true,
    });

    collector.on("collect", async (response) => {
      if (response.customId !== "regenMemeBtn") return;
      await response.deferUpdate();

      const embed = await getRandomEmbed(choice);
      await interaction.editReply({
        embeds: [embed],
        components: [buttonRow],
      });
    });

    collector.on("end", () => {
      buttonRow.components.forEach((button) => button.setDisabled(true));
      return interaction.editReply({
        components: [buttonRow],
      });
    });
  },
};

async function getRandomEmbed(choice) {
  const subReddits = ["meme", "Memes_Of_The_Dank", "memes", "dankmemes"];
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
