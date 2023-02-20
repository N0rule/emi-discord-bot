const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "statstracking",
  description: "вкл/выкл отслеживания статистики на сервере",
  category: "STATS",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    aliases: ["statssystem", "statstracking"],
    usage: "<on|off>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "вкл/выкл",
        required: true,
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: "ON",
            value: "ON",
          },
          {
            name: "OFF",
            value: "OFF",
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    if (!["on", "off"].includes(input)) return message.safeReply("Неправильный ввод. должно быть ON/OFF`");
    const response = await setStatus(input, data.settings);
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const response = await setStatus(interaction.options.getString("status"), data.settings);
    await interaction.followUp(response);
  },
};

async function setStatus(input, settings) {
  const status = input.toLowerCase() === "on" ? true : false;

  settings.stats.enabled = status;
  await settings.save();

  return `Конфигурация Сохранена! Отслеживанине статистики сейчас ${status ? "вкл" : "выкл"}`;
}
