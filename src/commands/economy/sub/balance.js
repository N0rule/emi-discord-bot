const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY } = require("@root/config");

module.exports = async (user) => {
  const economy = await getUser(user);

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({name: `Cчет ${user.username}`})
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      {
        name: "Кошелек",
        value: `${economy?.coins || 0}${ECONOMY.CURRENCY}`,
        inline: true,
      },
      {
        name: "Банк",
        value: `${economy?.bank || 0}${ECONOMY.CURRENCY}`,
        inline: true,
      },
      {
        name: "Общая Сумма",
        value: `${(economy?.coins || 0) + (economy?.bank || 0)}${ECONOMY.CURRENCY}`,
        inline: true,
      }
    );

  return { embeds: [embed] };
};
