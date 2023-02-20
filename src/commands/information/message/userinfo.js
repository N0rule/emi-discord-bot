const userInfo = require("../shared/user");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "userinfo",
  description: "показивает информацию о пользователе",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "[@member|id]",
    aliases: ["uinfo", "memberinfo"],
  },

  async messageRun(message, args) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = userInfo(target);
    await message.safeReply(response);
  },
};
