const { approveSuggestion, rejectSuggestion } = require("@handlers/suggestion");
const { parsePermissions } = require("@helpers/Utils");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

const CHANNEL_PERMS = ["ViewChannel", "SendMessages", "EmbedLinks", "ManageMessages", "ReadMessageHistory"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "suggestion",
  description: "Настройка системы предложений",
  category: "SUGGESTION",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "status <on|off>",
        description: "Включить/отключить систему предложений",
      },
      {
        trigger: "channel <#channel|off>",
        description: "Настроить канал предложений или отключить его",
      },
      {
        trigger: "appch <#channel>",
        description: "Настроить канал утвержденных предложений или отключить его",
      },
      {
        trigger: "rejch <#channel>",
        description: "Настроить отклоненные предложения канала или отключить его",
      },
      {
        trigger: "approve <channel> <messageId> [reason]",
        description: "одобрить предложение",
      },
      {
        trigger: "reject <channel> <messageId> [reason]",
        description: "отвергнуть предложение",
      },
      {
        trigger: "staffadd <roleId>",
        description: "Добавить роль администратора",
      },
      {
        trigger: "staffremove <roleId>",
        description: "удалить роль администратора",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "Включить/отключить систему предложений",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "включено или отключено",
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
        name: "channel",
        description: "Настроить канал предложений или отключить его",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "канал, куда будут отправлены предложения",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "appch",
        description: "Настроить канал утвержденных предложений или отключить его",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "канал, где будут отправлены утвержденные предложения",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "rejch",
        description: "Настроить отклоненные предложения канала или отключить его",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "канал, куда будут отправлены отклоненные предложения",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: false,
          },
        ],
      },
      {
        name: "approve",
        description: "одобрить предложение",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "канал, где существует сообщение",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "message_id",
            description: "ID-сообщения предложения",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "reason",
            description: "причина для одобрения",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "reject",
        description: "отвергнуть предложение",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel_name",
            description: "канал, где существует сообщение",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "message_id",
            description: "ID-сообщения предложения",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "reason",
            description: "причина для отказа",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "staffadd",
        description: "Добавить роль администратора",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "роль, которую нужно добавить в качестве администратора",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
      {
        name: "staffremove",
        description: "удалить роль администратора",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "role",
            description: "роль, которую нужно удалить в качестве администратора",
            type: ApplicationCommandOptionType.Role,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const sub = args[0];
    let response;

    // status
    if (sub == "status") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Неверный статус. Значение должно быть `on/off`");
      response = await setStatus(data.settings, status);
    }

    // channel
    else if (sub == "channel") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Подходящие каналы не найдены для ${input}`;
      else if (matched.length > 1) response = `Найдено много подходящих каналов для ${input}. Пожалуйста, будьте более конкретны.`;
      else response = await setChannel(data.settings, matched[0]);
    }

    // appch
    else if (sub == "appch") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Подходящие каналы не найдены для ${input}`;
      else if (matched.length > 1) response = `Найдено много подходящих каналов для ${input}. Пожалуйста, будьте более конкретны.`;
      else response = await setApprovedChannel(data.settings, matched[0]);
    }

    // appch
    else if (sub == "rejch") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Подходящие каналы не найдены для ${input}`;
      else if (matched.length > 1) response = `Найдено много подходящих каналов для ${input}. Пожалуйста, будьте более конкретны.`;
      else response = await setRejectedChannel(data.settings, matched[0]);
    }

    // approve
    else if (sub == "approve") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Подходящие каналы не найдены для ${input}`;
      else if (matched.length > 1) response = `Найдено много подходящих каналов для ${input}. Пожалуйста, будьте более конкретны.`;
      else {
        const messageId = args[2];
        const reason = args.slice(3).join(" ");
        response = await approveSuggestion(message.member, matched[0], messageId, reason);
      }
    }

    // reject
    else if (sub == "reject") {
      const input = args[1];
      let matched = message.guild.findMatchingChannels(input);
      if (matched.length == 0) response = `Подходящие каналы не найдены для ${input}`;
      else if (matched.length > 1) response = `Найдено много подходящих каналов для ${input}. Пожалуйста, будьте более конкретны.`;
      else {
        const messageId = args[2];
        const reason = args.slice(3).join(" ");
        response = await rejectSuggestion(message.member, matched[0], messageId, reason);
      }
    }

    // staffadd
    else if (sub == "staffadd") {
      const input = args[1];
      let matched = message.guild.findMatchingRoles(input);
      if (matched.length == 0) response = `Не найдено подходящих ролей для ${input}`;
      else if (matched.length > 1) response = `Найдено много подходящих ролей для ${input}. Пожалуйста, будьте более конкретны.`;
      else response = await addStaffRole(data.settings, matched[0]);
    }

    // staffremove
    else if (sub == "staffremove") {
      const input = args[1];
      let matched = message.guild.findMatchingRoles(input);
      if (matched.length == 0) response = `Не найдено подходящих ролей для ${input}`;
      else if (matched.length > 1) response = `Найдено много подходящих ролей для ${input}. Пожалуйста, будьте более конкретны.`;
      else response = await removeStaffRole(data.settings, matched[0]);
    }

    // else
    else response = "Не действительный подкоманда";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // status
    if (sub == "status") {
      const status = interaction.options.getString("status");
      response = await setStatus(data.settings, status);
    }

    // channel
    else if (sub == "channel") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setChannel(data.settings, channel);
    }

    // app_channel
    else if (sub == "appch") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setApprovedChannel(data.settings, channel);
    }

    // rej_channel
    else if (sub == "rejch") {
      const channel = interaction.options.getChannel("channel_name");
      response = await setRejectedChannel(data.settings, channel);
    }

    // approve
    else if (sub == "approve") {
      const channel = interaction.options.getChannel("channel_name");
      const messageId = interaction.options.getString("message_id");
      response = await approveSuggestion(interaction.member, channel, messageId);
    }

    // reject
    else if (sub == "reject") {
      const channel = interaction.options.getChannel("channel_name");
      const messageId = interaction.options.getString("message_id");
      response = await rejectSuggestion(interaction.member, channel, messageId);
    }

    // staffadd
    else if (sub == "staffadd") {
      const role = interaction.options.getRole("role");
      response = await addStaffRole(data.settings, role);
    }

    // staffremove
    else if (sub == "staffremove") {
      const role = interaction.options.getRole("role");
      response = await removeStaffRole(data.settings, role);
    }

    // else
    else response = "Не действительный подкоманда";
    await interaction.followUp(response);
  },
};

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.suggestions.enabled = enabled;
  await settings.save();
  return `Конфигурация сохранена! Система предложений сейчас ${enabled ? "включена" : "отключена"}`;
}

async function setChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.channel_id = null;
    await settings.save();
    return "Система предложений теперь отключена";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `Мне нужны следующие разрешения в ${channel}\n${parsePermissions(CHANNEL_PERMS)}`;
  }

  settings.suggestions.channel_id = channel.id;
  await settings.save();
  return `Предложения теперь будут отправлены ${channel}`;
}

async function setApprovedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.approved_channel = null;
    await settings.save();
    return "Утвержденный предложение канал теперь отключен";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `Мне нужны следующие разрешения в ${channel}\n${parsePermissions(CHANNEL_PERMS)}`;
  }

  settings.suggestions.approved_channel = channel.id;
  await settings.save();
  return `Утвержденные предложения теперь будут отправлены в ${channel}`;
}

async function setRejectedChannel(settings, channel) {
  if (!channel) {
    settings.suggestions.rejected_channel = null;
    await settings.save();
    return "Предложение отклонено канал теперь отключен";
  }

  if (!channel.permissionsFor(channel.guild.members.me).has(CHANNEL_PERMS)) {
    return `Мне нужны следующие разрешения в ${channel}\n${parsePermissions(CHANNEL_PERMS)}`;
  }

  settings.suggestions.rejected_channel = channel.id;
  await settings.save();
  return `Отклоненные предложения теперь будут отправлены в ${channel}`;
}

async function addStaffRole(settings, role) {
  if (settings.suggestions.staff_roles.includes(role.id)) {
    return `\`${role.name}\` уже является ролью персонала`;
  }
  settings.suggestions.staff_roles.push(role.id);
  await settings.save();
  return `\`${role.name}\` Сейчас является роль персонала`;
}

async function removeStaffRole(settings, role) {
  if (!settings.suggestions.staff_roles.includes(role.id)) {
    return `${role} не является ролью персонала`;
  }
  settings.suggestions.staff_roles.splice(settings.suggestions.staff_roles.indexOf(role.id), 1);
  await settings.save();
  return `\`${role.name}\` больше не является ролью персонала`;
}
