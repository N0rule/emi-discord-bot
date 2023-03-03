const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getUser } = require("@schemas/User");
const { EMBED_COLORS, ECONOMY, BUYROLELIST } = require("@root/config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "buyrole",
  description: "Купить роль за указанную цену.",
  category: "ECONOMY",
  botPermissions: ["EmbedLinks", "ManageRoles"],
  command: {
    enabled: true,
    usage: "<role> or \"list\"",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "role",
        description: "Название роли, которую нужно купить.",
        required: true,
        type: ApplicationCommandOptionType.String,
      },
    ],
  },

  async messageRun(message, args) {
    if (args[0] === "list") {
      const roleList = Object.entries(BUYROLELIST)
        .map(([name,data]) => `**${name}**: ${data.rolename} - ${data.price}${ECONOMY.CURRENCY}`)
        .join("\n");
      const embed = new EmbedBuilder()
        .setTitle("Список Ролей")
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(roleList);
      await message.safeReply({ embeds: [embed] });
      return;
    }  
      const roleName = args[0];
      const response = await buyRole(message.author, message.guild, roleName);
      await message.safeReply(response);
  },

  async interactionRun(interaction) {
    if (interaction.options.getString("role") === "list") {
      const roleList = Object.entries(BUYROLELIST)
        .map(([name, data]) => `**${name}**: ${data.price}${ECONOMY.CURRENCY}`)
        .join("\n");
      const embed = new EmbedBuilder()
        .setTitle("Список Ролей")
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setDescription(roleList);
      return interaction.followUp({ embeds: [embed] });
    }
    const roleName = interaction.options.getString("role");
      const response = await buyRole(interaction.user, interaction.guild, roleName);
      return interaction.followUp(response);
  },
};
async function buyRole(user, guild, roleName) {
  const roleInfo = BUYROLELIST[roleName];
  if (!roleInfo) {
    return "Указанная роль не существует в списке ролей.";
  }

  const role = guild.roles.cache.get(roleInfo.id);
  if (!role) {
    return "Указанная роль не существует на этом сервере.";
  }

  const rolePrice = roleInfo.price;
  if (!rolePrice) {
    return "Указанная роль не продается.";
  }

  const userDb = await getUser(user);
  if (userDb.coins < rolePrice) {
    return `У вас недостаточно${ECONOMY.CURRENCY} для покупки этой роли! Вам нужно ${rolePrice}${ECONOMY.CURRENCY}.`;
  }

  const member = await guild.members.fetch(user);
  if (member.roles.cache.has(role.id)) {
    return "У вас уже есть эта роль!";
  }

  try {
    await member.roles.add(role);
    userDb.coins -= rolePrice;
    await userDb.save();
    const embed = new EmbedBuilder()
      .setAuthor({ name: `${user.username}`, iconURL: user.displayAvatarURL() })
      .setColor(EMBED_COLORS.SUCCESS)
      .setDescription(`Вы успешно купили роль **${role.name}** за ${rolePrice}${ECONOMY.CURRENCY}!\n`)
      .setFooter({ text:  `Обновленный баланс: ${userDb?.coins}${ECONOMY.CURRENCY}`});
    return { embeds: [embed] };
  } catch (error) {
    console.error(error);
    return "Что-то пошло не так!";
  }
}


