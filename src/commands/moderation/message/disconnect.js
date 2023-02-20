const disconnect = require("../shared/disconnect");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "disconnect",
  description: "отключить указанного участника от голосового канала",
  category: "MODERATION",
  userPermissions: ["MuteMembers"],
  command: {
    enabled: true,
    usage: "<ID|@member> [reason]",
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`Нет подходяшего пользователя под: ${args[0]}`);
    const reason = message.content.split(args[0])[1].trim();
    const response = await disconnect(message, target, reason);
    await message.safeReply(response);
  },
};
