const { TicTacToe } = require("discord-gamecord");
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: "tictactoe",
  description: "Играйте в Крестики Нолики с друзьями",
  cooldown: 40,
  category: "FUN",
  botPermissions: ["SendMessages", "EmbedLinks", "AddReactions", "ReadMessageHistory", "ManageMessages"],
  command: {
    enabled: false,
  },
  slashCommand: {
    enabled: true,
    ephermal: true,
    options: [
      {
        name: "user",
        description: "Select a user to play",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const Game = new TicTacToe({
      message: interaction,
      isSlashGame: true,
      opponent: interaction.options.getUser("user"),
      embed: {
        title: "Крестики Нолики",
        color: "#5865F2",
        statusTitle: "Статус",
        overTitle: "Конец Игры",
      },
      emojis: {
        xButton: "❌",
        oButton: "🔵",
        blankButton: "➖",
      },
      mentionUser: true,
      timeoutTime: 60000,
      xButtonStyle: "DANGER",
      oButtonStyle: "PRIMARY",
      turnMessage: "{emoji} | Очередь игрока **{player}**.",
      winMessage: "{emoji} | **{player}** выиграл в Крестики Нолики.",
      tieMessage: "Ничья!Никто не выиграл игру!",
      timeoutMessage: "Игра не закончилась!Никто не выиграл игру!",
      playerOnlyMessage: "Только {player} и {opponent} могут использовать эти кнопки.",
      requestMessage: "{player} пригласил вас на раунд в **Крестики Нолики**.",
      rejectMessage: "Игрок отклонил ваш запрос на раунд в **Крестики Нолики**.",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      //   console.log(result); // =>  { result... }
      const winners = result.winner;
      const winner = `<@${winners}>`;
      if (result.result === "tie") {
        const embed = new EmbedBuilder()
          .setTitle("Крестики Нолики")
          .setDescription("Ничья! Никто не выиграл игру!")
          .setColor("Red")
          .setTimestamp();
        interaction.followUp({ embeds: [embed] });
      } else if (result.result === "win") {
        const embed = new EmbedBuilder()
          .setTitle("Крестики Нолики")
          .setDescription(`${winner} выиграл в Крестики Нолики.`)
          .setColor("Green")
          .setTimestamp();

        interaction.followUp({ embeds: [embed] });
      }
    });
  },
};
