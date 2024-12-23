const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { musicValidations } = require("@helpers/BotUtils");
const { EMBED_COLORS } = require("@root/config.js");
/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "rfqueue",
  description: "удаляет песню из очереди (last для последней)",
  category: "MUSIC",
  cooldown: 3,
  validations: musicValidations,
  command: {
    enabled: true,
    aliases: ["rfq", "rq"],
    usage: "<song-number>",
    minArgsCount: 0,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "id",
        description: "Введите позицию трека в очереди (last для последней)",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const player = message.client.musicManager.players.resolve(message.guild.id);
    if (!player) return message.safeReply("🚫 Сейчас музыка не играет.");

    if (player.queue.tracks.length === 0) {
      return message.safeReply("❌ В очереди нет треков для удаления.");
    }


    let index;
    if (args.length === 0) {
      index = player.queue.tracks.length - 1; // Default to the last track if no arguments provided
    } else if (args[0] === "last") {
      index = player.queue.tracks.length - 1;
    } else {
      index = parseInt(args[0]) - 1;
      if (isNaN(index) || index < 0 || index >= player.queue.tracks.length)
        return message.safeReply(
          `Пожалуйста, введите допустимый номер трека (1-${player.queue.tracks.length}) или "last" для удаления последнего трека.`
        );
    }

    const removedTrack = player.queue.remove(index);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setDescription(`✅ **${removedTrack.info.title}** был удален из очереди.`);

    await message.safeReply({ embeds: [embed] });
  },

  async interactionRun(interaction) {
    const player = interaction.client.musicManager.players.resolve(interaction.guild.id);
    if (!player) return interaction.followUp("🚫 Сейчас музыка не играет.");

    if (player.queue.tracks.length === 0) {
      return interaction.followUp("❌ В очереди нет треков для удаления.");
    }


    const input = interaction.options.getString("id");
    let index;
    if (input === "last") {
      index = player.queue.tracks.length - 1;
    } else {
      index = parseInt(input) - 1;
      if (isNaN(index) || index < 0 || index >= player.queue.tracks.length)
        return interaction.followUp(
          `Пожалуйста, введите допустимый номер трека (1-${player.queue.tracks.length}) или "last" для удаления последнего трека.`
        );
    }

    const removedTrack = player.queue.remove(index);

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.SUCCESS)
      .setDescription(`✅ **${removedTrack.info.title}** был удален из очереди.`);

    await interaction.followUp({ embeds: [embed] });
  },
};
