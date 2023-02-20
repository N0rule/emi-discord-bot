const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getMemberStats } = require("@schemas/MemberStats");
const { EMBED_COLORS } = require("@root/config");
const { stripIndents } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "stats",
  description: "показывает статистику пользователя",
  cooldown: 5,
  category: "STATS",
  command: {
    enabled: true,
    usage: "[@member|id]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "пользователь",
        type: ApplicationCommandOptionType.User,
        required: false,
      },
    ],
  },

  async messageRun(message, args, data) {
    const target = (await message.guild.resolveMember(args[0])) || message.member;
    const response = await stats(target, data.settings);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const member = interaction.options.getMember("user") || interaction.member;
    const response = await stats(member, data.settings);
    await interaction.followUp(response);
  },
};

/**
 * @param {import('discord.js').GuildMember} member
 * @param {object} settings
 */
async function stats(member, settings) {
  if (!settings.stats.enabled) return "Отслеживание статистики на этом сервере отключено";
  const memberStats = await getMemberStats(member.guild.id, member.id);

  const embed = new EmbedBuilder()
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addFields(
      {
        name: "Имя Пользователя",
        value: member.user.username,
        inline: true,
      },
      {
        name: "ID",
        value: member.id,
        inline: true,
      },
      {
        name: "⌚ Член сервера с",
        value: member.joinedAt.toLocaleString(),
        inline: false,
      },
      {
        name: "💬 Отправлено сообщений",
        value: stripIndents`
      ❯ Сообщений: ${memberStats.messages}
      ❯ Префикс команд: ${memberStats.commands.prefix}
      ❯ Слеш(/) команд: ${memberStats.commands.slash}
      ❯ Опт Получено: ${memberStats.xp}
      ❯ Текущий Уровень: ${memberStats.level}
    `,
        inline: false,
      },
      {
        name: "🎙️ Голосовая Статистика",
        value: stripIndents`
      ❯ Количество Подключений: ${memberStats.voice.connections}
      ❯ Времени Проведено: ${Math.floor(memberStats.voice.time / 60)} мин
    `,
      }
    )
    .setFooter({ text: "Статистика Сгенерирована" })
    .setTimestamp();

  return { embeds: [embed] };
}
