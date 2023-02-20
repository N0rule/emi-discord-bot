const { EmbedBuilder, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "automod",
  description: "различные конфигурации автомодов",
  category: "AUTOMOD",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "status",
        description: "проверьть конфигурацию автомода для этого сервера",
      },
      {
        trigger: "strikes <number>",
        description: "максимальное количество предупреждений, прежде чем получить действие",
      },
      {
        trigger: "action <TIMEOUT|KICK|BAN>",
        description: "установить действие",
      },
      {
        trigger: "debug <on|off>",
        description: "включает автомод для сообщений, отправленных администраторами и модераторами",
      },
      {
        trigger: "whitelist",
        description: "список каналов, занесенных в белый список",
      },
      {
        trigger: "whitelistadd <channel>",
        description: "добавить канал в белый список",
      },
      {
        trigger: "whitelistremove <channel>",
        description: "удалить канал из белого списка",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "проверить конфигурацию автомода",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "strikes",
        description: "максимальное количество предупреждений, прежде чем получить действие",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "количество предупреждений (по умолчанию 5)",
            required: true,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
      {
        name: "action",
        description: "установить действие",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "action",
            description: "действие для выполнения",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              {
                name: "TIMEOUT",
                value: "TIMEOUT",
              },
              {
                name: "KICK",
                value: "KICK",
              },
              {
                name: "BAN",
                value: "BAN",
              },
            ],
          },
        ],
      },
      {
        name: "debug",
        description: "вкл/выкл автомод для сообщений, отправленных администраторами и модераторами",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "статус конфигурации",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "ON",
                value: "ON",
              },
              {
                name: "OFF",
                value: "OFF",
              },
            ],
          },
        ],
      },
      {
        name: "whitelist",
        description: "просмотреть каналы из белого списка",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "whitelistadd",
        description: "добавить канал в белый список",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "канал для добавления",
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "whitelistremove",
        description: "удалить канал из белого списка",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "канал для удаления",
            required: true,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    const settings = data.settings;

    let response;
    if (input === "status") {
      response = await getStatus(settings, message.guild);
    } else if (input === "strikes") {
      const strikes = args[1];
      if (isNaN(strikes) || Number.parseInt(strikes) < 1) {
        return message.safeReply("Количество предупреждений должно быть больше 0.");
      }
      response = await setStrikes(settings, strikes);
    } else if (input === "action") {
      const action = args[1].toUpperCase();
      if (!action || !["TIMEOUT", "KICK", "BAN"].includes(action))
        return message.safeReply("Не допустимое действие. Допустимые действия `Timeout`/`Kick`/`Ban`");
      response = await setAction(settings, message.guild, action);
    } else if (input === "debug") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Неверный статус. Значение должно быть `вкл/выкл`");
      response = await setDebug(settings, status);
    }

    // whitelist
    else if (input === "whitelist") {
      response = getWhitelist(message.guild, settings);
    }

    // whitelist add
    else if (input === "whitelistadd") {
      const match = message.guild.findMatchingChannels(args[1]);
      if (!match.length) return message.safeReply(`не найдено канала подходящего ${args[1]}`);
      response = await whiteListAdd(settings, match[0].id);
    }

    // whitelist remove
    else if (input === "whitelistremove") {
      const match = message.guild.findMatchingChannels(args[1]);
      if (!match.length) return message.safeReply(`не найдено канала подходящего ${args[1]}`);
      response = await whiteListRemove(settings, match[0].id);
    }

    //
    else response = "Неверное использование команды!";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;

    if (sub === "status") response = await getStatus(settings, interaction.guild);
    else if (sub === "strikes") response = await setStrikes(settings, interaction.options.getInteger("amount"));
    else if (sub === "action")
      response = await setAction(settings, interaction.guild, interaction.options.getString("action"));
    else if (sub === "debug") response = await setDebug(settings, interaction.options.getString("status"));
    else if (sub === "whitelist") {
      response = getWhitelist(interaction.guild, settings);
    } else if (sub === "whitelistadd") {
      const channelId = interaction.options.getChannel("channel").id;
      response = await whiteListAdd(settings, channelId);
    } else if (sub === "whitelistremove") {
      const channelId = interaction.options.getChannel("channel").id;
      response = await whiteListRemove(settings, channelId);
    }

    await interaction.followUp(response);
  },
};

async function getStatus(settings, guild) {
  const { automod } = settings;

  const logChannel = settings.modlog_channel
    ? guild.channels.cache.get(settings.modlog_channel).toString()
    : "Not Configured";

  // String Builder
  let desc = stripIndent`
    ❯ **Макс Линий**: ${automod.max_lines || "NA"}
    ❯ **Анти-МассУпоминания**: ${automod.anti_massmention > 0 ? "✓" : "✕"}
    ❯ **Анти-Вложения**: ${automod.anti_attachment ? "✓" : "✕"}
    ❯ **Анти-Ссылки**: ${automod.anti_links ? "✓" : "✕"}
    ❯ **Анти-Инвайт**: ${automod.anti_invites ? "✓" : "✕"}
    ❯ **Анти-Спам**: ${automod.anti_spam ? "✓" : "✕"}
    ❯ **Анти-Гостпинг**: ${automod.anti_ghostping ? "✓" : "✕"}
  `;

  const embed = new EmbedBuilder()
    .setAuthor({ name: "Конфигурация автомода", iconURL: guild.iconURL() })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setDescription(desc)
    .addFields(
      {
        name: "Канал Логов",
        value: logChannel,
        inline: true,
      },
      {
        name: "Макс Предов",
        value: automod.strikes.toString(),
        inline: true,
      },
      {
        name: "Действие",
        value: automod.action,
        inline: true,
      },
      {
        name: "Дебаг",
        value: automod.debug ? "✓" : "✕",
        inline: true,
      }
    );

  return { embeds: [embed] };
}

async function setStrikes(settings, strikes) {
  settings.automod.strikes = strikes;
  await settings.save();
  return `Конфигурация сохранена! Максимальное количество предупреждений установлено на ${strikes}`;
}

async function setAction(settings, guild, action) {
  if (action === "TIMEOUT") {
    if (!guild.members.me.permissions.has("ModerateMembers")) {
      return "У меня нет прав для тайм-аута участников";
    }
  }

  if (action === "KICK") {
    if (!guild.members.me.permissions.has("KickMembers")) {
      return "У меня нет прав для кика участников";
    }
  }

  if (action === "BAN") {
    if (!guild.members.me.permissions.has("BanMembers")) {
      return "У меня нет прав для бана участников";
    }
  }

  settings.automod.action = action;
  await settings.save();
  return `Конфигурация сохранена! Действие автомода установлено на ${action}`;
}

async function setDebug(settings, input) {
  const status = input.toLowerCase() === "on" ? true : false;
  settings.automod.debug = status;
  await settings.save();
  return `Конфигурация сохранена! Дебаг автомода теперь ${status ? "включен" : "выключен"}`;
}

function getWhitelist(guild, settings) {
  const whitelist = settings.automod.wh_channels;
  if (!whitelist || !whitelist.length) return "Нет каналов в белом списке";

  const channels = [];
  for (const channelId of whitelist) {
    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;
    if (channel) channels.push(channel.toString());
  }

  return `Каналы из белого списка: ${channels.join(", ")}`;
}

async function whiteListAdd(settings, channelId) {
  if (settings.automod.wh_channels.includes(channelId)) return "Канал уже в белом списке";
  settings.automod.wh_channels.push(channelId);
  await settings.save();
  return `Канал в белом списке!`;
}

async function whiteListRemove(settings, channelId) {
  if (!settings.automod.wh_channels.includes(channelId)) return "Канал не внесен в белый список";
  settings.automod.wh_channels.splice(settings.automod.wh_channels.indexOf(channelId), 1);
  await settings.save();
  return `Канал удален из белого списка!`;
}
