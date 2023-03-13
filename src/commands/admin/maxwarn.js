const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "maxwarn",
  description: "установить максимальное кол-во предов",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "limit <number>",
        description: "установить максимальное количество предупреждений",
      },
      {
        trigger: "action <timeout|kick|ban>",
        description: "действие для выполнения",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "limit",
        description: "установить максимальное количество предупреждений",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "максимальное количество предов",
            type: ApplicationCommandOptionType.Integer,
            required: true,
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
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    if (!["limit", "action"].includes(input)) return message.safeReply("Неверное использование команды");

    let response;
    if (input === "limit") {
      const max = parseInt(args[1]);
      if (isNaN(max) || max < 1)
        return message.safeReply("Максимальное количество предупреждений должно быть больше 0.");
      response = await setLimit(max, data.settings);
    }

    if (input === "action") {
      const action = args[1]?.toUpperCase();
      if (!action || !["TIMEOUT", "KICK", "BAN"].includes(action))
        return message.safeReply("Не допустимое действие. Допустимые действия `Timeout`/`Kick`/`Ban`");
      response = await setAction(message.guild, action, data.settings);
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();

    let response;
    if (sub === "limit") {
      response = await setLimit(interaction.options.getInteger("amount"), data.settings);
    }

    if (sub === "action") {
      response = await setAction(interaction.guild, interaction.options.getString("action"), data.settings);
    }

    await interaction.followUp(response);
  },
};

async function setLimit(limit, settings) {
  settings.max_warn.limit = limit;
  await settings.save();
  return `Конфигурация сохранена! Максимальное количество предупреждений установлено на ${limit}`;
}

async function setAction(guild, action, settings) {
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

  settings.max_warn.action = action;
  await settings.save();
  return `Конфигурация сохранена! Действие автомода настроено на ${action}`;
}
