const { GuessThePokemon } = require("discord-gamecord");

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: "pokemonguesser",
  description: "Играть в угадай покемона",
  cooldown: 15,
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
    const Game = new GuessThePokemon({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "Это что за покемон?",
        color: "#5865F2",
      },
      stopButton: "Прекратить",
      winMessage: "Вы догадались правильно!Это был **{pokemon}**.",
      loseMessage: "Повезет в следующий раз!Это был **{pokemon}**.",
      errMessage: "🚫 Невозможно получить данные Покемонов! Пожалуйста, попробуйте еще раз.",
    });

    Game.startGame();
  },
};
