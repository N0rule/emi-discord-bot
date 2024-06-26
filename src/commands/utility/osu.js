const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const osu = require("node-osu");
const { EMBED_COLORS } = require("@root/config.js");
const { stripIndents } = require("common-tags");
const osuApi = new osu.Api(process.env.OSU_API_KEY, {
  notFoundAsError: true,
  completeScores: false,
});

module.exports = {
  name: "osu",
  description: "Получить информацию о пользователе osu!",
  cooldown: 5,
  category: "UTILITY",
  botPermissions: ["SendMessages", "EmbedLinks"],
  command: {
    enabled: true,
    usage: "<username>", // Instruction on how to use the command
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "username",
        description: "Имя пользователя osu!",
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
    const user = await osuApi.getUser({ u: username });
    const embed = new EmbedBuilder()
      .setTitle(`**osu! Профиль**`)
      .setColor(EMBED_COLORS.SUCCESS)
      .setDescription(
        stripIndents`
        ❯ **Имя пользователя:** ${user.name}
        ❯ **Уровень:** ${Math.floor(user.level)}
        ❯ **Ранг:** ${Math.floor(user.pp.rank)}
        ❯ **PP:** ${Math.floor(user.pp.raw)}
        ❯ **SS:** ${user.counts.SS} **S:** ${user.counts.S} **A:** ${user.counts.A}
        ❯ **Страна:** ${user.country}
        ❯ **Точность:** ${Math.floor(user.accuracy)}%
        ❯ **Игры сыграно:** ${user.counts.plays}
      `
      )
      .setThumbnail(`https://a.ppy.sh/${user.id}`)
      .setFooter({
        text: `Запрошено пользователем ${mauthor.username}`,
      });
    return { embeds: [embed] };
  } catch (error) {
    if (error.message === "Not found") {
      // Return "Wrong Username" if the provided username is not found
      return { content: "🚫 Такого пользователя не существует" };
    }
    console.error(`Ошибка получения информации OSU! пользователя: ${error}`);
    return { content: "Не удалось получить информацию о пользователе osu!" };
  }
}
