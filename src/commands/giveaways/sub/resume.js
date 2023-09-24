/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 */
module.exports = async (member, messageId) => {
  if (!messageId) return "Вы должны предоставить действительный ID-сообщения.";

  // Permissions
  if (!member.permissions.has("ManageMessages")) {
    return "Вы должны иметь разрешения на управление сообщениями для управления раздачами.";
  }

  // Search with messageId
  const giveaway = member.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === messageId && g.guildId === member.guild.id
  );

  // If no giveaway was found
  if (!giveaway) return `Невозможно найти раздачу для этого ID-сообщения: ${messageId}`;

  // Check if the giveaway is unpaused
  if (!giveaway.pauseOptions.isPaused) return "Эта раздача не приостановлен.";

  try {
    await giveaway.unpause();
    return "Успех! Раздача возобновлена!";
  } catch (error) {
    member.client.logger.error("Giveaway Resume", error);
    return `Произошла ошибка во время возобновления раздачи: ${error.message}`;
  }
};
