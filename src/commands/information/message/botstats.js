const botstats = require("../shared/botstats");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "botstats",
  description: "показывает информацию о боте",
  category: "INFORMATION",
  userPermissions: ["ManageGuild"],
  botPermissions: ["EmbedLinks"],
  cooldown: 10,
  command: {
    enabled: true,
    aliases: ["botstat", "botinfo"],
  },

  async messageRun(message, args) {
    const response = botstats(message.client);
    await message.safeReply(response);
  },
};
