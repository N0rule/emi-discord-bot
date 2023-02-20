const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config.js");
const { getJson } = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "pokedex",
  description: "показивает информацию о покемоне",
  category: "UTILITY",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    usage: "<pokemon>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "pokemon",
        description: "имя покемона",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const pokemon = args.join(" ");
    const response = await pokedex(pokemon);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const pokemon = interaction.options.getString("pokemon");
    const response = await pokedex(pokemon);
    await interaction.followUp(response);
  },
};

async function pokedex(pokemon) {
  const response = await getJson(`https://pokeapi.glitch.me/v1/pokemon/${pokemon}`);
  if (response.status === 404) return "```покемон не найден```";
  if (!response.success) return MESSAGES.API_ERROR;

  const json = response.data[0];

  const embed = new EmbedBuilder()
    .setTitle(`Покедекс - ${json.name}`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(json.sprite)
    .setDescription(
      stripIndent`
            ♢ **ID**: ${json.number}
            ♢ **Имя**: ${json.name}
            ♢ **Разновидность**: ${json.species}
            ♢ **Тип(ы)**: ${json.types}
            ♢ **Способоности(нормальные)**: ${json.abilities.normal}
            ♢ **Abilities(спрятанные)**: ${json.abilities.hidden}
            ♢ **Група яйца(иц)**: ${json.eggGroups}
            ♢ **Пол**: ${json.gender}
            ♢ **Рост**: ${json.height} foot tall
            ♢ **Вес**: ${json.weight}
            ♢ **Текущая Стадия Еволюции**: ${json.family.evolutionStage}
            ♢ **Линия Еволюции**: ${json.family.evolutionLine}
            ♢ **Стартер?**: ${json.starter}
            ♢ **Легендарный?**: ${json.legendary}
            ♢ **Мифический?**: ${json.mythical}
            ♢ **Какая Генерация?**: ${json.gen}
            `
    )
    .setFooter({ text: json.description });

  return { embeds: [embed] };
}
