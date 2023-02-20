const SnakeGame = require("snakecord");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "snake",
  description: "поиграть в змейку",
  cooldown: 300,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "AddReactions", "ReadMessageHistory", "ManageMessages"],
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    await message.safeReply("**Запуск игры «Змейка»**");
    await startSnakeGame(message);
  },

  async interactionRun(interaction) {
    await interaction.followUp("**Запуск игры «Змейка»**");
    await startSnakeGame(interaction);
  },
};

async function startSnakeGame(data) {
  const snakeGame = new SnakeGame({
    title: "Змейка",
    color: "BLUE",
    timestamp: true,
    gameOverTitle: "Конец Игры",
  });

  await snakeGame.newGame(data);
}
