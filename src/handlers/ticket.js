const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  StringSelectMenuBuilder,
  ComponentType,
} = require("discord.js");
const { TICKET } = require("@root/config.js");

// schemas
const { getSettings } = require("@schemas/Guild");

// helpers
const { postToBin } = require("@helpers/HttpUtils");
const { error } = require("@helpers/Logger");

const OPEN_PERMS = ["ManageChannels"];
const CLOSE_PERMS = ["ManageChannels", "ReadMessageHistory"];

/**
 * @param {import('discord.js').Channel} channel
 */
function isTicketChannel(channel) {
  return (
    channel.type === ChannelType.GuildText &&
    channel.name.startsWith("билет-") &&
    channel.topic &&
    channel.topic.startsWith("билет|")
  );
}

/**
 * @param {import('discord.js').Guild} guild
 */
function getTicketChannels(guild) {
  return guild.channels.cache.filter((ch) => isTicketChannel(ch));
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {string} userId
 */
function getExistingTicketChannel(guild, userId) {
  const tktChannels = getTicketChannels(guild);
  return tktChannels.filter((ch) => ch.topic.split("|")[1] === userId).first();
}

/**
 * @param {import('discord.js').BaseGuildTextChannel} channel
 */
async function parseTicketDetails(channel) {
  if (!channel.topic) return;
  const split = channel.topic?.split("|");
  const userId = split[1];
  const catName = split[2] || "по умолчанию";
  const user = await channel.client.users.fetch(userId, { cache: false }).catch(() => {});
  return { user, catName };
}

/**
 * @param {import('discord.js').BaseGuildTextChannel} channel
 * @param {import('discord.js').User} closedBy
 * @param {string} [reason]
 */
async function closeTicket(channel, closedBy, reason) {
  if (!channel.deletable || !channel.permissionsFor(channel.guild.members.me).has(CLOSE_PERMS)) {
    return "MISSING_PERMISSIONS";
  }

  try {
    const config = await getSettings(channel.guild);
    const messages = await channel.messages.fetch();
    const reversed = Array.from(messages.values()).reverse();

    let content = "";
    reversed.forEach((m) => {
      content += `[${new Date(m.createdAt).toLocaleString("en-US")}] - ${m.author.username}\n`;
      if (m.cleanContent !== "") content += `${m.cleanContent}\n`;
      if (m.attachments.size > 0) content += `${m.attachments.map((att) => att.proxyURL).join(", ")}\n`;
      content += "\n";
    });

    const logsUrl = await postToBin(content, `Логи билета для ${channel.name}`);
    const ticketDetails = await parseTicketDetails(channel);

    const components = [];
    if (logsUrl) {
      components.push(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel("Транскрипт").setURL(logsUrl.short).setStyle(ButtonStyle.Link)
        )
      );
    }

    if (channel.deletable) await channel.delete();

    const embed = new EmbedBuilder().setAuthor({ name: "Билет закрыт" }).setColor(TICKET.CLOSE_EMBED);
    const fields = [];

    if (reason) fields.push({ name: "Причина", value: reason, inline: false });
    fields.push(
      {
        name: "Открыт",
        value: ticketDetails.user ? ticketDetails.user.username : "Неизвестно",
        inline: true,
      },
      {
        name: "Закрыто",
        value: closedBy ? closedBy.username : "Неизвестно",
        inline: true,
      }
    );

    embed.setFields(fields);

    // send embed to log channel
    if (config.ticket.log_channel) {
      const logChannel = channel.guild.channels.cache.get(config.ticket.log_channel);
      logChannel.safeSend({ embeds: [embed], components });
    }

    // send embed to user
    if (ticketDetails.user) {
      const dmEmbed = embed
        .setDescription(`**Сервер:** ${channel.guild.name}\n**Категория:** ${ticketDetails.catName}`)
        .setThumbnail(channel.guild.iconURL());
      ticketDetails.user.send({ embeds: [dmEmbed], components }).catch((ex) => {});
    }

    return "SUCCESS";
  } catch (ex) {
    error("closeTicket", ex);
    return "ERROR";
  }
}

/**
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').User} author
 */
async function closeAllTickets(guild, author) {
  const channels = getTicketChannels(guild);
  let success = 0;
  let failed = 0;

  for (const ch of channels) {
    const status = await closeTicket(ch[1], author, "Закрыть все открытые билеты");
    if (status === "SUCCESS") success += 1;
    else failed += 1;
  }

  return [success, failed];
}

/**
 * @param {import("discord.js").ButtonInteraction} interaction
 */
async function handleTicketOpen(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const { guild, user } = interaction;

  if (!guild.members.me.permissions.has(OPEN_PERMS))
    return interaction.followUp(
      "Невозможно создать канал билета, отсутствует разрешение `Управление каналом`. Свяжитесь с Алминистртором сервера для помощи!"
    );

  const alreadyExists = getExistingTicketChannel(guild, user.id);
  if (alreadyExists) return interaction.followUp(`У вас уже есть открытый билет`);

  const settings = await getSettings(guild);

  // limit check
  const existing = getTicketChannels(guild).size;
  if (existing > settings.ticket.limit) return interaction.followUp("Слишком много открытых билетов. Попробуйте позже");

  // check categories
  let catName = null;
  let catPerms = [];
  const categories = settings.ticket.categories;
  if (categories.length > 0) {
    const options = [];
    settings.ticket.categories.forEach((cat) => options.push({ label: cat.name, value: cat.name }));
    const menuRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket-menu")
        .setPlaceholder("Выберите категорию билетов")
        .addOptions(options)
    );

    await interaction.followUp({ content: "Пожалуйста, выберите категорию билетов", components: [menuRow] });
    const res = await interaction.channel
      .awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        time: 60 * 1000,
      })
      .catch((err) => {
        if (err.message.includes("time")) return;
      });

    if (!res) return interaction.editReply({ content: "Время вышло. Попробуйте еще раз", components: [] });
    await interaction.editReply({ content: "Обработка", components: [] });
    catName = res.values[0];
    catPerms = categories.find((cat) => cat.name === catName)?.staff_roles || [];
  }

  try {
    const ticketNumber = (existing + 1).toString();
    const permissionOverwrites = [
      {
        id: guild.roles.everyone,
        deny: ["ViewChannel"],
      },
      {
        id: user.id,
        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
      },
      {
        id: guild.members.me.roles.highest.id,
        allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
      },
    ];

    if (catPerms?.length > 0) {
      catPerms?.forEach((roleId) => {
        const role = guild.roles.cache.get(roleId);
        if (!role) return;
        permissionOverwrites.push({
          id: role,
          allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
        });
      });
    }

    const tktChannel = await guild.channels.create({
      name: `билет-${ticketNumber}`,
      type: ChannelType.GuildText,
      topic: `билет|${user.id}|${catName || "по умолчанию"}`,
      permissionOverwrites,
    });

    const embed = new EmbedBuilder()
      .setAuthor({ name: `Билет #${ticketNumber}` })
      .setDescription(
        `Привет ${user.toString()}
        Поддержка свяжеться с вами в ближайшее время
        ${catName ? `\n**Категория:** ${catName}` : ""}
        `
      )
      .setFooter({ text: "Вы можете закрыть свой билет в любое время, нажав кнопку ниже" });

    let buttonsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Закрыть билет")
        .setCustomId("TICKET_CLOSE")
        .setEmoji("🔒")
        .setStyle(ButtonStyle.Primary)
    );

    const sent = await tktChannel.send({ content: user.toString(), embeds: [embed], components: [buttonsRow] });

    const dmEmbed = new EmbedBuilder()
      .setColor(TICKET.CREATE_EMBED)
      .setAuthor({ name: "Билет создан" })
      .setThumbnail(guild.iconURL())
      .setDescription(
        `**Сервер:** ${guild.name}
        ${catName ? `**Категория:** ${catName}` : ""}
        `
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Просмотреть канал").setURL(sent.url).setStyle(ButtonStyle.Link)
    );

    user.send({ embeds: [dmEmbed], components: [row] }).catch((ex) => {});

    await interaction.editReply(`Билет создан! 🔥`);
  } catch (ex) {
    error("handleTicketOpen", ex);
    return interaction.editReply("Не удалось создать билетный канал, произошла ошибка!");
  }
}

/**
 * @param {import("discord.js").ButtonInteraction} interaction
 */
async function handleTicketClose(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const status = await closeTicket(interaction.channel, interaction.user);
  if (status === "MISSING_PERMISSIONS") {
    return interaction.followUp("Не могу закрыть билет, пропущенные разрешения. Свяжитесь с администратором сервера для помощи!");
  } else if (status == "ERROR") {
    return interaction.followUp("Не удалось закрыть билет, произошла ошибка!");
  }
}

module.exports = {
  getTicketChannels,
  getExistingTicketChannel,
  isTicketChannel,
  closeTicket,
  closeAllTickets,
  handleTicketOpen,
  handleTicketClose,
};
