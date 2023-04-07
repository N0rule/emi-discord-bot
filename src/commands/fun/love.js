const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
  name: "love",
  description: "Получите процент любви двух пользователей.",
  cooldown: 10,
  category: "FUN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    aliases: [],
    usage: "<user1> <user2>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "user1",
        description: "The first user",
        type: ApplicationCommandOptionType.User,
        required: true,
      },

      {
        name: "user2",
        description: "The second user",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const user1 = args[0];
    const user2 = args[1];
    const response = await getUserLove(user1, user2, message.author);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const user1 = interaction.options.getUser("user1");
    const user2 = interaction.options.getUser("user2");
    const response = await getUserLove(user1, user2, interaction.user);
    await interaction.followUp(response);
  },
};

async function getUserLove(user1, user2, mauthor) {
  // Calculate random love percentage
  const result = Math.ceil(Math.random() * 100);

  // Determine love status based on percentage
  let loveStatus;
  if (result <= 20) {
    loveStatus = ":broken_heart: плохая пара :broken_heart:";
  } else if (result <= 50) {
    loveStatus = ":yellow_heart: Могло быть лучше :yellow_heart:";
  } else if (result <= 80) {
    loveStatus = ":heartpulse: Довольно хороший пара :heartpulse:";
  } else {
    loveStatus = ":heart_eyes: Идеальная пара :heart_eyes:";
  }

  // Determine love image based on percentage
  const loveImage =
    result >= 51
      ? "https://media1.giphy.com/media/TmngSmlDjzJfO/giphy.gif?cid=ecf05e47brm0fzk1kan0ni753jmvvik6h27sp13fkn8a9kih&rid=giphy.gif&ct=g"
      : "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTA5ZDk2MDg5NjI3NWM0ZmRlN2MzZDQ1YTdiOTU3ZTY5YTQxZjc1NSZjdD1n/ftdjO4qK3toNIsIynN/giphy.gif";

  // Create embed
  const embed = new EmbedBuilder()
    .setTitle("Любовный счетчик")
    .setDescription("Посмотрите, на сколько вы подходите! :heart:")
    .addFields({
      name: "Результат",
      value: `**${user1}** и **${user2}** подходят на **${result}%**!`,
      inline: false,
    })
    .addFields({
      name: "Статус любви",
      value: loveStatus,
      inline: false,
    })
    .setColor("LuminousVividPink")
    .setFooter({
      text: `Запрошено пользователем ${mauthor.tag}`,
    })
    .setImage(loveImage)
    .setTimestamp()
    .setThumbnail("https://www.wownow.net.in/assets/images/love.gif")
    .setFooter({ text: `Запрошено пользователем ${mauthor.tag}` });

  return { embeds: [embed] };
}
