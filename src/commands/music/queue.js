const { EMBED_COLORS } = require("@root/config");
const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { formatTime } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "queue",
  description: "показивает текущую музыкальную очередь",
  category: "MUSIC",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    aliases: ["q"],
    usage: "[page]",
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "page",
        description: "номер страницы",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const page = args.length && Number(args[0]) ? Number(args[0]) : 1;
    const response = await getQueue(message, page);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const page = interaction.options.getInteger("page");
    const response = await getQueue(interaction, page);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {number} pgNo
 */
async function getQueue({ client, guild }, pgNo) {
  const player = client.musicManager.players.resolve(guild.id);
  if (!player) return "🚫 Сейчас музыка не играет.";

  const queue = player.queue;
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setAuthor({ name: `Очередь для ${guild.name}` });

  // change for the amount of tracks per page
  const multiple = 10;
  const page = pgNo || 1;

  const end = page * multiple;
  const start = end - multiple;

  const tracks = queue.tracks.slice(start, end);

  if (queue.current) {
    const currentTrack = queue.current;
    const duration = currentTrack.info.length > 6.048e8 ? `\`[🔴 Трансляция]\`` : `\`[${formatTime(currentTrack.info.length)}]\``;
    embed.addFields({ 
      name: "Текущий", 
      value: `[${currentTrack.info.title}](${currentTrack.info.uri}) ${duration}` 
    });
  }

  const queueList = tracks.map((track, index) => {
    const title = track.info.title;
    const uri = track.info.uri;
    const duration = track.info.length > 6.048e8 ? `\`[🔴 Трансляция]\`` : `\`[${formatTime(track.info.length)}]\``;
    return `${start + index + 1}. [${title}](${uri}) ${duration}`;
  });

  if (!queueList.length) {
    embed.setDescription(`Нет треков в ${page > 1 ? `странице ${page}` : "очереди"}.`);
  } else {
    embed.setDescription(queueList.join("\n"));
  }

  const maxPages = Math.ceil(queue.tracks.length / multiple);
  embed.setFooter({ text: `Страница ${page > maxPages ? maxPages : page} из ${maxPages}` });

  return { embeds: [embed] };
}