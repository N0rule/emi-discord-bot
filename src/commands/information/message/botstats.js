const botstats = require("../shared/botstats");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "botstats",
<<<<<<< HEAD
  description: "показывает информацию о боте",
=======
  description: "показивает информацию о боте",
>>>>>>> 2e79b8e (Private per merge)
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
