const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const NekosLife = require("nekos.life");
const neko = new NekosLife();

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "feed",
  description: "покормить",
  enabled: true,
  category: "ANIME",
  userPermissions: ["AttachFiles"],
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    aliases: [],
    usage: "<user>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "Имя пользователя",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const target = args[0];
    const embed = await genReaction(message.author, target);
    await message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const target = interaction.options.getUser("user");
    const embed = await genReaction(interaction.user, target);
    await interaction.followUp({ embeds: [embed] });
  },
};

const genReaction = async (user, target) => {
  try {
    imageUrl = (await neko["feed"]()).url;
    return new EmbedBuilder().setDescription(`${user} покормил ${target}!`).setImage(imageUrl).setColor("Random");
  } catch (ex) {
    return new EmbedBuilder().setColor(EMBED_COLORS.ERROR).setDescription("Ошибка получения мема. Попробуй еще раз!");
  }
};
