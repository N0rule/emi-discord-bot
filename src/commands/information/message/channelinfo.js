const channelInfo = require("../shared/channel");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "channelinfo",
  description: "показывает информации о канале",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    usage: "[#channel|id]",
    aliases: ["chinfo"],
  },

  async messageRun(message, args) {
    let targetChannel;

    if (message.mentions.channels.size > 0) {
      targetChannel = message.mentions.channels.first();
    }

    // find channel by name/ID
    else if (args.length > 0) {
      const search = args.join(" ");
      const tcByName = message.guild.findMatchingChannels(search);
      if (tcByName.length === 0) return message.safeReply(`Не найдено подходящих каналов \`${search}\`!`);
      if (tcByName.length > 1) return message.safeReply(`Несколько каналов было найдено \`${search}\`!`);
      [targetChannel] = tcByName;
    } else {
      targetChannel = message.channel;
    }

    const response = channelInfo(targetChannel);
    await message.safeReply(response);
  },
};
