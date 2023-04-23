const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

const NORMAL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_,;.?!/\\'0123456789";
const FLIPPED = "∀qϽᗡƎℲƃHIſʞ˥WNOԀὉᴚS⊥∩ΛMXʎZɐqɔpǝɟbɥıظʞןɯuodbɹsʇnʌʍxʎz‾'؛˙¿¡/\\,0ƖᄅƐㄣϛ9ㄥ86";

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "flip",
  description: "подбрасывает монетку или текст",
  category: "FUN",
  cooldown: 10,
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "coin",
        description: "подбрасывает монетку",
      },
      {
        trigger: "text <input>",
        description: "переварачивает текст",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "coin",
        description: "подбрасывает монетку",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "text",
        description: "переварачивает текст",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "input",
            description: "сообщения для переворота",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === "coin") {
      const items = ["Орел", "Решка"];
      const toss = items[Math.floor(Math.random() * items.length)];

      message.channel.send({ embeds: [firstEmbed(message.author)] }).then((coin) => {
        // 2nd embed
        setTimeout(() => {
          coin.edit({ embeds: [secondEmbed()] }).catch(() => {});
          // 3rd embed
          setTimeout(() => {
            coin.edit({ embeds: [resultEmbed(toss)] }).catch(() => {});
          }, 2000);
        }, 2000);
      });
    }

    //
    else if (sub === "text") {
      if (args.length < 2) return message.channel.send("Пожалуйста введите текст");
      const input = args.join(" ");
      const response = await flipText(input);
      await message.safeReply(response);
    }

    // else
    else await message.safeReply("Неправильное использование команды");
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand("type");

    if (sub === "coin") {
      const items = ["Орел", "Решка"];
      const toss = items[Math.floor(Math.random() * items.length)];
      await interaction.followUp({ embeds: [firstEmbed(interaction.user)] });

      setTimeout(() => {
        interaction.editReply({ embeds: [secondEmbed()] }).catch(() => {});
        setTimeout(() => {
          interaction.editReply({ embeds: [resultEmbed(toss)] }).catch(() => {});
        }, 2000);
      }, 2000);
    }

    //
    else if (sub === "text") {
      const input = interaction.options.getString("input");
      const response = await flipText(input);
      await interaction.followUp(response);
    }
  },
};

const firstEmbed = (user) =>
  new EmbedBuilder().setColor(EMBED_COLORS.TRANSPARENT).setDescription(`${user.username},Подбросил монетку`);

const secondEmbed = () => new EmbedBuilder().setDescription("монетка в воздухе");

const resultEmbed = (toss) =>
  new EmbedBuilder()
    .setDescription(`>> **${toss} Побеждает** <<`)
    .setImage(toss === "Орел" ? "https://i.imgur.com/VWhp7CT.png" : "https://i.imgur.com/XKBVY0s.png");

async function flipText(text) {
  let builder = "";
  for (let i = 0; i < text.length; i += 1) {
    const letter = text.charAt(i);
    const a = NORMAL.indexOf(letter);
    builder += a !== -1 ? FLIPPED.charAt(a) : letter;
  }
  return builder;
}
