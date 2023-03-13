const { ApplicationCommandOptionType } = require("discord.js");
const balance = require("./sub/balance");
const deposit = require("./sub/deposit");
const transfer = require("./sub/transfer");
const withdraw = require("./sub/withdraw");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "bank",
  description: "доступ к банковским операциям",
  category: "ECONOMY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "balance",
        description: "проверить свой баланс",
      },
      {
        trigger: "deposit <coins>",
        description: "внести монеты на свой банковский счет",
      },
      {
        trigger: "withdraw <coins>",
        description: "снять монеты со своего банковского счета",
      },
      {
        trigger: "transfer <user> <coins>",
        description: "перевести монеты другому пользователю",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "balance",
        description: "проверить баланс монет",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "имя пользователя",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "deposit",
        description: "внести монеты на свой банковский счет",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "coins",
            description: "количество монет для депозита",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "withdraw",
        description: "снять монеты со своего банковского счета",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "coins",
            description: "количество монет для вывода",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "transfer",
        description: "перевести монеты другому пользователю",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "пользователь, которому должны быть переведены монеты",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "coins",
            description: "количество монет для перевода",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0];
    let response;

    if (sub === "balance") {
      const resolved = (await message.guild.resolveMember(args[1])) || message.member;
      response = await balance(resolved.user);
    }

    //
    else if (sub === "deposit") {
      const coins = args.length && parseInt(args[1]);
      if (isNaN(coins)) return message.safeReply("Укажите действительное количество монет, которые вы хотите внести");
      response = await deposit(message.author, coins);
    }

    //
    else if (sub === "withdraw") {
      const coins = args.length && parseInt(args[1]);
      if (isNaN(coins)) return message.safeReply("Укажите действительное количество монет, которые вы хотите вывести");
      response = await withdraw(message.author, coins);
    }

    //
    else if (sub === "transfer") {
      if (args.length < 3) return message.safeReply("Укажите действительного пользователя и монеты для перевода");
      const target = await message.guild.resolveMember(args[1], true);
      if (!target) return message.safeReply("Укажите действительного пользователя для перевода монет");
      const coins = parseInt(args[2]);
      if (isNaN(coins))
        return message.safeReply("Укажите действительное количество монет, которые вы хотите перевести");
      response = await transfer(message.author, target.user, coins);
    }

    //
    else {
      return message.safeReply("Недопустимое использование команды");
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response;

    // balance
    if (sub === "balance") {
      const user = interaction.options.getUser("user") || interaction.user;
      response = await balance(user);
    }

    // deposit
    else if (sub === "deposit") {
      const coins = interaction.options.getInteger("coins");
      response = await deposit(interaction.user, coins);
    }

    // withdraw
    else if (sub === "withdraw") {
      const coins = interaction.options.getInteger("coins");
      response = await withdraw(interaction.user, coins);
    }

    // transfer
    else if (sub === "transfer") {
      const user = interaction.options.getUser("user");
      const coins = interaction.options.getInteger("coins");
      response = await transfer(interaction.user, user, coins);
    }

    await interaction.followUp(response);
  },
};
