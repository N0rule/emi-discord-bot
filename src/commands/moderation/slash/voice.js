const deafen = require("../shared/deafen");
const vmute = require("../shared/vmute");
const vunmute = require("../shared/vunmute");
const undeafen = require("../shared/undeafen");
const disconnect = require("../shared/disconnect");
const move = require("../shared/move");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "voice",
  description: "голосовые команды модерации",
  category: "MODERATION",
  userPermissions: ["MuteMembers", "MoveMembers", "DeafenMembers"],
  botPermissions: ["MuteMembers", "MoveMembers", "DeafenMembers"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "mute",
        description: "отключить голос участника",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "участник",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "reason",
            description: "причина для мута",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "unmute",
        description: "включить голос участника",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "участник",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "reason",
            description: "причина для анмута",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "deafen",
        description: "откл.звук участника в голосовом канале",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "участник",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "reason",
            description: "причина для откл.звук",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "undeafen",
        description: "вкл.звук участника в голосовом канале",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "участник",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "reason",
            description: "причина для вкл.звук",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "kick",
        description: "кикнуть участника из голосового канала",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "участник",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "reason",
            description: "причина для кика",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
      {
        name: "move",
        description: "переместить участника с одного голосового канала на другой",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "участник",
            type: ApplicationCommandOptionType.User,
            required: true,
          },
          {
            name: "channel",
            description: "канал, на который нужно переместить участника",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildVoice, ChannelType.GuildStageVoice],
            required: true,
          },
          {
            name: "reason",
            description: "причина перемещения",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    const reason = interaction.options.getString("reason");

    const user = interaction.options.getUser("user");
    const target = await interaction.guild.members.fetch(user.id);

    let response;

    if (sub === "mute") response = await vmute(interaction, target, reason);
    else if (sub === "unmute") response = await vunmute(interaction, target, reason);
    else if (sub === "deafen") response = await deafen(interaction, target, reason);
    else if (sub === "undeafen") response = await undeafen(interaction, target, reason);
    else if (sub === "kick") response = await disconnect(interaction, target, reason);
    else if (sub == "move") {
      const channel = interaction.options.getChannel("channel");
      response = await move(interaction, target, reason, channel);
    }

    await interaction.followUp(response);
  },
};
