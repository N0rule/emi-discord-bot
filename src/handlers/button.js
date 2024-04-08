const { LoopType } = require("@lavaclient/queue");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function pauseButton(client, interaction) {
  await interaction.deferUpdate();
  const player = client.musicManager.getPlayer(interaction.guildId);

  if (!interaction.member.voice.channel) {
    return interaction.channel.send("🚫 Музыка сейчас не играет!");
  };
  if (!interaction.guild.members.me.voice.channel) {
    return interaction.channel.send("🚫 Сперва,тебе нужно присоединиться в мой голосовой канал.");
  };
  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return interaction.channel.send("🚫 Ты не в том же голосовом канале.");
  };

  if (!player.paused) {
    await player.pause();
    return interaction.channel.send("⏸️ Музыка остановлена.");
  };
  if (player.paused) {
    await player.resume();
    return interaction.channel.send("▶️ Продолжено прослушивание музыки.");
  };
};

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function skipButton(client, interaction) {
  await interaction.deferUpdate();
  const player = client.musicManager.getPlayer(interaction.guildId);

  if (!interaction.member.voice.channel) {
    return interaction.channel.send("🚫 Музыка сейчас не играет!");
  };
  if (!interaction.guild.members.me.voice.channel) {
    return interaction.channel.send("🚫 Сперва,тебе нужно присоединиться в мой голосовой канал.");
  };
  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return interaction.channel.send("🚫 Ты не в том же голосовом канале.");
  };
  
  const { title } = player.queue.current;
  return player.queue.next() ? `⏯️ ${title} была пропущена.` : "⏯️ Нет треков для пропуска.";
};

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function stopButton(client, interaction) {
  await interaction.deferUpdate();
  const player = client.musicManager.getPlayer(interaction.guildId);

  if (!interaction.member.voice.channel) {
    return interaction.channel.send("🚫 Музыка сейчас не играет!");
  };
  if (!interaction.guild.members.me.voice.channel) {
    return interaction.channel.send("🚫 Сперва,тебе нужно присоединиться в мой голосовой канал.");
  };
  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return interaction.channel.send("🚫 Ты не в том же голосовом канале.");
  };

  if (player.playing) {
    player.disconnect();
    await client.musicManager.destroyPlayer(interaction.guildId);
    return interaction.channel.send("🎶 Музыка была остановлена и очередь была очищена");
  };
};

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function loopButton(client, interaction) {
  await interaction.deferUpdate();
  const player = client.musicManager.getPlayer(interaction.guildId);

  if (!interaction.member.voice.channel) {
    return interaction.channel.send("🚫 Музыка сейчас не играет!");
  };
  if (!interaction.guild.members.me.voice.channel) {
    return interaction.channel.send("🚫 Сперва,тебе нужно присоединиться в мой голосовой канал.");
  };
  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return interaction.channel.send("🚫 Ты не в том же голосовом канале.");
  };

  // Looping Track
  if (player.queue.loop.type === 0) {
    player.queue.setLoop(LoopType.Song);
    return interaction.channel.send("Режим зацикливания установлен на `Трек`");
  };
  // Looping Queue
  if (player.queue.loop.type === 2) {
    player.queue.setLoop(LoopType.Queue);
    return interaction.channel.send("Режим зацикливания установлен на `Очередь`");
  };
  // Turn OFF Looping
  if (player.queue.loop.type === 1) {
    player.queue.setLoop(LoopType.None);
    return interaction.channel.send("Режим зацикливания выключен.");
  };
};

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function shuffleButton(client, interaction) {
  await interaction.deferUpdate();
  const player = client.musicManager.getPlayer(interaction.guildId);

  if (!interaction.member.voice.channel) {
    return interaction.channel.send("🚫 Музыка сейчас не играет!");
  };
  if (!interaction.guild.members.me.voice.channel) {
    return interaction.channel.send("🚫 Сперва,тебе нужно присоединиться в мой голосовой канал.");
  };
  if (interaction.guild.members.me.voice.channel && !interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
    return interaction.channel.send("🚫 Ты не в том же голосовом канале.");
  };

  player.queue.shuffle();
  return interaction.channel.send("🎶 Очередь была перемешана");
};

module.exports = {
  pauseButton,
  skipButton,
  stopButton,
  loopButton,
  shuffleButton,
};