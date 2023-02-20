const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "autodelete",
  description: "управление настройками автоудаления для сервера",
  category: "AUTOMOD",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "attachments <on|off>",
        description: "разрешить или запретить вложения в сообщение",
      },
      {
        trigger: "invites <on|off>",
        description: "разрешить или запретить приглашения в сообщении",
      },
      {
        trigger: "links <on|off>",
        description: "разрешить или запретить ссылки в сообщении",
      },
      {
        trigger: "maxlines <number>",
        description: "устанавливает максимальное количество строк, разрешенных для сообщения [0 для отключения]",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "attachments",
        description: "разрешить или запретить вложения в сообщение",
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
        name: "invites",
        description: "разрешить или запретить дискорд ивайты в сообщениях",
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
        name: "links",
        description: "разрешить или запретить ссылки в сообщении",
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
        name: "maxlines",
        description: "устанавливает максимально допустимое количество строк в сообщении",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "количество строк (0 для отключения)",
            required: true,
            type: ApplicationCommandOptionType.Integer,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const settings = data.settings;
    const sub = args[0].toLowerCase();
    let response;

    if (sub == "attachments") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Неверный статус. Значение должно быть `вкл/выкл`");
      response = await antiAttachments(settings, status);
    }

    //
    else if (sub === "invites") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Неверный статус. Значение должно быть `вкл/выкл`");
      response = await antiInvites(settings, status);
    }

    //
    else if (sub == "links") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Неверный статус. Значение должно быть `вкл/выкл`");
      response = await antilinks(settings, status);
    }

    //
    else if (sub === "maxlines") {
      const max = args[1];
      if (isNaN(max) || Number.parseInt(max) < 1) {
        return message.safeReply("Максимальное количество строк должно быть числом больше 0.");
      }
      response = await maxLines(settings, max);
    }

    //
    else response = "Неверное использование команды!";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;
    let response;

    if (sub == "attachments") {
      response = await antiAttachments(settings, interaction.options.getString("status"));
    } else if (sub === "invites") response = await antiInvites(settings, interaction.options.getString("status"));
    else if (sub == "links") response = await antilinks(settings, interaction.options.getString("status"));
    else if (sub === "maxlines") response = await maxLines(settings, interaction.options.getInteger("amount"));
    else response = "Неверное использование команды!";

    await interaction.followUp(response);
  },
};

async function antiAttachments(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_attachments = status;
  await settings.save();
  return `Сообщения ${
    status ? "с вложениями теперь будут автоматически удалены" : "теперь не будет фильтроваться для вложений"
  }`;
}

async function antiInvites(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_invites = status;
  await settings.save();
  return `Сообщения ${
    status ? "с приглашениями в дискорд теперь будут автоматически удаляться" : "с приглашениями в дискорд теперь не будет фильтроваться"
  }`;
}

async function antilinks(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_links = status;
  await settings.save();
  return `Сообщения ${status ? "со ссылками теперь будут автоматически удаляться" : "теперь не будет фильтроваться для ссылок"}`;
}

async function maxLines(settings, input) {
  const lines = Number.parseInt(input);
  if (isNaN(lines)) return "Пожалуйста, введите корректный номер";

  settings.automod.max_lines = lines;
  await settings.save();
  return `${
    input === 0
      ? "Лимит максимального количества линий отключен"
      : `Сообщения длиннее чем \`${input}\` строк теперь будут автоматически удаляться`
  }`;
}
