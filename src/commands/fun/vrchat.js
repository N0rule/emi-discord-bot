const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { BotClient } = require("@src/structures");
const client = new BotClient();

const vrchat = require("vrchat");
const configuration = new vrchat.Configuration({
  username: process.env.VRC_LOGIN,
  password: process.env.VRC_PASSWORD,
  apiKey: process.env.VRC_APIKEY,
  baseOptions: {
    headers: {
      "User-Agent": process.env.USER_AGENT,
      // "Cookie": "auth=" + process.env.VRC_AUTHCOOKIE,
    },
  },
});
const AuthenticationApi = new vrchat.AuthenticationApi(configuration);

const usersapi = new vrchat.UsersApi(configuration);

// AuthenticationApi.getCurrentUser().then(resp => {
//   const currentUser = resp.data;
//   client.logger.success(`Successfully logged to VRC Account:${currentUser.displayName}`);
// });

//for Email Autentif

function authenticateUserWith2FA() {
  setTimeout(() => {
    const readline = require("readline");
    AuthenticationApi.getCurrentUser().then((resp) => {
      const readInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      readInterface.question("Vrchat 2FA Code>", (code) => {
        readInterface.close();
        AuthenticationApi.verify2FAEmailCode({ code: code }).then((resp) => {
          AuthenticationApi.getCurrentUser().then((resp) => {
            const currentUser = resp.data;
            client.logger.success(`Logged in as: ${currentUser.displayName}`);
          });
        });
      });
    });
  }, 4000);
}

module.exports = {
  name: "vrchat",
  description: "Получить информацию о пользователе vrchat!",
  cooldown: 5,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks"],
  command: {
    enabled: false,
    usage: "<username>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: false,
    options: [
      {
        name: "username",
        description: "Имя пользователя vrchat!",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  async messageRun(message, args) {
    const username = args[0];
    const response = await getUserInfo(username, message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const username = interaction.options.getString("username");
    const response = await getUserInfo(username, interaction.user);
    await interaction.followUp(response);
  },
};

if (module.exports.command.enabled || module.exports.slashCommand.enabled) {
  authenticateUserWith2FA();
}

async function getUserInfo(username, mauthor) {
  try {
    const response = await usersapi.searchUsers(username, undefined, 1);
    const userInfo = response.data[0];
    //console.log(userInfo);
    if (!userInfo) {
      return { content: "🚫Пользователь не найден." };
    }

    const embed = new EmbedBuilder()
      .setTitle(`VRchat Пользователь: ${username}`)
      .setColor(EMBED_COLORS.SUCCESS)
      .setTimestamp();

    if (userInfo.displayName) {
      embed.addFields({
        name: "Имя пользователя:",
        value: userInfo.displayName,
        inline: false,
      });
    }

    if (userInfo.id) {
      embed.addFields({
        name: "ID:",
        value: userInfo.id,
        inline: false,
      });
    }

    if (userInfo.bio) {
      embed.addFields({
        name: "БИО:",
        value: userInfo.bio,
        inline: false,
      });
    }

    if (userInfo.bioLinks && userInfo.bioLinks.length > 0) {
      embed.addFields({
        name: "Ссылки в БИО:",
        value: userInfo.bioLinks.join("\n"),
        inline: false,
      });
    }

    if (userInfo.status) {
      embed.addFields({
        name: "Статус:",
        value: userInfo.status,
        inline: false,
      });
    }

    if (userInfo.statusDescription) {
      embed.addFields({
        name: "Описание Статуса:",
        value: userInfo.statusDescription,
        inline: false,
      });
    }

    if (userInfo.last_platform) {
      embed.addFields({
        name: "Последняя Платформа:",
        value: userInfo.last_platform,
        inline: false,
      });
    }

    if (userInfo.tags && userInfo.tags.length > 0) {
      embed.addFields({
        name: "Теги:",
        value: userInfo.tags.join(", "),
        inline: false,
      });
    }

    embed.setImage(userInfo.currentAvatarImageUrl).setFooter({
      text: `Запрошено пользователем ${mauthor.tag}`,
    });

    return { embeds: [embed] };
  } catch (error) {
    console.error(error);
    return { content: "Произошла ошибка при получении пользовательской информации." };
  }
}
