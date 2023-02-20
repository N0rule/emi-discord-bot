const {
  ApplicationCommandOptionType,
  ChannelType,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
} = require("discord.js");
const { isValidColor, isHex } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "embed",
  description: "отправить embed",
  category: "ADMIN",
  userPermissions: ["ManageMessages"],
  command: {
    enabled: true,
    usage: "<#channel>",
    minArgsCount: 1,
    aliases: ["say"],
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "channel",
        description: "канал для отправки embeda",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText],
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) return message.reply("Пожалуйста выбирите подходящий канал");
    if (channel.type !== ChannelType.GuildText) return message.reply("Пожалуйста выбирите подходящий канал");
    if (!channel.canSendEmbeds()) {
      return message.reply("Нет прав на отправку embed в этом канале");
    }
    message.reply(`Embed setup запущен в ${channel}`);
    await embedSetup(channel, message.member);
  },

  async interactionRun(interaction) {
    const channel = interaction.options.getChannel("channel");
    if (!channel.canSendEmbeds()) {
      return interaction.followUp("Нет прав на отправку embed в этом канале");
    }
    interaction.followUp(`Embed setup запущен в ${channel}`);
    await embedSetup(channel, interaction.member);
  },
};

/**
 * @param {import('discord.js').GuildTextBasedChannel} channel
 * @param {import('discord.js').GuildMember} member
 */
async function embedSetup(channel, member) {
  const sentMsg = await channel.send({
    content: "Нажмите на кнопку снизу что-бы начать",
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("EMBED_ADD").setLabel("Создать Embed").setStyle(ButtonStyle.Primary)
      ),
    ],
  });

  const btnInteraction = await channel
    .awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (i) => i.customId === "EMBED_ADD" && i.member.id === member.id && i.message.id === sentMsg.id,
      time: 20000,
    })
    .catch((ex) => {});

  if (!btnInteraction) return sentMsg.edit({ content: "Не получен ответ", components: [] });

  await btnInteraction.showModal(
    new ModalBuilder({
      customId: "EMBED_MODAL",
      title: "Embed Генератор",
      components: [
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("title")
            .setLabel("Embed Заголовок")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("author")
            .setLabel("Embed Автор")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("description")
            .setLabel("Embed Описание")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
          .setCustomId("color")
          .setLabel("Embed Color")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
            .setCustomId("footer")
            .setLabel("Embed Нижний колонтитул")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),
      ],
    })
  );

  // receive modal input
  const modal = await btnInteraction
    .awaitModalSubmit({
      time: 1 * 60 * 1000,
      filter: (m) => m.customId === "EMBED_MODAL" && m.member.id === member.id && m.message.id === sentMsg.id,
    })
    .catch((ex) => {});

  if (!modal) return sentMsg.edit({ content: "Не получен ответ, остановка setup", components: [] });

  modal.reply({ content: "Embed отправлен", ephemeral: true }).catch((ex) => {});

  const title = modal.fields.getTextInputValue("title");
  const author = modal.fields.getTextInputValue("author");
  const description = modal.fields.getTextInputValue("description");
  const footer = modal.fields.getTextInputValue("footer");
  const color = modal.fields.getTextInputValue("color");

  if (!title && !author && !description && !footer)
    return sentMsg.edit({ content: "Вы не можете отправить пустой Embed!", components: [] });

  const embed = new EmbedBuilder();
  if (title) embed.setTitle(title);
  if (author) embed.setAuthor({ name: author });
  if (description) embed.setDescription(description);
  if (footer) embed.setFooter({ text: footer });
  if ((color && isValidColor(color)) || (color && isHex(color))) embed.setColor(color);

  // add/remove field button
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("EMBED_FIELD_ADD").setLabel("Добавить Поле").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("EMBED_FIELD_REM").setLabel("Удалить Поле").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("EMBED_FIELD_DONE").setLabel("Закончить").setStyle(ButtonStyle.Primary)
  );

  await sentMsg.edit({
    content: "Пожалуйста добавте поля использую кнопки снизу. Нажмите Закончить когда закончите",
    embeds: [embed],
    components: [buttonRow],
  });

  const collector = channel.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.member.id === member.id,
    message: sentMsg,
    idle: 5 * 60 * 1000,
  });

  collector.on("collect", async (interaction) => {
    if (interaction.customId === "EMBED_FIELD_ADD") {
      await interaction.showModal(
        new ModalBuilder({
          customId: "EMBED_ADD_FIELD_MODAL",
          title: "Добавить Поле",
          components: [
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("name")
                .setLabel("Имя Поля")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("value")
                .setLabel("Значение Поля")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("inline")
                .setLabel("Inline? (true/false)")
                .setStyle(TextInputStyle.Short)
                .setValue("true")
                .setRequired(true)
            ),
          ],
        })
      );

      // receive modal input
      const modal = await interaction
        .awaitModalSubmit({
          time: 5 * 60 * 1000,
          filter: (m) => m.customId === "EMBED_ADD_FIELD_MODAL" && m.member.id === member.id,
        })
        .catch((ex) => {});

      if (!modal) return sentMsg.edit({ components: [] });

      modal.reply({ content: "Поле Добавлено", ephemeral: true }).catch((ex) => {});

      const name = modal.fields.getTextInputValue("name");
      const value = modal.fields.getTextInputValue("value");
      let inline = modal.fields.getTextInputValue("inline").toLowerCase();

      if (inline === "true") inline = true;
      else if (inline === "false") inline = false;
      else inline = true; // default to true

      const fields = embed.data.fields || [];
      fields.push({ name, value, inline });
      embed.setFields(fields);
    }

    // remove field
    else if (interaction.customId === "EMBED_FIELD_REM") {
      const fields = embed.data.fields;
      if (fields) {
        fields.pop();
        embed.setFields(fields);
        interaction.reply({ content: "Поле удалено", ephemeral: true });
      } else {
        interaction.reply({ content: "Нет полей для удаления", ephemeral: true });
      }
    }

    // done
    else if (interaction.customId === "EMBED_FIELD_DONE") {
      return collector.stop();
    }

    await sentMsg.edit({ embeds: [embed] });
  });

  collector.on("end", async (_collected, _reason) => {
    await sentMsg.edit({ content: "", components: [] });
  });
}
