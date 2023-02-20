const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getWarningLogs, clearWarningLogs } = require("@schemas/ModLog");
const { getMember } = require("@schemas/Member");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "warnings",
  description: "список или удаление предупреждений участника",
  category: "MODERATION",
  userPermissions: ["KickMembers"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "list [member]",
        description: "список всех предупреждений для участника",
      },
      {
        trigger: "clear <member>",
        description: "очистить все предупреждения для участника",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "list",
        description: "список всех предупреждений для участника",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "участник",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
      {
        name: "clear",
        description: "очистить все предупреждения для участника",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "участник",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0]?.toLowerCase();
    let response = "";

    if (sub === "list") {
      const target = (await message.guild.resolveMember(args[1], true)) || message.member;
      if (!target) return message.safeReply(`Нет подходяшего пользователя под: ${args[1]}`);
      response = await listWarnings(target, message);
    }

    //
    else if (sub === "clear") {
      const target = await message.guild.resolveMember(args[1], true);
      if (!target) return message.safeReply(`Нет подходяшего пользователя под: ${args[1]}`);
      response = await clearWarnings(target, message);
    }

    // else
    else {
      response = `Недопустимая субкоманда ${sub}`;
    }

    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    let response = "";

    if (sub === "list") {
      const user = interaction.options.getUser("user");
      const target = (await interaction.guild.members.fetch(user.id)) || interaction.member;
      response = await listWarnings(target, interaction);
    }

    //
    else if (sub === "clear") {
      const user = interaction.options.getUser("user");
      const target = await interaction.guild.members.fetch(user.id);
      response = await clearWarnings(target, interaction);
    }

    // else
    else {
      response = `Недопустимая субкоманда ${sub}`;
    }

    await interaction.followUp(response);
  },
};

async function listWarnings(target, { guildId }) {
  if (!target) return "Пользователь не указан";
  if (target.user.bot) return "У ботов нет предупреждений";

  const warnings = await getWarningLogs(guildId, target.id);
  if (!warnings.length) return `${target.user.tag} не имеет предупреждений`;

  const acc = warnings.map((warning, i) => `${i + 1}. ${warning.reason} [Выдал ${warning.admin.tag}]`).join("\n");
  const embed = new EmbedBuilder({
    author: { name: `Предупреждения ${target.user.tag}` },
    description: acc,
  });

  return { embeds: [embed] };
}

async function clearWarnings(target, { guildId }) {
  if (!target) return "Пользователь не указан";
  if (target.user.bot) return "У ботов нет предупреждений";

  const memberDb = await getMember(guildId, target.id);
  memberDb.warnings = 0;
  await memberDb.save();

  await clearWarningLogs(guildId, target.id);
  return `Предупреждения ${target.user.tag} были очищены!`;
}
