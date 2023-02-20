const { canModerate } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "nick",
  description: "команды ников",
  category: "MODERATION",
  botPermissions: ["ManageNicknames"],
  userPermissions: ["ManageNicknames"],
  command: {
    enabled: true,
    minArgsCount: 2,
    subcommands: [
      {
        trigger: "set <@member> <name>",
        description: "устанавливает никнейм указанного участника",
      },
      {
        trigger: "reset <@member>",
        description: "сбрасывает ник участника",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "set",
        description: "изменить ник участника",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "участник, чей ник вы хотите установить",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "name",
            description: "никнейм для установки",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "reset",
        description: "сбросить ник участника",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "участник, чей ник вы хотите сбросить",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === "set") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("Не удалось найти подходящего пользователя");
      const name = args.slice(2).join(" ");
      if (!name) return message.safeReply("Пожалуйста, укажите никнейм");

      const response = await nickname(message, target, name);
      return message.safeReply(response);
    }

    //
    else if (sub === "reset") {
      const target = await message.guild.resolveMember(args[1]);
      if (!target) return message.safeReply("Не удалось найти подходящего пользователя");

      const response = await nickname(message, target);
      return message.safeReply(response);
    }
  },

  async interactionRun(interaction) {
    const name = interaction.options.getString("name");
    const target = await interaction.guild.members.fetch(interaction.options.getUser("user"));

    const response = await nickname(interaction, target, name);
    await interaction.followUp(response);
  },
};

async function nickname({ member, guild }, target, name) {
  if (!canModerate(member, target)) {
    return `Ой! Вы не можете управлять ником ${target.user.tag}`;
  }
  if (!canModerate(guild.members.me, target)) {
    return `Ой! Я не могу управлять ником ${target.user.tag}`;
  }

  try {
    await target.setNickname(name);
    return `Успешно ${name ? "изменен" : "сброшен"} никнейм ${target.user.tag}`;
  } catch (ex) {
    return `Не удалось ${name ? "изменить" : "сбросить"} никнейм ${target.displayName}. Имя точно правильное?`;
  }
}
