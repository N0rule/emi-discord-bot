const { Connect4 } = require("discord-gamecord");
const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: "connect4",
  description: "Играйте в Connect4 с друзьями",
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
        description: "Выберите пользователя, чтобы поиграть",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const Game = new Connect4({
      message: interaction,
      isSlashGame: true,
      opponent: interaction.options.getUser("user"),
      embed: {
        title: "Connect4",
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
      winMessage: "{emoji} | **{player}** выиграл в Connect4.",
      tieMessage: "Ничья!Никто не выиграл игру!",
      timeoutMessage: "Игра не закончилась!Никто не выиграл игру!",
      playerOnlyMessage: "Только {player} и {opponent} могут использовать эти кнопки.",
      requestMessage: "{player} пригласил вас на раунд в **Connect4**.",
      rejectMessage: "Игрок отклонил ваш запрос на раунд в **Connect4**.",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      //   console.log(result); // =>  { result... }
      const winners = result.winner;
      const winner = `<@${winners}>`;
      if (result.result === "tie") {
        const embed = new EmbedBuilder()
          .setTitle("Connect4")
          .setDescription("Ничья! Никто не выиграл игру!")
          .setColor("Red")
          .setTimestamp();
        interaction.followUp({ embeds: [embed] });
      } else if (result.result === "win") {
        const embed = new EmbedBuilder()
          .setTitle("Connect4")
          .setDescription(`${winner} выиграл в Connect4.`)
          .setColor("Green")
          .setTimestamp();

        interaction.followUp({ embeds: [embed] });
      }
    });
  },
};
