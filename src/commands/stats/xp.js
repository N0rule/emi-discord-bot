const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "levelup",
  description: "Настройка систему уровней",
  category: "STATS",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "message <new-message>",
        description: "Установить пользовательское сообщение об уровне",
      },
      {
        trigger: "channel <#channel|off>",
        description: "установить канал для отправки сообщений об уровне",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "message",
        description: "Установить пользовательское сообщение об уровне",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message",
            description: "Сообщение для отображения, когда пользователь повышает уровень",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "channel",
        description: "установить канал для отправки сообщений об повышении уровня",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "канал для отправки сообщений повышения уровня",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0];
    const subcommandArgs = args.slice(1);
    let response;

    // message
    if (sub === "message") {
      const message = subcommandArgs.join(" ");
      response = await setMessage(message, data.settings);
    }

    // channel
    else if (sub === "channel") {
      const input = subcommandArgs[0];
      let channel;

      if (input === "off") channel = "off";
      else {
        const match = message.guild.findMatchingChannels(input);
        if (match.length === 0)
          return message.safeReply("Недействительный канал. Пожалуйста,предоставьте действительный канал");
        channel = match[0];
      }
      response = await setChannel(channel, data.settings);
    }

    // invalid
    else response = "Неверная субкоманда";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    if (sub === "message") response = await setMessage(interaction.options.getString("message"), data.settings);
    else if (sub === "channel") response = await setChannel(interaction.options.getChannel("channel"), data.settings);
    else response = "Неверная субкоманда";

    await interaction.followUp(response);
  },
};

async function setMessage(message, settings) {
  if (!message) return "Неправильное сообщение. Пожалуйста предоставте правильное сообщение";
  settings.stats.xp.message = message;
  await settings.save();
  return `Конфигурация сохранена. Сообщение о повышении уровня обновлено!`;
}

async function setChannel(channel, settings) {
  if (!channel) return "Недействительный канал. Пожалуйста,предоставьте действительный канал";

  if (channel === "off") settings.stats.xp.channel = null;
  else settings.stats.xp.channel = channel.id;

  await settings.save();
  return `Конфигурация сохранена. Сообщение о повышении уровня обновлено!`;
}
