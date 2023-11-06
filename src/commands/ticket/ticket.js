const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  ButtonStyle,
  TextInputStyle,
  ComponentType,
} = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { isTicketChannel, closeTicket, closeAllTickets } = require("@handlers/ticket");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ticket",
  description: "Различные команды билетов поддержки",
  category: "TICKET",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "setup <#channel>",
        description: "Начните интерактивную настройку билета поддержки",
      },
      {
        trigger: "log <#channel>",
        description: "настройка канала для логов билетов поддержки",
      },
      {
        trigger: "limit <number>",
        description: "Установите максимальное количество одновременных открытых билетов",
      },
      {
        trigger: "close",
        description: "Закрыть билет поддержки",
      },
      {
        trigger: "closeall",
        description: "Закрыть все открытые билеты поддержки",
      },
      {
        trigger: "add <userId|roleId>",
        description: "добавить пользователя/роль в билет поддержки",
      },
      {
        trigger: "remove <userId|roleId>",
        description: "удалить пользователя/роль из билета поддержки",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "setup",
        description: "Настройка нового сообщения билета поддержки",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "канал, куда должно быть отправлено сообщение о создании билетов",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "log",
        description: "настройка канала для логов билетов поддержки",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "Канал, куда должны быть отправлены логи билетов",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "limit",
        description: "Установить максимальное количество одновременных открытых билетов",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "amount",
            description: "Максимальное количество билетов",
            type: ApplicationCommandOptionType.Integer,
            required: true,
          },
        ],
      },
      {
        name: "close",
        description: "Закрыть билет [используется только в билетном канале]",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "closeall",
        description: "закрыть все открытые билеты",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "add",
        description: "Добавить пользователя в текущий канал билета [используется только в канале билетов]",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user_id",
            description: "ID-пользователя для добавления",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "remove",
        description: "Удалить пользователя из билетного канала [используется только в канале билетов]",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "пользователь для удаления",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    let response;

    // Setup
    if (input === "setup") {
      if (!message.guild.members.me.permissions.has("ManageChannels")) {
        return message.safeReply("Мне не хватает `Управление каналами`, чтобы создать билетный канал");
      }
      const targetChannel = message.guild.findMatchingChannels(args[1])[0];
      if (!targetChannel) {
        return message.safeReply("Я не смог найти канал с этим именем");
      }
      return ticketModalSetup(message, targetChannel, data.settings);
    }

    // log ticket
    else if (input === "log") {
      if (args.length < 2)
        return message.safeReply("Пожалуйста, предоставьте канал, на который должны быть отправлены логи билетов");
      const target = message.guild.findMatchingChannels(args[1]);
      if (target.length === 0) return message.safeReply("Не удалось найти ни одного подходящего канала");
      response = await setupLogChannel(target[0], data.settings);
    }

    // Set limit
    else if (input === "limit") {
      if (args.length < 2) return message.safeReply("Пожалуйста, предоставьте количество");
      const limit = args[1];
      if (isNaN(limit)) return message.safeReply("Пожалуйста, предоставьте число");
      response = await setupLimit(limit, data.settings);
    }

    // Close ticket
    else if (input === "close") {
      response = await close(message, message.author);
      if (!response) return;
    }

    // Close all tickets
    else if (input === "closeall") {
      let sent = await message.safeReply("Закрытие билетов ...");
      response = await closeAll(message, message.author);
      return sent.editable ? sent.edit(response) : message.channel.send(response);
    }

    // Add user to ticket
    else if (input === "add") {
      if (args.length < 2)
        return message.safeReply("Пожалуйста, предоставьте пользователя или роль, чтобы добавить к билету");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await addToTicket(message, inputId);
    }

    // Remove user from ticket
    else if (input === "remove") {
      if (args.length < 2) return message.safeReply("Пожалуйста, предоставьте пользователя или роль для удаления");
      let inputId;
      if (message.mentions.users.size > 0) inputId = message.mentions.users.first().id;
      else if (message.mentions.roles.size > 0) inputId = message.mentions.roles.first().id;
      else inputId = args[1];
      response = await removeFromTicket(message, inputId);
    }

    // Invalid input
    else {
      return message.safeReply("Неверное использование команды");
    }

    if (response) await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    let response;

    // setup
    if (sub === "setup") {
      const channel = interaction.options.getChannel("channel");

      if (!interaction.guild.members.me.permissions.has("ManageChannels")) {
        return interaction.followUp("Мне не хватает `Управление каналами`, чтобы создать билетные каналы");
      }

      await interaction.deleteReply();
      return ticketModalSetup(interaction, channel, data.settings);
    }

    // Log channel
    else if (sub === "log") {
      const channel = interaction.options.getChannel("channel");
      response = await setupLogChannel(channel, data.settings);
    }

    // Limit
    else if (sub === "limit") {
      const limit = interaction.options.getInteger("amount");
      response = await setupLimit(limit, data.settings);
    }

    // Close
    else if (sub === "close") {
      response = await close(interaction, interaction.user);
    }

    // Close all
    else if (sub === "closeall") {
      response = await closeAll(interaction, interaction.user);
    }

    // Add to ticket
    else if (sub === "add") {
      const inputId = interaction.options.getString("user_id");
      response = await addToTicket(interaction, inputId);
    }

    // Remove from ticket
    else if (sub === "remove") {
      const user = interaction.options.getUser("user");
      response = await removeFromTicket(interaction, user.id);
    }

    if (response) await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').Message} param0
 * @param {import('discord.js').GuildTextBasedChannel} targetChannel
 * @param {object} settings
 */
async function ticketModalSetup({ guild, channel, member }, targetChannel, settings) {
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_btnSetup").setLabel("Настройка сообщения").setStyle(ButtonStyle.Primary)
  );

  const sentMsg = await channel.safeSend({
    content: "Пожалуйста, нажмите кнопку ниже, чтобы настроить сообщение билета",
    components: [buttonRow],
  });

  if (!sentMsg) return;

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "ticket_btnSetup" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return sentMsg.edit({ content: "Ответ не получен, отмена настройки", components: [] });

  // display modal
  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "ticket-modalSetup",
      title: "Установка билета",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("title")
            .setLabel("Заголовок")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("description")
            .setLabel("Описание")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("footer")
            .setLabel("Нижний колонтитул")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
      ],
    })
  );

  // receive modal input
  const modal = await btnInteraction
    .awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "ticket-modalSetup" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => {});

  if (!modal) return sentMsg.edit({ content: "Ответ не получен, отмена настройки", components: [] });

  await modal.reply("Настройка сообщения билета ...");
  const title = modal.fields.getTextInputValue("title");
  const description = modal.fields.getTextInputValue("description");
  const footer = modal.fields.getTextInputValue("footer");

  // send ticket message
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: title || "Билет Поддержки" })
    .setDescription(description || "Пожалуйста, используйте кнопку ниже, чтобы создать билет")
    .setFooter({ text: footer || "Вы можете иметь только 1 открытый билет за раз!" });

  const tktBtnRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("Открыть билет").setCustomId("TICKET_CREATE").setStyle(ButtonStyle.Success)
  );

  await targetChannel.send({ embeds: [embed], components: [tktBtnRow] });
  await modal.deleteReply();
  await sentMsg.edit({ content: "Сделано! Сообщение билета создано", components: [] });
}

async function setupLogChannel(target, settings) {
  if (!target.canSendEmbeds()) return `Упс! У меня нет разрешение на отправку embed в ${target}`;

  settings.ticket.log_channel = target.id;
  await settings.save();

  return `Конфигурация сохранена! Логи билетов будут отправлены ${target.toString()}`;
}

async function setupLimit(limit, settings) {
  if (Number.parseInt(limit, 10) < 5) return "Лимит билетов не может быть меньше 5";

  settings.ticket.limit = limit;
  await settings.save();

  return `Конфигурация сохранена. Теперь у вас может быть максимум \`${limit}\` открытых билетов`;
}

async function close({ channel }, author) {
  if (!isTicketChannel(channel)) return "Эта команда может использоваться только в каналах билетов";
  const status = await closeTicket(channel, author, "Закрыт модератором");
  if (status === "MISSING_PERMISSIONS") return "У меня нет разрешения закрывать билеты";
  if (status === "ERROR") return "Произошла ошибка при закрытии билета";
  return null;
}

async function closeAll({ guild }, user) {
  const stats = await closeAllTickets(guild, user);
  return `Завершено! Успех: \`${stats[0]}\` Неудача: \`${stats[1]}\``;
}

async function addToTicket({ channel }, inputId) {
  if (!isTicketChannel(channel)) return "Эта команда может использоваться только в канале билета";
  if (!inputId || isNaN(inputId)) return "Упс! Вам нужно ввести действительный ID-пользователя/ID-роли";

  try {
    await channel.permissionOverwrites.create(inputId, {
      ViewChannel: true,
      SendMessages: true,
    });

    return "Выполнено";
  } catch (ex) {
    return "Не удалось добавить пользователя/роль. Вы предоставили действительный ID?";
  }
}

async function removeFromTicket({ channel }, inputId) {
  if (!isTicketChannel(channel)) return "Эта команда может использоваться только в канале билета";
  if (!inputId || isNaN(inputId)) return "Упс! Вам нужно ввести действительный ID-пользователя/ID-роли";

  try {
    channel.permissionOverwrites.create(inputId, {
      ViewChannel: false,
      SendMessages: false,
    });
    return "Выполнено";
  } catch (ex) {
    return "Не удалось удалить пользователя/роль. Вы предоставили действительный ID?";
  }
}
