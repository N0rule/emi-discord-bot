const { Snake } = require("discord-gamecord");

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: "snake",
  description: "Играть в змейку",
  cooldown: 300,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "AddReactions", "ReadMessageHistory", "ManageMessages"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    ephermal: true,
    options: [],
  },

  async interactionRun(interaction) {
    const Game = new Snake({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "Змейка",
        color: "#5865F2",
        overTitle: "Конец Игры",
      },
      emojis: {
        snakeHead: "🟢",
        snakeBody: "🟩",
        board: "🟦",
        food: "🍎",
      },
      stopButton: "Прекратить",
    });

    Game.startGame();
  },
};
