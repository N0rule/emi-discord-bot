const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");
const { BotClient } = require("@src/structures");
const client = new BotClient();
// Please set your username, password and User-Agent.
const vrchat = require("vrchat");
// const readline = require('readline');
const configuration = new vrchat.Configuration({
  username: process.env.VRC_LOGIN,
  password: process.env.VRC_PASSWORD,
  apiKey: process.env.VRC_APIKEY,
  baseOptions: {
    headers: {
      "User-Agent": process.env.USER_AGENT,
      "Cookie": "auth=" + process.env.VRC_AUTHCOOKIE,
    }
  }
});
const AuthenticationApi = new vrchat.AuthenticationApi(configuration);

const usersapi = new vrchat.UsersApi(configuration);

AuthenticationApi.getCurrentUser().then(resp => {
  const currentUser = resp.data;
  client.logger.success(`Successfully logged to VRC Account:${currentUser.displayName}`);
});

//for Email Autentif

// setTimeout(() => {

//   AuthenticationApi.getCurrentUser().then(resp => {
//     const readInterface = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout
//     });
//     readInterface.question("Vrchat 2FA Code>", code => {
//       readInterface.close();
//       AuthenticationApi.verify2FAEmailCode({ 'code': code }).then(resp => {
//         AuthenticationApi.getCurrentUser().then(resp => {
//           const currentUser = resp.data;
//           client.logger.success(`Logged in as: ${currentUser.displayName}`);
//         });
//       });
//     });
//   });
// }, 4000);

module.exports = {
  name: "vrchat",
  description: "Получить информацию о пользователе vrchat!",
  cooldown: 0,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks"],
  command: {
    enabled: true,
    usage: "<username>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
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


async function getUserInfo(username, mauthor) {
  try {
    const response = await usersapi.searchUsers(username, undefined, 1);
    const userInfo = response.data[0];
    console.log(userInfo);
    if (!userInfo) {
      throw new Error("Пользователь не найден.");
    }

    const embed = new EmbedBuilder()
      .setTitle(`Информация О Пользователе **${username}**`)
      .setColor(EMBED_COLORS.SUCCESS)
      .addFields(
        {
          name: "Имя пользователя",
          value: userInfo.displayName,
          inline: false
        },
        {
          name: "ID",
          value: userInfo.id,
          inline: false
        },
        {
          name: "БИО",
          value: userInfo.bio || "Нет БИО",
          inline: false
        },
        {
          name: "Ссылки в БИО",
          value: userInfo.bioLinks.join('\n') || "Нет Ссылок",
          inline: false
        },
        {
          name: "Статус",
          value: userInfo.status,
          inline: false
        },
        {
          name: "Описание Статуса",
          value: userInfo.statusDescription,
          inline: false
        },
        {
          name: "Последняя Платформа",
          value: userInfo.last_platform,
          inline: false
        },
        {
          name: "Теги",
          value: userInfo.tags.join(', '),
          inline: false
        }
      ) 
      // .setDescription(
      //   `**Имя пользователя:** ${userInfo.displayName}\n**ID:** ${userInfo.id}\n**БИО:** ${userInfo.bio || "Нету биографии"}\n**Местоположение:** ${userInfo.location || "Нету местоположения"}\n**Статус:** ${userInfo.status}\n**Описание Статуса:** ${userInfo.statusDescription}\n**Последняя Платформа:** ${userInfo.last_platform}\n**Теги:** ${userInfo.tags.join(', ')}`
      // )
      .setThumbnail(userInfo.currentAvatarThumbnailImageUrl)
      .setFooter({
        text: `Запрошено пользователем ${mauthor.tag}`,
      });

    return { embeds: [embed] };
  } catch (error) {
    console.error(error);
    return { content: "Произошла ошибка при получении пользовательской информации." };
  }
}

