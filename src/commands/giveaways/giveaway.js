const {
  ChannelType,
  ButtonBuilder,
  ActionRowBuilder,
  ComponentType,
  TextInputStyle,
  TextInputBuilder,
  ModalBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
} = require("discord.js");
const { parsePermissions } = require("@helpers/Utils");
const ems = require("enhanced-ms");

// Sub Commands
const start = require("./sub/start");
const pause = require("./sub/pause");
const resume = require("./sub/resume");
const end = require("./sub/end");
const reroll = require("./sub/reroll");
const list = require("./sub/list");
const edit = require("./sub/edit");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "giveaway",
  description: "команды раздачи",
  category: "GIVEAWAY",
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "start <#channel>",
        description: "Настройка новой раздачи",
      },
      {
        trigger: "pause <messageId>",
        description: "Пауза раздача",
      },
      {
        trigger: "resume <messageId>",
        description: "возобновить раздачу",
      },
      {
        trigger: "end <messageId>",
        description: "Завершить раздачу",
      },
      {
        trigger: "reroll <messageId>",
        description: "Повторная раздача",
      },
      {
        trigger: "list",
        description: "Перечислить все раздачи",
      },
      {
        trigger: "edit <messageId>",
        description: "Редактировать раздачу",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "start",
        description: "начаать раздачу",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "Канал, чтобы начать раздачу в",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "pause",
        description: "Пауза раздача",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message_id",
            description: "ID-сообщения о раздаче",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "resume",
        description: "возобновить раздачу",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message_id",
            description: "ID-сообщения о раздаче",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "end",
        description: "Завершить раздачу",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message_id",
            description: "ID-сообщения о раздаче",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "reroll",
        description: "Повторная раздача",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message_id",
            description: "ID-сообщения о раздаче",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "list",
        description: "Перечислить все раздачи",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "edit",
        description: "Редактировать раздачу",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "message_id",
            description: "ID-сообщения о раздаче",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "add_duration",
            description: "количество минут, чтобы добавить к продолжительности раздачи",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
          {
            name: "new_prize",
            description: "Новый приз",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
          {
            name: "new_winners",
            description: "новое количество победителей",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0]?.toLowerCase();
    let response;

    //
    if (sub === "start") {
      if (!args[1])
        return message.safeReply("Неверное использование! Пожалуйста, предоставьте канал, чтобы начать раздачу");
      const match = message.guild.findMatchingChannels(args[1]);
      if (!match.length) return message.safeReply(`Никакой канал не найден в соответствии с ${args[1]}`);
      return await runModalSetup(message, match[0]);
    }

    //
    else if (sub === "pause") {
      const messageId = args[1];
      response = await pause(message.member, messageId);
    }

    //
    else if (sub === "resume") {
      const messageId = args[1];
      response = await resume(message.member, messageId);
    }

    //
    else if (sub === "end") {
      const messageId = args[1];
      response = await end(message.member, messageId);
    }

    //
    else if (sub === "reroll") {
      const messageId = args[1];
      response = await reroll(message.member, messageId);
    }

    //
    else if (sub === "list") {
      response = await list(message.member);
    }

    //
    else if (sub === "edit") {
      const messageId = args[1];
      if (!messageId) return message.safeReply("Неверное использование! Пожалуйста, предоставьте ID-сообщения");
      return await runModalEdit(message, messageId);
    }

    //
    else response = "Не действительная под-команда";

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response;

    //
    if (sub === "start") {
      const channel = interaction.options.getChannel("channel");
      await interaction.followUp("Starting Giveaway system...");
      return await runModalSetup(interaction, channel);
    }

    //
    else if (sub === "pause") {
      const messageId = interaction.options.getString("message_id");
      response = await pause(interaction.member, messageId);
    }

    //
    else if (sub === "resume") {
      const messageId = interaction.options.getString("message_id");
      response = await resume(interaction.member, messageId);
    }

    //
    else if (sub === "end") {
      const messageId = interaction.options.getString("message_id");
      response = await end(interaction.member, messageId);
    }

    //
    else if (sub === "reroll") {
      const messageId = interaction.options.getString("message_id");
      response = await reroll(interaction.member, messageId);
    }

    //
    else if (sub === "list") {
      response = await list(interaction.member);
    }

    //
    else if (sub === "edit") {
      const messageId = interaction.options.getString("message_id");
      const addDur = interaction.options.getInteger("add_duration");
      const addDurationMs = addDur ? ems(addDur) : null;
      if (!addDurationMs) {
        return interaction.followUp("Недопустимая продолжительность");
      }
      const newPrize = interaction.options.getString("new_prize");
      const newWinnerCount = interaction.options.getInteger("new_winners");
      response = await edit(interaction.member, messageId, addDurationMs, newPrize, newWinnerCount);
    }

    //
    else response = "Не действительная под-команда";

    await interaction.followUp(response);
  },
};

// Modal Giveaway setup
/**
 * @param {import('discord.js').Message|import('discord.js').CommandInteraction} args0
 * @param {import('discord.js').GuildTextBasedChannel} targetCh
 */
async function runModalSetup({ member, channel, guild }, targetCh) {
  const SETUP_PERMS = ["ViewChannel", "SendMessages", "EmbedLinks"];

  // validate channel perms
  if (!targetCh) return channel.safeSend("Раздача была отменена. Вы не упомянули канал");
  if (!targetCh.type === ChannelType.GuildText && !targetCh.permissionsFor(guild.members.me).has(SETUP_PERMS)) {
    return channel.safeSend(
      `Раздача была отменена.\nМне нужно право на ${parsePermissions(SETUP_PERMS)} в ${targetCh}`
    );
  }

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("giveaway_btnSetup").setLabel("Настройка Раздачи").setStyle(ButtonStyle.Primary)
  );

  const sentMsg = await channel.safeSend({
    content: "Пожалуйста, нажмите кнопку ниже, чтобы настроить новую раздачу",
    components: [buttonRow],
  });

  if (!sentMsg) return;

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "giveaway_btnSetup" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return sentMsg.edit({ content: "Ответ не получен, отмена настройки", components: [] });

  // display modal
  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "giveaway-modalSetup",
      title: "Настройка Giveaway",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("duration")
            .setLabel("Какова продолжительность?")
            .setPlaceholder("1h / 1d / 1w")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("prize")
            .setLabel("Какой приз?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("winners")
            .setLabel("Количество победителей?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("roles")
            .setLabel("ID-ролей, которые принимают участие")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("host")
            .setLabel("ID-пользователя, начинающего раздачу")
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
      filter: (m) => m.customId === "giveaway-modalSetup" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => {});

  if (!modal) return sentMsg.edit({ content: "Ответ не получен, отмена настройки", components: [] });

  sentMsg.delete().catch(() => {});
  await modal.reply("Настройка раздача ...");

  // duration
  const duration = ems(modal.fields.getTextInputValue("duration"));
  if (isNaN(duration))
    return modal.editReply("Настройка была отменена. Вы не указали действительную продолжительность");

  // prize
  const prize = modal.fields.getTextInputValue("prize");

  // winner count
  const winners = parseInt(modal.fields.getTextInputValue("winners"));
  if (isNaN(winners))
    return modal.editReply("Настройка была отменена. Вы не указали действительное количество победителей");

  // roles
  const allowedRoles =
    modal.fields
      .getTextInputValue("roles")
      ?.split(",")
      ?.filter((roleId) => guild.roles.cache.get(roleId.trim())) || [];

  // host
  const hostId = modal.fields.getTextInputValue("host");
  let host = null;
  if (hostId) {
    try {
      host = await guild.client.users.fetch(hostId);
    } catch (ex) {
      return modal.editReply("Настройка была отменена. Вам нужно предоставить действительный ID для хоста");
    }
  }

  const response = await start(member, targetCh, duration, prize, winners, host, allowedRoles);
  await modal.editReply(response);
}

// Interactive Giveaway Update
/**
 * @param {import('discord.js').Message} message
 * @param {string} messageId
 */
async function runModalEdit(message, messageId) {
  const { member, channel } = message;

  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("giveaway_btnEdit").setLabel("Редактировать раздачу").setStyle(ButtonStyle.Primary)
  );

  const sentMsg = await channel.send({
    content: "Пожалуйста, нажмите кнопку ниже, чтобы отредактировать раздачу.",
    components: [buttonRow],
  });

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "giveaway_btnEdit" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return sentMsg.edit({ content: "Нет ответа, отмена обновления", components: [] });

  // display modal
  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "giveaway-modalEdit",
      title: "Обновление раздачи",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("duration")
            .setLabel("Какова продолжительность?")
            .setPlaceholder("1h / 1d / 1w")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("prize")
            .setLabel("Какой приз?")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("winners")
            .setLabel("Количество победителей?")
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
      filter: (m) => m.customId === "giveaway-modalEdit" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => {});

  if (!modal) return sentMsg.edit({ content: "Ответ не получен, отмена настройки", components: [] });

  sentMsg.delete().catch(() => {});
  await modal.reply("Обновление раздача ...");

  // duration
  const addDuration = ems(modal.fields.getTextInputValue("duration"));
  if (isNaN(addDuration))
    return modal.editReply("Обновление было отменено. Вы не указали действительную продолжительность");

  // prize
  const newPrize = modal.fields.getTextInputValue("prize");

  // winner count
  const newWinnerCount = parseInt(modal.fields.getTextInputValue("winners"));
  if (isNaN(newWinnerCount)) {
    return modal.editReply("Обновление было отменено. Вы не указали действительное количество победителей");
  }

  const response = await edit(message.member, messageId, addDuration, newPrize, newWinnerCount);
  await modal.editReply(response);
}
