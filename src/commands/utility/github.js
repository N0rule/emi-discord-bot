const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "github",
  description: "показывает гитхаб статистику пользователя",
  cooldown: 10,
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: ["git"],
    usage: "<username>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "username",
        description: "имя в гитхаб",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const username = args.join(" ");
    const response = await getGithubUser(username, message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const username = interaction.options.getString("username");
    const response = await getGithubUser(username, interaction.user);
    await interaction.followUp(response);
  },
};

const websiteProvided = (text) => (text.startsWith("http://") ? true : text.startsWith("https://"));

async function getGithubUser(target, author) {
  const response = await getJson(`https://api.github.com/users/${target}`);
  if (response.status === 404) return "```Не найдено пользователей с таким именем```";
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data;
  const {
    login: username,
    name,
    id: githubId,
    avatar_url: avatarUrl,
    html_url: userPageLink,
    followers,
    following,
    bio,
    location,
    blog,
  } = json;

  let website = websiteProvided(blog) ? `[Тыкни](${blog})` : "Нету";
  if (website == null) website = "Нету";
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `GitHub Пользователь: ${username}`,
      url: userPageLink,
      iconURL: avatarUrl,
    })
    .addFields(
      {
        name: "Инф. Пользователя",
        value: stripIndent`
        **Реальное Имя**: *${name || "Нету"}*
        **Местоположение**: *${location}*
        **GitHub ID**: *${githubId}*
        **Вебсайт**: *${website}*\n`,
        inline: true,
      },
      {
        name: "Соц. Статистика",
        value: `**Подписчиков**: *${followers}*\n**Подписок**: *${following}*`,
        inline: true,
      }
    )
    .setDescription(`**Биография**:\n${bio || "Нету Записи"}`)
    .setImage(avatarUrl)
    .setColor(0x6e5494)
    .setFooter({ text: `Запрошено пользователем ${author.username}` });

  return { embeds: [embed] };
}
