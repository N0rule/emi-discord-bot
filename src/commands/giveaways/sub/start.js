const { ChannelType } = require("discord.js");

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').GuildTextBasedChannel} giveawayChannel
 * @param {number} duration
 * @param {string} prize
 * @param {number} winners
 * @param {import('discord.js').User} [host]
 * @param {string[]} [allowedRoles]
 */
module.exports = async (member, giveawayChannel, duration, prize, winners, host, allowedRoles = []) => {
  try {
    if (!host) host = member.user;
    if (!member.permissions.has("ManageMessages")) {
      return "Вам необходимо иметь разрешения на управление сообщениями для начала раздачи.";
    }

    if (!giveawayChannel.type === ChannelType.GuildText) {
      return "Вы можете начать раздачу только в текстовых каналах.";
    }

    /**
     * @type {import("discord-giveaways").GiveawayStartOptions}
     */
    const options = {
      duration: duration,
      prize,
      winnerCount: winners,
      hostedBy: host,
      thumbnail: "https://cdn-icons-png.flaticon.com/512/6021/6021967.png",
      messages: {
        giveaway: "🎉 **РАЗДАЧА** 🎉",
        giveawayEnded: "🎉 **РАЗДАЧА ЗАКОНЧИЛАСЬ** 🎉",
        inviteToParticipate: "Реагируйте с помощью 🎁 что-бы участвовать!",
        dropMessage: "Будьте первым, кто отреагирует с 🎁, чтобы выиграть!",
        hostedBy: `\nАвтор: {this.hostedBy}`,
        winMessage: "Поздравляю, {winners}! Вы выиграли **{this.prize}**!\n{this.messageURL}",
        winners: "**Победители:**",
        noWinner: "Раздача отменена, недостаточно участников.",
        drawing: "Начало розыгрыша {timestamp}.",
        endedAt: "Закончилось в",
        embedFooter: "{this.winnerCount} Победитель(ы)",
      },
    };

    if (allowedRoles.length > 0) {
      options.exemptMembers = (member) => !member.roles.cache.find((role) => allowedRoles.includes(role.id));
    }

    await member.client.giveawaysManager.start(giveawayChannel, options);
    return `Раздача началась в ${giveawayChannel}`;
  } catch (error) {
    member.client.logger.error("Giveaway Start", error);
    return `Произошла ошибка при запуске раздачи: ${error.message}`;
  }
};
