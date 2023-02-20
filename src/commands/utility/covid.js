const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const timestampToDate = require("timestamp-to-date");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "covid",
  description: "ковид информация страны",
  cooldown: 5,
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<country>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "country",
        description: "имя страны",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const country = args.join(" ");
    const response = await getCovid(country);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const country = interaction.options.getString("country");
    const response = await getCovid(country);
    await interaction.followUp(response);
  },
};

async function getCovid(country) {
  const response = await getJson(`https://disease.sh/v2/countries/${country}`);

  if (response.status === 404) return "```css\nСтраны с таким именем нету```";
  if (!response.success) return MESSAGES.API_ERROR;
  const { data } = response;

  const mg = timestampToDate(data?.updated, "dd.MM.yyyy at HH:mm");
  const embed = new EmbedBuilder()
    .setTitle(`Ковид - ${data?.country}`)
    .setThumbnail(data?.countryInfo.flag)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .addFields(
      {
        name: "Количество Случаев",
        value: data?.cases.toString(),
        inline: true,
      },
      {
        name: "Случаев Сегодня",
        value: data?.todayCases.toString(),
        inline: true,
      },
      {
        name: "Количество Смертей",
        value: data?.deaths.toString(),
        inline: true,
      },
      {
        name: "Смертей Сегодня",
        value: data?.todayDeaths.toString(),
        inline: true,
      },
      {
        name: "Выздоровило",
        value: data?.recovered.toString(),
        inline: true,
      },
      {
        name: "Больных",
        value: data?.active.toString(),
        inline: true,
      },
      {
        name: "Критично",
        value: data?.critical.toString(),
        inline: true,
      },
      {
        name: "Случаев на 1 миллион",
        value: data?.casesPerOneMillion.toString(),
        inline: true,
      },
      {
        name: "Смертей на 1 миллион",
        value: data?.deathsPerOneMillion.toString(),
        inline: true,
      }
    )
    .setFooter({ text: `Последнее обновление в ${mg}` });

  return { embeds: [embed] };
}
