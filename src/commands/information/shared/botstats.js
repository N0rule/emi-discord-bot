const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { EMBED_COLORS, SUPPORT_SERVER, DASHBOARD } = require("@root/config");
const { timeformat } = require("@helpers/Utils");
const os = require("os");
const { stripIndent } = require("common-tags");

/**
 * @param {import('@structures/BotClient')} client
 */
module.exports = (client) => {
  // STATS
  const guilds = client.guilds.cache.size;
  const channels = client.channels.cache.size;
  const users = client.guilds.cache.reduce((size, g) => size + g.memberCount, 0);

  // CPU
  const platform = process.platform.replace(/win32/g, "Windows");
  const architecture = os.arch();
  const cores = os.cpus().length;
  const cpuUsage = `${(process.cpuUsage().user / 1024 / 1024).toFixed(2)} MB`;

  // RAM
  const botUsed = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
  const botAvailable = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const botUsage = `${((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(1)}%`;

  const overallUsed = `${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const overallAvailable = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const overallUsage = `${Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)}%`;

  let desc = "";
  desc += `❒ Количество серверов: ${guilds}\n`;
  desc += `❒ Количество пользователей: ${users}\n`;
  desc += `❒ Количество Каналов: ${channels}\n`;
  desc += `❒ Пинг ВебСокета: ${client.ws.ping} мс\n`;
  desc += "\n";

  const embed = new EmbedBuilder()
    .setTitle("Информация Бота")
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(desc)
    .addFields(
      {
        name: "Проц",
        value: stripIndent`
        ❯ **ОС:** ${platform} [${architecture}]
        ❯ **Ядер:** ${cores}
        ❯ **Использование:** ${cpuUsage}
        `,
        inline: true,
      },
      {
        name: "ОП Бота",
        value: stripIndent`
        ❯ **Использовано:** ${botUsed}
        ❯ **Доступно:** ${botAvailable}
        ❯ **Использование:** ${botUsage}
        `,
        inline: true,
      },
      {
        name: "Общая ОП",
        value: stripIndent`
        ❯ **Использовано:** ${overallUsed}
        ❯ **Доступно:** ${overallAvailable}
        ❯ **Использование:** ${overallUsage}
        `,
        inline: true,
      },
      {
        name: "Node Js Версия",
        value: process.versions.node,
        inline: false,
      },
      {
        name: "Аптайм",
        value: "```" + timeformat(process.uptime()) + "```",
        inline: false,
      }
    );

  // Buttons
  let components = [];
  components.push(new ButtonBuilder().setLabel("Invite Link").setURL(client.getInvite()).setStyle(ButtonStyle.Link));

  if (SUPPORT_SERVER) {
    components.push(new ButtonBuilder().setLabel("Support Server").setURL(SUPPORT_SERVER).setStyle(ButtonStyle.Link));
  }

  if (DASHBOARD.enabled) {
    components.push(
      new ButtonBuilder().setLabel("Dashboard Link").setURL(DASHBOARD.baseURL).setStyle(ButtonStyle.Link)
    );
  }

  let buttonsRow = new ActionRowBuilder().addComponents(components);

  return { embeds: [embed], components: [buttonsRow] };
};

