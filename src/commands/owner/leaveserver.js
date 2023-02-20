/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "leaveserver",
  description: "покинуть сервер боту",
  category: "OWNER",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "<serverId>",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args, data) {
    const input = args[0];
    const guild = message.client.guilds.cache.get(input);
    if (!guild) {
      return message.safeReply(
        `Сервер не найден. Укажите действительный ID сервера.\nВы можете использовать ${data.prefix}findserver/${data.prefix}listservers чтобы найти ID сервера`
      );
    }

    const name = guild.name;
    try {
      await guild.leave();
      return message.safeReply(`Успешно вышел с  \`${name}\``);
    } catch (err) {
      message.client.logger.error("GuildLeave", err);
      return message.safeReply(`Не удалось выйти \`${name}\``);
    }
  },
};
