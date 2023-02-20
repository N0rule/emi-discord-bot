const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "modlog",
  description: "включить или отключить журналы модерации",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<#channel|off>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "channel",
        description: "канал для отправки мод лога",
        required: false,
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    let targetChannel;

    if (input === "none" || input === "off" || input === "disable") targetChannel = null;
    else {
      if (message.mentions.channels.size === 0) return message.safeReply("Неверное использование команды");
      targetChannel = message.mentions.channels.first();
    }

    const response = await setChannel(targetChannel, data.settings);
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const channel = interaction.options.getChannel("channel");
    const response = await setChannel(channel, data.settings);
    return interaction.followUp(response);
  },
};

async function setChannel(targetChannel, settings) {
  if (!targetChannel && !settings.modlog_channel) {
    return "It is already disabled";
  }

  if (targetChannel && !targetChannel.canSendEmbeds()) {
    return "Тьфу! Я не могу отправлять журналы на этот канал? Мне нужны разрешения `Запись сообщений` и `Встраивание ссылок` в этом канале.";
  }

  settings.modlog_channel = targetChannel?.id;
  await settings.save();
  return `конфигурация сохранена! Канал мод лога ${targetChannel ? "обновлен" : "удален"}`;
}
