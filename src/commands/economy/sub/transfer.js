const { EmbedBuilder } = require("discord.js");
const { getUser } = require("@schemas/User");
const { ECONOMY, EMBED_COLORS } = require("@root/config");

module.exports = async (self, target, coins) => {
  if (isNaN(coins) || coins <= 0) return "Пожалуйста, введите действительное количество монет для перевода";
  if (target.bot) return "Вы не можете передавать монеты ботам!";
  if (target.id === self.id) return "Вы не можете передавать монеты себе!";

  const userDb = await getUser(self);

  if (userDb.bank < coins) {
    return `Недостаточный баланс банка! У вас всего ${userDb.bank}${ECONOMY.CURRENCY} в вашем банковском счете.${
      userDb.coins > 0 && "\nВы должны внести свои монеты в банк, прежде чем сможете их перевести"
    } `;
  }

  const targetDb = await getUser(target);

  userDb.bank -= coins;
  targetDb.bank += coins;

  await userDb.save();
  await targetDb.save();

  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: "Новый Баланс" })
    .setDescription(`Вы успешно перевели ${target.tag} ${coins}${ECONOMY.CURRENCY} монет`)
    .setTimestamp(Date.now());

  return { embeds: [embed] };
};
