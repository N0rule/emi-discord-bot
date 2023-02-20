const { addReactionRole, getReactionRoles } = require("@schemas/ReactionRoles");
const { parseEmoji, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { parsePermissions } = require("@helpers/Utils");

const channelPerms = ["EmbedLinks", "ReadMessageHistory", "AddReactions", "UseExternalEmojis", "ManageMessages"];

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "addrr",
  description: "установить роль-реакцию для конкретного сообщения",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: "<#channel> <messageId> <emote> <role>",
    minArgsCount: 4,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "channel",
        description: "канал где находится сообщение",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: true,
      },
      {
        name: "message_id",
        description: "id сообщения к которому нужно добавить роль-реакцию",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "emoji",
        description: "емодзи для использования",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "role",
        description: "роль которую будет выдана",
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const targetChannel = message.guild.findMatchingChannels(args[0]);
    if (targetChannel.length === 0) return message.safeReply(`Нет подходяших каналов ${args[0]}`);

    const targetMessage = args[1];

    const role = message.guild.findMatchingRoles(args[3])[0];
    if (!role) return message.safeReply(`Нет подходящих ролей ${args[3]}`);

    const reaction = args[2];

    const response = await addRR(message.guild, targetChannel[0], targetMessage, reaction, role);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const targetChannel = interaction.options.getChannel("channel");
    const messageId = interaction.options.getString("message_id");
    const reaction = interaction.options.getString("emoji");
    const role = interaction.options.getRole("role");

    const response = await addRR(interaction.guild, targetChannel, messageId, reaction, role);
    await interaction.followUp(response);
  },
};

async function addRR(guild, channel, messageId, reaction, role) {
  if (!channel.permissionsFor(guild.members.me).has(channelPerms)) {
    return `Вам нужны эти права в данном канале ${channel.toString()}\n${parsePermissions(channelPerms)}`;
  }

  let targetMessage;
  try {
    targetMessage = await channel.messages.fetch({ message: messageId });
  } catch (ex) {
    return "Сообщение не найдено. точно правильный id сообщения?";
  }

  if (role.managed) {
    return "я не могу добавить роль.";
  }

  if (guild.roles.everyone.id === role.id) {
    return "нельзя использовать роль @everyone.";
  }

  if (guild.members.me.roles.highest.position < role.position) {
    return "УПС! Я не могу доб/удал пользователей у этой роли. Эта роль выше моей?";
  }

  const custom = parseEmoji(reaction);
  if (custom.id && !guild.emojis.cache.has(custom.id)) return "Это емодзи не из этого сервера";
  const emoji = custom.id ? custom.id : custom.name;

  try {
    await targetMessage.react(emoji);
  } catch (ex) {
    return `УПс! Ошибка Реакции. Это подходящая емодзи: ${reaction} ?`;
  }

  let reply = "";
  const previousRoles = getReactionRoles(guild.id, channel.id, targetMessage.id);
  if (previousRoles.length > 0) {
    const found = previousRoles.find((rr) => rr.emote === emoji);
    if (found) reply = "Роль уже настроенна на эту емодзи. Перезаписываю информацию,\n";
  }

  await addReactionRole(guild.id, channel.id, targetMessage.id, emoji, role.id);
  return (reply += "Установлено! Конфигурация сохранена");
}
