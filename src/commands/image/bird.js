const { EmbedBuilder } = require("discord.js");
const { getJson } = require("@helpers/HttpUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "bird",
  description: "случное фото птички",
  enabled: true,
  category: "IMAGE",
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
    const embed = await getAnimal(message.author);
    await message.safeReply(embed);
  },

  async interactionRun(interaction) {
    const embed = await getAnimal(interaction.user);
    await interaction.followUp(embed);
  },
};

async function getAnimal(user) {
  const response = await getJson("https://some-random-api.com/animal/bird");
  if (!response.success) return MESSAGES.API_ERROR;

  const imageUrl = response.data?.image;
  const embed = new EmbedBuilder().setColor("Random").setImage(imageUrl);
  return { embeds: [embed] };
}
