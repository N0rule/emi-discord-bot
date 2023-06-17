const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { getJson } = require("@helpers/HttpUtils");
const { MESSAGES, EMBED_COLORS } = require("@root/config");

const BASE_URL = "https://some-random-api.com/lyrics";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "lyric",
  description: "найди текст песни",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  cooldown: 10,
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "<Имя Песни - Исполнитель>",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "query",
        type: ApplicationCommandOptionType.String,
        description: "найти текст песни",
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const choice = args.join(" ");
    if (!choice) {
      return message.safeReply("Выбран неверный текст.");
    }
    const response = await getLyric(message.author, choice);
    return message.safeReply(response);
  },

  async interactionRun(interaction) {
    const choice = interaction.options.getString("query");
    const response = await getLyric(interaction.user, choice);
    await interaction.followUp(response);
  },
};

async function getLyric(user, choice) {
  const lyric = await getJson(`${BASE_URL}?title=${choice}`);
  if (!lyric.success) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("🚫 Извините, я не смог найти текст этой песни.");
    return { embeds: [embed] };
  }

  const thumbnail = lyric.data?.thumbnail.genius;
  const author = lyric.data?.author;
  const lyrics = lyric.data?.lyrics;
  const title = lyric.data?.title;

  const embed = new EmbedBuilder();
  embed
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setTitle(`${author} - ${title}`)
    .setThumbnail(thumbnail)
    .setDescription(lyrics)
    .setFooter({ text: `Запрошено пользователем: ${user.tag}` });

  return { embeds: [embed] };
}
