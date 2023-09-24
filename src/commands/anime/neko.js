const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const NekosLife = require("nekos.life");
const neko = new NekosLife();

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "neko",
  description: "случное фото кошко-девочки",
  enabled: true,
  category: "ANIME",
  userPermissions: ["AttachFiles"],
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const embed = await genReaction(message.author);
    await message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const embed = await genReaction(interaction.user);
    await interaction.followUp({ embeds: [embed] });
  },
};

const genReaction = async (user) => {
  try {
    imageUrl = (await neko["neko"]()).url;
    return new EmbedBuilder().setImage(imageUrl).setColor("Random");
  } catch (ex) {
    return new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription("Ошибка получения мема. Попробуй еще раз!");
  }
};
