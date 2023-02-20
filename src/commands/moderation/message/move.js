const { ChannelType } = require("discord.js");
const move = require("../shared/move");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "move",
  description: "переместить указанного участника в голосовой канал",
  category: "MODERATION",
  userPermissions: ["DeafenMembers"],
  botPermissions: ["DeafenMembers"],
  command: {
    enabled: true,
    usage: "<ID|@member> <channel> [reason]",
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0], true);
    if (!target) return message.safeReply(`Нет подходяшего пользователя под: ${args[0]}`);

    const channels = message.guild.findMatchingChannels(args[1]);
    if (!channels.length) return message.safeReply("Подходящие каналы не найдены");
    const targetChannel = channels.pop();
    if (!targetChannel.type === ChannelType.GuildVoice && !targetChannel.type === ChannelType.GuildStageVoice) {
      return message.safeReply("Канал не является голосовым каналом");
    }

    const reason = args.slice(2).join(" ");
    const response = await move(message, target, reason, targetChannel);
    await message.safeReply(response);
  },
};
