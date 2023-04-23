const { timeformat } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "uptime",
  description: "аптайм",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
  },

  async messageRun(message, args) {
    await message.safeReply(`Мой Аптайм: \`${timeformat(process.uptime())}\``);
  },
};
