const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} member
 */
module.exports = async (member) => {
  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "Вы должны иметь разрешения на управление сообщениями для управления раздачи.";
  }

  // Search with all giveaways
  const giveaways = member.client.giveawaysManager.giveaways.filter(
    (g) => g.guildId === member.guild.id && g.ended === false
  );

  // No giveaways
  if (giveaways.length === 0) {
    return "На этом сервере сейчас нет незавершенных раздач.";
  }

  const description = giveaways.map((g, i) => `${i + 1}. ${g.prize} in <#${g.channelId}>`).join("\n");
  const color = parseInt(EMBED_COLORS.SUCCESS.replace("#", ""), 16);
  try {
    return { embeds: [{ description, color }] };
  } catch (error) {
    member.client.logger.error("Giveaway List", error);
    return `Произошла ошибка при перечислении раздач: ${error.message}`;
  }
};
