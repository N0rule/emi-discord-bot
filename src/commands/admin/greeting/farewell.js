const { isHex } = require("@helpers/Utils");
const { buildGreeting } = require("@handlers/greeting");
const { ApplicationCommandOptionType, ChannelType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "farewell",
  description: "настроить прощальное сообщение",
  category: "ADMIN",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    minArgsCount: 1,
    subcommands: [
      {
        trigger: "status <on|off>",
        description: "Включить или отключить прощальное сообщение",
      },
      {
        trigger: "channel <#channel>",
        description: "Настроить прощальное сообщение",
      },
      {
        trigger: "preview",
        description: "Предварительный просмотр настроенного прощального сообщения",
      },
      {
        trigger: "desc <text>",
        description: "Установите embed описание",
      },
      {
        trigger: "thumbnail <ON|OFF>",
        description: "Включить/отключить embed миниатюр",
      },
      {
        trigger: "color <hexcolor>",
        description: "Установите embed цвет",
      },
      {
        trigger: "footer <text>",
        description: "установить содержание embed footer",
      },
      {
        trigger: "image <url>",
        description: "Установите embed изображение",
      },
    ],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "status",
        description: "Включить или отключить прощальное сообщение",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "включено или отключено",
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
      {
        name: "preview",
        description: "Предварительный просмотр настроенного прощального сообщения",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "channel",
        description: "установить прощальный канал",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "Название канала",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true,
          },
        ],
      },
      {
        name: "desc",
        description: "Установите embed описание",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "content",
            description: "Описание Содержания",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "thumbnail",
        description: "Настройка embed миниатюры",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "status",
            description: "Статус миниатюры",
            type: ApplicationCommandOptionType.String,
            required: true,
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
      {
        name: "color",
        description: "Установите embed цвет",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "hex-code",
            description: "цветовой hex-код",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "footer",
        description: "установить embed footer",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "content",
            description: "Содержание footer",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
      {
        name: "image",
        description: "Установить embed изображение",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "url",
            description: "URL изображения",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      },
    ],
  },

  async messageRun(message, args, data) {
    const type = args[0].toLowerCase();
    const settings = data.settings;
    let response;

    // preview
    if (type === "preview") {
      response = await sendPreview(settings, message.member);
    }

    // status
    else if (type === "status") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Неверный статус. Значение должно быть `on/off`");
      response = await setStatus(settings, status);
    }

    // channel
    else if (type === "channel") {
      const channel = message.mentions.channels.first();
      response = await setChannel(settings, channel);
    }

    // desc
    else if (type === "desc") {
      if (args.length < 2)
        return message.safeReply("Недостаточно аргументов! Пожалуйста, предоставьте действительный контент");
      const desc = args.slice(1).join(" ");
      response = await setDescription(settings, desc);
    }

    // thumbnail
    else if (type === "thumbnail") {
      const status = args[1]?.toUpperCase();
      if (!status || !["ON", "OFF"].includes(status))
        return message.safeReply("Неверный статус. Значение должно быть `on/off`");
      response = await setThumbnail(settings, status);
    }

    // color
    else if (type === "color") {
      const color = args[1];
      if (!color || !isHex(color)) return message.safeReply("Неверный цвет. Значение должно быть hex-кодом");
      response = await setColor(settings, color);
    }

    // footer
    else if (type === "footer") {
      if (args.length < 2)
        return message.safeReply("Недостаточно аргументов! Пожалуйста, предоставьте действительный контент");
      const content = args.slice(1).join(" ");
      response = await setFooter(settings, content);
    }

    // image
    else if (type === "image") {
      const url = args[1];
      if (!url) return message.safeReply("Недопустимый URL. Пожалуйста, предоставьте действительный URL");
      response = await setImage(settings, url);
    }

    //
    else response = "Неверное использование команды!";
    return message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const sub = interaction.options.getSubcommand();
    const settings = data.settings;

    let response;
    switch (sub) {
      case "preview":
        response = await sendPreview(settings, interaction.member);
        break;

      case "status":
        response = await setStatus(settings, interaction.options.getString("status"));
        break;

      case "channel":
        response = await setChannel(settings, interaction.options.getChannel("channel"));
        break;

      case "desc":
        response = await setDescription(settings, interaction.options.getString("content"));
        break;

      case "thumbnail":
        response = await setThumbnail(settings, interaction.options.getString("status"));
        break;

      case "color":
        response = await setColor(settings, interaction.options.getString("hex-code"));
        break;

      case "footer":
        response = await setFooter(settings, interaction.options.getString("content"));
        break;

      case "image":
        response = await setImage(settings, interaction.options.getString("url"));
        break;

      default:
        response = "Неверный подкоманда";
    }

    return interaction.followUp(response);
  },
};

async function sendPreview(settings, member) {
  if (!settings.farewell?.enabled) return "Прощальное сообщение не включено на этом сервере";

  const targetChannel = member.guild.channels.cache.get(settings.farewell.channel);
  if (!targetChannel) return "Ни один канал не настроен на отправку прощального сообщения";

  const response = await buildGreeting(member, "FAREWELL", settings.farewell);
  await targetChannel.safeSend(response);

  return `Отправлено предпросмотр прощального сообщения в ${targetChannel.toString()}`;
}

async function setStatus(settings, status) {
  const enabled = status.toUpperCase() === "ON" ? true : false;
  settings.farewell.enabled = enabled;
  await settings.save();
  return `Конфигурация сохранена! Прощальное сообщение ${enabled ? "включено" : "выключено"}`;
}

async function setChannel(settings, channel) {
  if (!channel.canSendEmbeds()) {
    return (
      "Уфф! Я не могу отправить приветствие на этот канал? Мне нужны разрешения `записывать сообщения` и `встраивать ссылки` в " +
      channel.toString()
    );
  }
  settings.farewell.channel = channel.id;
  await settings.save();
  return `Конфигурация сохранена! Прощальные сообщение будет отправлены в канал ${
    channel ? channel.toString() : "Не найдено"
  }`;
}

async function setDescription(settings, desc) {
  settings.farewell.embed.description = desc;
  await settings.save();
  return "Конфигурация сохранена! Прощальное сообщение обновлено";
}

async function setThumbnail(settings, status) {
  settings.farewell.embed.thumbnail = status.toUpperCase() === "ON" ? true : false;
  await settings.save();
  return "Конфигурация сохранена! Прощальное сообщение обновлено";
}

async function setColor(settings, color) {
  settings.farewell.embed.color = color;
  await settings.save();
  return "Конфигурация сохранена! Прощальное сообщение обновлено";
}

async function setFooter(settings, content) {
  settings.farewell.embed.footer = content;
  await settings.save();
  return "Конфигурация сохранена! Прощальное сообщение обновлено";
}

async function setImage(settings, url) {
  settings.farewell.embed.image = url;
  await settings.save();
  return "Конфигурация сохранена! Прощальное сообщение обновлено";
}
