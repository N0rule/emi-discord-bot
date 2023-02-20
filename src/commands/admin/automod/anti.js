const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "anti",
  description: "управлять различными настройками автомода для сервера",
  category: "AUTOMOD",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "ghostping <on|off>",
        description: "обнаруживать и логировать гостпинги на вашем сервере",
      },
      {
        trigger: "spam <on|off>",
        description: "включить или отключить обнаружение спама",
      },
      {
        trigger: "massmention <on|off> [threshold]",
        description: "включить или отключить обнаружение массовых упоминаний [по умолчанию — 3 упоминания]",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "ghostping",
        description: "обнаруживает и логирует гостпинги на вашем сервере",
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
        name: "spam",
        description: "включить или отключить обнаружение спама",
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
        name: "massmention",
        description: "включить или отключить обнаружение массовых упоминаний",
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
          {
            name: "threshold",
            description: "порог конфигурации (по умолчанию 3 упоминания)",
            required: false,
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
    if (sub == "ghostping") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Неверный статус. Значение должно быть `вкл/выкл`");
      response = await antiGhostPing(settings, status);
    }

    //
    else if (sub == "spam") {
      const status = args[1].toLowerCase();
      if (!["on", "off"].includes(status)) return message.safeReply("Неверный статус. Значение должно быть `вкл/выкл`");
      response = await antiSpam(settings, status);
    }

    //
    else if (sub === "massmention") {
      const status = args[1].toLowerCase();
      const threshold = args[2] || 3;
      if (!["on", "off"].includes(status)) return message.safeReply("Неверный статус. Значение должно быть `вкл/выкл`");
      response = await antiMassMention(settings, status, threshold);
    }

    //
    else response = "Неверное использование команды!";
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;
    if (sub == "ghostping") response = await antiGhostPing(settings, interaction.options.getString("status"));
    else if (sub == "spam") response = await antiSpam(settings, interaction.options.getString("status"));
    else if (sub === "massmention") {
      response = await antiMassMention(
        settings,
        interaction.options.getString("status"),
        interaction.options.getInteger("amount")
      );
    } else response = "Неверное использование команды!";

    await interaction.followUp(response);
  },
};

async function antiGhostPing(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_ghostping = status;
  await settings.save();
  return `Конфигурация сохранена! АНТИ-Гостпинги теперь ${status ? "включен" : "выключен"}`;
}

async function antiSpam(settings, input) {
  const status = input.toUpperCase() === "ON" ? true : false;
  settings.automod.anti_spam = status;
  await settings.save();
  return `Обнаружение Антиспама теперь ${status ? "включено" : "выключено"}`;
}

async function antiMassMention(settings, input, threshold) {
  const status = input.toUpperCase() === "ON" ? true : false;
  if (!status) {
    settings.automod.anti_massmention = 0;
  } else {
    settings.automod.anti_massmention = threshold;
  }
  await settings.save();
  return `Обнаружение массового упоминания теперь ${status ? "включено" : "выключено"}`;
}
