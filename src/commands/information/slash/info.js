const user = require("../shared/user");
const channelInfo = require("../shared/channel");
const guildInfo = require("../shared/guild");
const avatar = require("../shared/avatar");
const emojiInfo = require("../shared/emoji");
const botInfo = require("../shared/botstats");
const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "info",
  description: "показывает разную информацию",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user",
        description: "показать информацию о пользователе",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "имя пользователя",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "channel",
        description: "получить информацию о канале",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "имя канала",
            type: ApplicationCommandOptionType.Channel,
            required: false,
          },
        ],
      },
      {
        name: "guild",
        description: "получить информацию о сервере",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "bot",
        description: "получить информацию о боте",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "avatar",
        description: "получить информацию о аватаре",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "имя пользователя",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "emoji",
        description: "получить информацию о эмодзи",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "name",
            description: "имя эмодзи",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    if (!sub) return interaction.followUp("неправильная сабкоманда");
    let response;

    // user
    if (sub === "user") {
      let targetUser = interaction.options.getUser("name") || interaction.user;
      let target = await interaction.guild.members.fetch(targetUser);
      response = user(target);
    }

    // channel
    else if (sub === "channel") {
      let targetChannel = interaction.options.getChannel("name") || interaction.channel;
      response = channelInfo(targetChannel);
    }

    // guild
    else if (sub === "guild") {
      response = await guildInfo(interaction.guild);
    }

    // bot
    else if (sub === "bot") {
      response = botInfo(interaction.client);
    }

    // avatar
    else if (sub === "avatar") {
      let target = interaction.options.getUser("name") || interaction.user;
      response = avatar(target);
    }

    // emoji
    else if (sub === "emoji") {
      let emoji = interaction.options.getString("name");
      response = emojiInfo(emoji);
    }

    // return
    else {
      response = "неправильная сабкоманда";
    }

    await interaction.followUp(response);
  },
};
