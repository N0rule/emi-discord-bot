/**
 * @param {import('discord.js').GuildMember} member
 * @param {string} messageId
 * @param {number} addDuration
 * @param {string} newPrize
 * @param {number} newWinnerCount
 */
module.exports = async (member, messageId, addDuration, newPrize, newWinnerCount) => {
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

  try {
    await member.client.giveawaysManager.edit(messageId, {
      addTime: addDuration || 0,
      newPrize: newPrize || giveaway.prize,
      newWinnerCount: newWinnerCount || giveaway.winnerCount,
    });

    return `Раздача успешно обновлена!`;
  } catch (error) {
    member.client.logger.error("Giveaway Edit", error);
    return `Произошла ошибка при обновлении раздачи: ${error.message}`;
  }
};
