const { getSettings } = require("@schemas/Guild");
const { findSuggestion, deleteSuggestionDb } = require("@schemas/Suggestions");
const { SUGGESTIONS } = require("@root/config");

const {
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  EmbedBuilder,
  ButtonStyle,
  TextInputStyle,
} = require("discord.js");
const { stripIndents } = require("common-tags");

/**
 * @param {import('discord.js').Message} message
 */
const getStats = (message) => {
  const upVotes = (message.reactions.resolve(SUGGESTIONS.EMOJI.UP_VOTE)?.count || 1) - 1;
  const downVotes = (message.reactions.resolve(SUGGESTIONS.EMOJI.DOWN_VOTE)?.count || 1) - 1;

  return [upVotes, downVotes];
};

/**
 * @param {number} upVotes
 * @param {number} downVotes
 */
const getVotesMessage = (upVotes, downVotes) => {
  const total = upVotes + downVotes;
  if (total === 0) {
    return stripIndents`
  _Лайков: Нету_
  _Дизлайков: Нету_
  `;
  } else {
    return stripIndents`
  _Лайков: ${upVotes} [${Math.round((upVotes / (upVotes + downVotes)) * 100)}%]_
  _Дизлайков: ${downVotes} [${Math.round((downVotes / (upVotes + downVotes)) * 100)}%]_
  `;
  }
};

const hasPerms = (member, settings) => {
  return (
    member.permissions.has("ManageGuild") ||
    member.roles.cache.find((r) => settings.suggestions.staff_roles.includes(r.id))
  );
};

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').TextBasedChannel} channel
 * @param {string} messageId
 * @param {string} [reason]
 */
async function approveSuggestion(member, channel, messageId, reason) {
  const { guild } = member;
  const settings = await getSettings(guild);

  // validate permissions
  if (!hasPerms(member, settings)) return "У вас нет разрешения утверждать предложения!";

  // validate if document exists
  const doc = await findSuggestion(guild.id, messageId);
  if (!doc) return "Предложение не найдено";
  if (doc.status === "APPROVED") return "Предложение уже одобрено";

  /**
   * @type {import('discord.js').Message}
   */
  let message;
  try {
    message = await channel.messages.fetch({ message: messageId, force: true });
  } catch (err) {
    return "Сообщение о предложении не найдено";
  }

  let buttonsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("SUGGEST_APPROVE")
      .setLabel("Утвердить")
      .setStyle(ButtonStyle.Success)
      .setDisabled(true),
    new ButtonBuilder().setCustomId("SUGGEST_REJECT").setLabel("Отклонять").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("SUGGEST_DELETE").setLabel("Удалить").setStyle(ButtonStyle.Secondary)
  );

  const approvedEmbed = new EmbedBuilder()
    .setDescription(message.embeds[0].data.description)
    .setColor(SUGGESTIONS.APPROVED_EMBED)
    .setAuthor({ name: "Предложение одобрено" })
    .setFooter({ text: `Одобрено ${member.user.username}`, iconURL: member.displayAvatarURL() })
    .setTimestamp();

  const fields = [];

  // add stats if it doesn't exist
  const statsField = message.embeds[0].fields.find((field) => field.name === "Stats");
  if (!statsField) {
    const [upVotes, downVotes] = getStats(message);
    doc.stats.upvotes = upVotes;
    doc.stats.downvotes = downVotes;
    fields.push({ name: "Статистика", value: getVotesMessage(upVotes, downVotes) });
  } else {
    fields.push(statsField);
  }

  // update reason
  if (reason) fields.push({ name: "Причина", value: "```" + reason + "```" });

  approvedEmbed.addFields(fields);

  try {
    doc.status = "APPROVED";
    doc.status_updates.push({ user_id: member.id, status: "APPROVED", reason, timestamp: new Date() });

    let approveChannel;
    if (settings.suggestions.approved_channel) {
      approveChannel = guild.channels.cache.get(settings.suggestions.approved_channel);
    }

    // suggestions-approve channel is not configured
    if (!approveChannel) {
      await message.edit({ embeds: [approvedEmbed], components: [buttonsRow] });
      await message.reactions.removeAll();
    }

    // suggestions-approve channel is configured
    else {
      const sent = await approveChannel.send({ embeds: [approvedEmbed], components: [buttonsRow] });
      doc.channel_id = approveChannel.id;
      doc.message_id = sent.id;
      await message.delete();
    }

    await doc.save();
    return "Предложение одобрено";
  } catch (ex) {
    guild.client.logger.error("approveSuggestion", ex);
    return "Не удалось одобрить предложение";
  }
}

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').TextBasedChannel} channel
 * @param {string} messageId
 * @param {string} [reason]
 */
async function rejectSuggestion(member, channel, messageId, reason) {
  const { guild } = member;
  const settings = await getSettings(guild);

  // validate permissions
  if (!hasPerms(member, settings)) return "У вас нет разрешения отклонить предложения!";

  // validate if document exists
  const doc = await findSuggestion(guild.id, messageId);
  if (!doc) return "Предложение не найдено";
  if (doc.is_rejected) return "Предложение уже отвергнуто";

  let message;
  try {
    message = await channel.messages.fetch({ message: messageId });
  } catch (err) {
    return "Сообщение о предложении не найдено";
  }

  let buttonsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("SUGGEST_APPROVE").setLabel("Утвердить").setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("SUGGEST_REJECT")
      .setLabel("Отклонять")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(true),
    new ButtonBuilder().setCustomId("SUGGEST_DELETE").setLabel("Удалить").setStyle(ButtonStyle.Secondary)
  );

  const rejectedEmbed = new EmbedBuilder()
    .setDescription(message.embeds[0].data.description)
    .setColor(SUGGESTIONS.DENIED_EMBED)
    .setAuthor({ name: "Предложение отвергнуто" })
    .setFooter({ text: `Отвергнуто ${member.user.username}`, iconURL: member.displayAvatarURL() })
    .setTimestamp();

  const fields = [];

  // add stats if it doesn't exist
  const statsField = message.embeds[0].fields.find((field) => field.name === "Stats");
  if (!statsField) {
    const [upVotes, downVotes] = getStats(message);
    doc.stats.upvotes = upVotes;
    doc.stats.downvotes = downVotes;
    fields.push({ name: "Статистика", value: getVotesMessage(upVotes, downVotes) });
  } else {
    fields.push(statsField);
  }

  // update reason
  if (reason) fields.push({ name: "Причина", value: "```" + reason + "```" });

  rejectedEmbed.addFields(fields);

  try {
    doc.status = "REJECTED";
    doc.status_updates.push({ user_id: member.id, status: "REJECTED", reason, timestamp: new Date() });

    let rejectChannel;
    if (settings.suggestions.rejected_channel) {
      rejectChannel = guild.channels.cache.get(settings.suggestions.rejected_channel);
    }

    // suggestions-reject channel is not configured
    if (!rejectChannel) {
      await message.edit({ embeds: [rejectedEmbed], components: [buttonsRow] });
      await message.reactions.removeAll();
    }

    // suggestions-reject channel is configured
    else {
      const sent = await rejectChannel.send({ embeds: [rejectedEmbed], components: [buttonsRow] });
      doc.channel_id = rejectChannel.id;
      doc.message_id = sent.id;
      await message.delete();
    }

    await doc.save();

    return "Предложение отвергнуто";
  } catch (ex) {
    guild.client.logger.error("rejectSuggestion", ex);
    return "Не удалось отклонить предложение";
  }
}

/**
 * @param {import('discord.js').GuildMember} member
 * @param {import('discord.js').TextBasedChannel} channel
 * @param {string} messageId
 * @param {string} [reason]
 */
async function deleteSuggestion(member, channel, messageId, reason) {
  const { guild } = member;
  const settings = await getSettings(guild);

  // validate permissions
  if (!hasPerms(member, settings)) return "У вас нет разрешения на удаление предложений!";

  try {
    await channel.messages.delete(messageId);
    await deleteSuggestionDb(guild.id, messageId, member.id, reason);
    return "Предложение удалено";
  } catch (ex) {
    guild.client.logger.error("deleteSuggestion", ex);
    return "Не удалось удалить предложения! Пожалуйста, удалите вручную";
  }
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleApproveBtn(interaction) {
  await interaction.showModal(
    new ModalBuilder({
      title: "Одобрить предложение",
      customId: "SUGGEST_APPROVE_MODAL",
      components: [
        new ActionRowBuilder().addComponents([
          new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("причина")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(4),
        ]),
      ],
    })
  );
}

/**
 * @param {import('discord.js').ModalSubmitInteraction} modal
 */
async function handleApproveModal(modal) {
  await modal.deferReply({ ephemeral: true });
  const reason = modal.fields.getTextInputValue("reason");
  const response = await approveSuggestion(modal.member, modal.channel, modal.message.id, reason);
  await modal.followUp(response);
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleRejectBtn(interaction) {
  await interaction.showModal(
    new ModalBuilder({
      title: "Отклонить предложение",
      customId: "SUGGEST_REJECT_MODAL",
      components: [
        new ActionRowBuilder().addComponents([
          new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("причина")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(4),
        ]),
      ],
    })
  );
}

/**
 * @param {import('discord.js').ModalSubmitInteraction} modal
 */
async function handleRejectModal(modal) {
  await modal.deferReply({ ephemeral: true });
  const reason = modal.fields.getTextInputValue("reason");
  const response = await rejectSuggestion(modal.member, modal.channel, modal.message.id, reason);
  await modal.followUp(response);
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleDeleteBtn(interaction) {
  await interaction.showModal(
    new ModalBuilder({
      title: "Удалить предложение",
      customId: "SUGGEST_DELETE_MODAL",
      components: [
        new ActionRowBuilder().addComponents([
          new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("причина")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(4),
        ]),
      ],
    })
  );
}

/**
 * @param {import('discord.js').ModalSubmitInteraction} modal
 */
async function handleDeleteModal(modal) {
  await modal.deferReply({ ephemeral: true });
  const reason = modal.fields.getTextInputValue("reason");
  const response = await deleteSuggestion(modal.member, modal.channel, modal.message.id, reason);
  await modal.followUp({ content: response, ephemeral: true });
}

module.exports = {
  handleApproveBtn,
  handleApproveModal,
  handleRejectBtn,
  handleRejectModal,
  handleDeleteBtn,
  handleDeleteModal,
  approveSuggestion,
  rejectSuggestion,
  deleteSuggestion,
};
