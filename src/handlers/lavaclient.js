const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { Cluster } = require("lavaclient");
const { EMBED_COLORS } = require("@root/config");
const prettyMs = require("pretty-ms");
const { load, SpotifyItemType } = require("@lavaclient/spotify");
require("@lavaclient/queue/register");

/**
 * @param {import("@structures/BotClient")} client
 */
module.exports = (client) => {
  load({
    client: {
      id: process.env.SPOTIFY_CLIENT_ID,
      secret: process.env.SPOTIFY_CLIENT_SECRET,
    },
    autoResolveYoutubeTracks: false,
    loaders: [SpotifyItemType.Album, SpotifyItemType.Artist, SpotifyItemType.Playlist, SpotifyItemType.Track],
  });

  const lavaclient = new Cluster({
    nodes: client.config.MUSIC.LAVALINK_NODES,
    sendGatewayPayload: (id, payload) => client.guilds.cache.get(id)?.shard?.send(payload),
  });

  client.ws.on("VOICE_SERVER_UPDATE", (data) => lavaclient.handleVoiceUpdate(data));
  client.ws.on("VOICE_STATE_UPDATE", (data) => lavaclient.handleVoiceUpdate(data));

    // Creating Button
    let bPause = new ButtonBuilder()
    .setCustomId("Button_Pause")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("▶️")
  let bSkip = new ButtonBuilder()
    .setCustomId("Button_Skip")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("⏯")
  let bStop = new ButtonBuilder()
    .setCustomId("Button_Stop")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("⏹")
  let bLoop = new ButtonBuilder()
    .setCustomId("Button_Loop")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("🔃")
  let bShuffle = new ButtonBuilder()
    .setCustomId("Button_Shuffle")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("🔀")

  const buttonRow = new ActionRowBuilder()
    .addComponents(bPause, bSkip, bStop, bLoop, bShuffle)

  lavaclient.on("nodeConnect", (node, event) => {
    client.logger.log(`Node "${node.id}" connected`);
    
    // Because sometimes the player is disconnected and cannot resume or play again (under investigation).
    node.players.forEach(async (player) => {
      try {
        if (player.queue.tracks.length > 0) {
          // Only player have tracks in queue
          if (!player.connected) player.connect(); // Not connected but have tracks in queue because node is disconnected for a long time
          if (player.paused) player.resume(); // Or user paused the player
          if (!player.playing) player.play(); // If connected but not playing for some reasons

          const rePlayInterval = setInterval(async () => {
            // Update player to re-play current song when player is connected but stuck at current song for some reasons (under investigation).
            if (player.connected && player.playing) {
              if (player.playingSince + player.queue.current.length < new Date.now()) {
                player.queue.tracks.unshift(player.queue.current);
                await player.queue.skip();
              }
            } else {
              if (!player.connected) {
                client.logger.error("Player is not connected to any voice channel.");
                player.stop();
                clearInterval(rePlayInterval);
              } else if (!player.playing) {
                client.logger.error(
                  "Player is paused or not playing. Try playing if there is at least 1 song in queue."
                );
                if (player.queue.current.length > 0) {
                  if (player.paused) {
                    client.logger.debug(
                      `Player is paused and there is ${player.queue.current.length} ${
                        player.queue.current.length > 1 ? "songs" : "song"
                      } in queue. Trying to resume...`
                    );
                    player.resume();
                  } else {
                    client.logger.debug(
                      `Player is not playing and there is ${player.queue.current.length} ${
                        player.queue.current.length > 1 ? "songs" : "song"
                      } in queue. Trying to play...`
                    );
                    player.play();
                  }
                }
              }
            }
          }, 1000);
        }
      } catch (e) {
        client.logger.log(player.queue.tracks.length);
      }
    });
  });

  lavaclient.on("nodeDisconnect", async (node, event) => {
    client.logger.log(`Node "${node.id}" disconnected`);
    
    // Log code and reason why node is disconnected. And inform that node is trying reconnecting
    client.logger.log(`Code "${event.code}"`);
    client.logger.log(`Reason: ${event.reason}`);
    client.logger.log(`Node "${node.id}" reconnecting...`);

    // Try reconnecting node
    if (node.conn.canReconnect) {
      // If node can reconnect
      while (node.conn.reconnectTry <= 10) {
        // Try reconnecting again and again until connection is established or max connection attempts exceeded
        if (node.conn.active) break; // if connection is established so exit loop
        if (!node.conn.canReconnect) {
          // If cannot reconnect
          client.logger.log(`Node "${node.id}" reconnect failed!`);
          node.conn.connect(); // We need to connect by hand because node cannot reconnect
          break;
        }
        await node.conn.reconnect(); // Try reconnect and wait for response
      }
      if (node.conn.reconnectTry > 10) {
        // Max connection attempts exceeded
        client.logger.log(`Node "${node.id}" reconnect try times exceed!`);
        node.conn.connect(); // We need to connect by hand because node cannot reconnect
      }
    } else {
      // Else, we need to connect by hand
      node.conn.connect();
    }
  });

  lavaclient.on("nodeError", (node, error) => {
    client.logger.error(`Node "${node.id}" encountered an error: ${error.message}.`);
  });

  lavaclient.on("nodeDebug", (node, message) => {
    client.logger.debug(`Node "${node.id}" debug: ${message}`);
  });

  lavaclient.on("nodeTrackStart", (_node, queue, song) => {
    const fields = [];

    const embed = new EmbedBuilder()
      .setAuthor({ name: "Сейчас Играет" })
      .setColor(client.config.EMBED_COLORS.BOT_EMBED)
      .setDescription(`[${song.title}](${song.uri})`)
      .setFooter({ text: `Запрошено Пользователем: ${song.requester}` });

    if (song.sourceName === "youtube") {
      const identifier = song.identifier;
      const thumbnail = `https://img.youtube.com/vi/${identifier}/hqdefault.jpg`;
      embed.setThumbnail(thumbnail);
    }

    fields.push({
      name: "Длительность Песни",
      value: "`" + prettyMs(song.length, { colonNotation: true }) + "`",
      inline: true,
    });

    if (queue.tracks.length > 0) {
      fields.push({
        name: "Позиция в очереди",
        value: (queue.tracks.length + 1).toString(),
        inline: true,
      });
    }

    embed.setFields(fields);
    queue.data.channel.safeSend({ embeds: [embed], components: [buttonRow] });
  });

  lavaclient.on("nodeQueueFinish", async (_node, queue) => {
    const channel = client.channels.cache.get(queue.player.channelId);
    const embed = new EmbedBuilder().setColor(EMBED_COLORS.BOT_EMBED).setDescription("👋 Очередь закончилась");
    queue.data.channel.safeSend({ embeds: [embed] });
    //channel.safeSend("Очередь закончилась.");
    await client.musicManager.destroyPlayer(queue.player.guildId).then(queue.player.disconnect());
  });

  return lavaclient;
};
