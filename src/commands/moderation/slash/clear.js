const { clearMessages } = require("@helpers/ModUtils");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "clear",
  description: "команды очистки",
  category: "MODERATION",
  userPermissions: ["ManageMessages"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "all",
        description: "Удаление всех сообщений",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "канал, из которого сообщения должны быть очищены",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "amount",
            description: "количество сообщений для удаления (макс. 99)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
      {
        name: "attachments",
        description: "удаляет все сообщений с вложениями",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "канал, из которого сообщения должны быть очищены",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "amount",
            description: "количество сообщений для удаления (макс. 99)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
      {
        name: "bots",
        description: "удаляет все сообщения от ботов",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "канал, из которого сообщения должны быть очищены",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "amount",
            description: "количество сообщений для удаления (макс. 99)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
      {
        name: "links",
        description: "удаляет все сообщения со ссылками",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "канал, из которого сообщения должны быть очищены",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "amount",
            description: "количество сообщений для удаления (макс. 99)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
      {
        name: "token",
        description: "удаляет все сообщения, содержащие указанный токен",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "канал, из которого сообщения должны быть очищены",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "token",
            description: "токен для поиска в сообщениях",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "amount",
            description: "количество сообщений для удаления (макс. 99)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
      {
        name: "user",
        description: "удалить все сообщения от указанного пользователя",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "канал, из которого сообщения должны быть очищены",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
          {
            name: "user",
            description: "пользователь, сообщения которого нужно удалить",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "amount",
            description: "количество сообщений для удаления (макс. 99)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const { options, member } = interaction;

    const sub = options.getSubcommand();
    const channel = options.getChannel("channel");
    const amount = options.getInteger("amount") || 99;

    if (amount > 100)
      return interaction.followUp("Максимальное количество сообщений которые я могу удалить составляет 99");

    let response;
    switch (sub) {
      case "all":
        response = await clearMessages(member, channel, "ALL", amount);
        break;

      case "attachments":
        response = await clearMessages(member, channel, "ATTACHMENT", amount);
        break;

      case "bots":
        response = await clearMessages(member, channel, "BOT", amount);
        break;

      case "links":
        response = await clearMessages(member, channel, "LINK", amount);
        break;

      case "token": {
        const token = interaction.options.getString("token");
        response = await clearMessages(member, channel, "TOKEN", amount, token);
        break;
      }

      case "user": {
        const user = interaction.options.getUser("user");
        response = await clearMessages(member, channel, "TOKEN", amount, user);
        break;
      }

      default:
        return interaction.followUp("🚫 Ой! Неверный выбор команды");
    }

    // Success
    if (typeof response === "number") {
      return interaction.followUp(`Успешно удалено ${response} сообщений в ${channel}`);
    }

    // Member missing permissions
    else if (response === "MEMBER_PERM") {
      return interaction.followUp(
        `У тебя нет Прав ``Прочитать историю сообщений`` и ``Управление сообщениями``, чтобы удалять сообщения в ${channel}`
      );
    }

    // Bot missing permissions
    else if (response === "BOT_PERM") {
      return interaction.followUp(
        `У меня нет Прав ``Прочитать историю сообщений`` и ``Управление сообщениями``, чтобы удалять сообщения в ${channel}`
      );
    }

    // No messages
    else if (response === "NO_MESSAGES") {
      return interaction.followUp("🚫 Не найдено сообщений, которые можно очистить");
    }

    // Remaining
    else {
      return interaction.followUp("❗ Произошла ошибка! Не удалось удалить сообщения");
    }
  },
};
