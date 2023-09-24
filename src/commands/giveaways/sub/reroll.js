/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return "Вы должны предоставить действительный ID-сообщения.";

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "Вам необходимо иметь разрешения на управление сообщениями для начала раздачи.";
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return `Невозможно найти раздачу для этого ID-сообщения: ${messageId}`;

  // Check if the giveaway is ended
  if (!giveaway.ended) return "The giveaway is not ended yet.";

  try {
    await giveaway.reroll();
    return "Giveaway rerolled!";
  } catch (error) {
    member.client.logger.error("Giveaway Reroll", error);
    return `An error occurred while rerolling the giveaway: ${error.message}`;
  }
};
