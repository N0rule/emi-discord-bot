const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const { getMemberStats, getXpLb } = require("@schemas/MemberStats");
const { stripIndents } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "rank",
  description: "Отображает ранг участника на этом сервере",
  cooldown: 5,
  category: "STATS",
  botPermissions: ["AttachFiles"],
  command: {
    enabled: true,
    usage: "[@member|id]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "целевой пользователь",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const member = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await getRank(message, member, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(user);
    const response = await getRank(interaction, member, data.settings);
    await interaction.followUp(response);
  },
};

async function getRank({ guild }, member, settings) {
  const { user } = member;
  if (!settings.stats.enabled) return "Отслеживание статистики отключено на этом сервере";

  const memberStats = await getMemberStats(guild.id, user.id);
  if (!memberStats.xp) return `${user.username} еще не имеет ранга!`;

  const lb = await getXpLb(guild.id, 100);
  let pos = -1;
  lb.forEach((doc, i) => {
    if (doc.member_id == user.id) {
      pos = i + 1;
    }
  });

  const xpNeeded = memberStats.level * memberStats.level * 100;
  const rank = pos !== -1 ? pos : 0;

  const embed = new EmbedBuilder()
    .setThumbnail(member.user.displayAvatarURL())
    .setTitle(`⬆️ Ранг участника ${user.username}`)
    .setDescription(
      stripIndents`
      ❯ **Место в Топе:** ${pos}
      ❯ **Текущий Уровень:** ${memberStats.level}
      ❯ **Ранг:** ${rank}
      ❯ **Кол-во Опыта:** ${memberStats.xp}
      ❯ **До следующего уровня:** ${xpNeeded}
    `
    )
    .setFooter({ text: "Статистика Сгенерирована" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTimestamp();
  return { embeds: [embed] };
}
