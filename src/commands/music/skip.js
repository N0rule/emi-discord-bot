const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "skip",
  description: "пропуск текущего трека",
  category: "MUSIC",
  cooldown: 3,
  validations: musicValidations,
  command: {
    enabled: true,
    aliases: ["next", "sk"],
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = await skip(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = await skip(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
async function skip({ client, guildId }) {
  const player = client.musicManager.players.resolve(guildId);

  if (!player || !player.queue.current) {
    return "⏯️ сейчас не играет не один трек";
  }
  const title = player.queue.current.info.title;

  // Check if there is a next song in the queue
  if (player.queue.tracks.length === 0) {
    return "⏯️ Нет треков для пропуска.";
  }

  // Skip to the next song
  player.queue.next();
  return `⏯️ ${title} была пропущена.`;
}