const { cmd, commands } = require("../command");
const fg = require('api-dylux')
const yts = require("yt-search");
const { fetchJson } = require("../lib/functions");
const axios = require("axios");

// YouTube MP4 download function
async function ytmp4(url, format) {
  try {
    if (!url || !format) {
      throw new Error("URL and format parameters are required.");
    }

    const resolution = parseInt(format.replace('p', ''), 10); // Convert format (e.g. '720p') to an integer (720)
    const requestParams = {
      button: 1,
      start: 1,
      end: 1,
      format: resolution,
      url: url
    };

    const requestHeaders = {
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      Origin: 'https://loader.to',
      Referer: 'https://loader.to',
      'Sec-Ch-Ua': '"Not-A.Brand";v="99", "Chromium";v="124"',
      'Sec-Ch-Ua-Mobile': '?1',
      'Sec-Ch-Ua-Platform': '"Android"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
    };

    const downloadResponse = await axios.get('https://ab.cococococ.com/ajax/download.php', {
      params: requestParams,
      headers: requestHeaders
    });

    const downloadId = downloadResponse.data.id;

    // Check download progress
    const checkProgress = async () => {
      const progressParams = { id: downloadId };
      try {
        const progressResponse = await axios.get('https://p.oceansaver.in/ajax/progress.php', {
          params: progressParams,
          headers: requestHeaders
        });
        const { progress, download_url, text } = progressResponse.data;

        // If download is finished, return the download URL, otherwise retry after 1 second
        return text === 'Finished' ? download_url : (await new Promise(resolve => setTimeout(resolve, 1000)), checkProgress());
      } catch (error) {
        throw new Error('Error in progress check: ' + error.message);
      }
    };

    return await checkProgress();
  } catch (error) {
    console.error('Error:', error);
    return { error: error.message };
  }
}

module.exports = { ytmp4 };

// Function to extract YouTube video ID from URL
function extractYouTubeId(link) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|playlist\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = link.match(regex);
  return match ? match[1] : null;
}

// Function to convert partial YouTube links to full URL
function convertYouTubeLink(link) {
  const videoId = extractYouTubeId(link);
  if (videoId) {
    return 'https://www.youtube.com/watch?v=' + videoId;
  }
  return link;
}

// Command handler for downloading songs
cmd({
  pattern: 'song',
  alias: 'play21',
  desc: 'To download songs.',
  react: '🎵',
  category: 'download',
  filename: __filename
}, async (bot, message, args, context) => {
  const {
    from, quoted, body, isCmd, command, args: commandArgs, q, isGroup, sender, senderNumber, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply
  } = context;

  try {
    if (!q) {
      return reply('Please provide a URL or title.');
    }

    // Convert partial link to full YouTube link if necessary
    const searchQuery = convertYouTubeLink(q);
    const searchResults = await yts(searchQuery);
    const video = searchResults.videos[0];
    const videoUrl = video.url;

    let messageText = `
 ╭─────────────────────❖
 │𝘔𝘈𝘓𝘈𝘒𝘈 SONG DOWNLOADING 
 ╰─────────────────────❖
 ──────────────────❖
╭────────────────❖
│ ℹ️ *DARK_ALFHA_MD* 
│
│☍ ⦁ *Title:* ${video.title} 
│☍ ⦁ *Duration:* ${video.timestamp}
│☍ ⦁ *Views:* ${video.views} 
│☍ ⦁ *Uploaded On:* ${video.ago} 
╰────────────────❖
❖──────────────────❖
╭──────────────────❖
│ © 𝙏𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙 𝙨𝙚𝙣𝙙: 🔢
│
│ *➀*  ᴀᴜᴅɪᴏ ꜰɪʟᴇ 🎶
│──────────────────❖
│ *➁*  ᴅᴏᴄᴜᴍᴇɴᴛ ꜰɪʟᴇ 📂
⁠⁠⁠⁠╰──────────────────❖
> ᴍᴀʟᴀᴋᴀ-ᴍᴅ ʙʏ ᴅᴀʀᴋ-ᴀʟꜰʜᴀ-ʙᴏᴛ . . . 👩‍💻
    `;

    // Send initial message with video details and options
    const sentMessage = await bot.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: messageText
    }, { quoted: message });

    const sentMessageId = sentMessage.key.id;

    bot.ev.on('messages.upsert', async (newMessage) => {
      const userResponse = newMessage.messages[0];
      if (!userResponse.message) return;

      const userText = userResponse.message.conversation || userResponse.message.extendedTextMessage?.text;
      const userChatId = userResponse.key.remoteJid;

      const isReplyToOriginal = userResponse.message.extendedTextMessage && userResponse.message.extendedTextMessage.contextInfo.stanzaId === sentMessageId;
      if (isReplyToOriginal) {
        await bot.sendMessage(userChatId, { react: { text: '⬇️', key: userResponse.key } });

        const downloadResponse = await fetchJson(`https://www.dark-yasiya-api.site/download/ytmp3?url=${videoUrl}`);
        const downloadUrl = downloadResponse.result.dl_link;

        // Delete the original message
        await bot.sendMessage(userChatId, { delete: sentMessage.key });
        await bot.sendMessage(userChatId, { react: { text: '⬆️', key: userResponse.key } });

        // Handle user response to download either audio or document
        if (userText === '1') {
          await bot.sendMessage(userChatId, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            contextInfo: {
              externalAdReply: {
                title: video.title,
                body: video.videoId,
                mediaType: 1,
                sourceUrl: video.url,
                thumbnailUrl: video.thumbnail,
                renderLargerThumbnail: true,
                showAdAttribution: true
              }
            }
          }, { quoted: userResponse });
          await bot.sendMessage(userChatId, { react: { text: '✅', key: userResponse.key } });
        } else if (userText === '2') {
          await bot.sendMessage(userChatId, {
            document: { url: downloadUrl },
            mimetype: 'audio/mp3',
            fileName: `${video.title}.mp3`,
            caption: "\n*© Created by Sadeesha Coder · · ·*\n "
          }, { quoted: userResponse });
          await bot.sendMessage(userChatId, { react: { text: '✅', key: userResponse.key } });
        }
      }
    });
  } catch (error) {
    console.log(error);
    reply('' + error);
  }
});

//==========video download============================
cmd({
  pattern: 'video',
  desc: "To download videos.",
  react: '🎥',
  category: "download",
  filename: __filename
}, async (client, message, _, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    // Check if URL or title is provided
    if (!q) {
      return reply("Please give me a URL or title.");
    }

    // Convert input to YouTube link format
    q = convertYouTubeLink(q);

    // Search for the YouTube video
    const searchResults = await yts(q);
    const video = searchResults.videos[0];
    const videoUrl = video.url;

    // Construct the details message
    let detailsMessage = `
      ╭─────────────────❖
      │𝘔𝘈𝘓𝘈𝘒𝘈 VIDEO DOWNLOADING
      ╰─────────────────❖
       ──────────────────❖
      ╭────────────────❖
      │ ℹ️ *DARK_ALFHA_MD* 
      │
      │☍ ⦁ *Title:* ${video.title}
      │☍ ⦁ *Duration:* ${video.timestamp}
      │☍ ⦁ *Views:* ${video.views}
      │☍ ⦁ *Uploaded On:* ${video.ago}
      ╰────────────────❖  
       ──────────────────❖
      ╭──────────────────
      │ © 𝙏𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙 𝙨𝙚𝙣𝙙: 🔢
      │
      │ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴠɪᴅᴇᴏ ꜰɪʟᴇ 📽️
      │ _➀.➀ 360ᴘ
      │ _➀.➁ 480ᴘ
      │ _➀.➂ 720ᴘ
      │ _➀.➃ 1080ᴘ
      │ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴅᴏᴄᴜᴍᴇɴᴛ 📂
      │ _➁.➀ 360ᴘ
      │ _➁.➁ 480ᴘ
      │ _➁.➂ 720ᴘ
      │ _➁.➃ 1080ᴘ
      ╰──────────────────❖
     > © ᴍᴀʟᴀᴋᴀ-ᴍᴅ ʙʏ ᴅᴀʀᴋ-ᴀʟꜰʜᴀ-ʙᴏᴛ . . . 👩‍💻
    `;

    // Send the image with the details message
    const sentMessage = await client.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: detailsMessage
    });

    const messageId = sentMessage.key.id;

    // Listen for further messages in the conversation
    client.ev.on("messages.upsert", async upsert => {
      const receivedMessage = upsert.messages[0];
      if (!receivedMessage.message) {
        return;
      }

      const text = receivedMessage.message.conversation || receivedMessage.message.extendedTextMessage?.text;
      const chatId = receivedMessage.key.remoteJid;
      const isReply = receivedMessage.message.extendedTextMessage && receivedMessage.message.extendedTextMessage.contextInfo.stanzaId === messageId;

      if (isReply) {
        // React to the message
        await client.sendMessage(chatId, {
          react: {
            text: '⬇️',
            key: receivedMessage.key
          }
        });

        // Download and send the video based on the user's choice
        let resolution = '';
        switch (text) {
          case "1.1":
            resolution = "360p";
            break;
          case "1.2":
            resolution = "480p";
            break;
          case "1.3":
            resolution = "720p";
            break;
          case "1.4":
            resolution = "1080p";
            break;
          case "2.1":
            resolution = "360";
            break;
          case "2.2":
            resolution = "480";
            break;
          case "2.3":
            resolution = "720";
            break;
          case "2.4":
            resolution = "1080";
            break;
          default:
            return;
        }

        const videoUrlWithResolution = await ytmp4(videoUrl, resolution);

        await client.sendMessage(chatId, {
          react: {
            text: '⬆️',
            key: receivedMessage.key
          }
        });

        if (text.startsWith("1.")) {
          await client.sendMessage(chatId, {
            video: { url: videoUrlWithResolution },
            caption: "\n* © ᴍᴀʟᴀᴋᴀ-ᴍᴅ ʙʏ ᴅᴀʀᴋ-ᴀʟꜰʜᴀ-ʙᴏᴛ . . . 👩‍💻*\n"
          }, {
            quoted: receivedMessage
          });
        } else {
          await client.sendMessage(chatId, {
            document: { url: videoUrlWithResolution },
            mimetype: "video/mp4",
            fileName: `${video.title}.mp4`,
            caption: "\n* © ᴍᴀʟᴀᴋᴀ-ᴍᴅ ʙʏ ᴅᴀʀᴋ-ᴀʟꜰʜᴀ-ʙᴏᴛ . . . 👩‍💻 *\n"
          }, {
            quoted: receivedMessage
          });
        }

        await client.sendMessage(chatId, {
          react: {
            text: '✅',
            key: receivedMessage.key
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
    reply('' + error);
  }
});

//download ys

cmd({
    pattern: "yts",
    alias: ["youtubesearch", "ytsearch"],
    desc: "Search for YouTube videos",
    category: "search",
    react: "🔍",
    filename: __filename,
    use: '<search query>'
},
async (conn, mek, m, { from, args, reply }) => {
    if (!args[0]) return reply('Please provide a search query !');

    const query = args.join(' ');

    try {
        const results = await yts(query);

        if (!results.videos.length) {
            return reply('No videos found for the given query.');
        }

        let response = '*YouTube Search Results:*\n\n';
        results.videos.slice(0, 20).forEach((video, index) => {
            response += `${index + 1}. *${video.title}*\n`;
            response += `   Channel: ${video.author.name}\n`;
            response += `   Duration: ${video.duration.timestamp}\n`;
            response += `   Views: ${formatNumber(video.views)}\n`;
            response += `   Uploaded: ${video.ago}\n`;
            response += `   Link: ${video.url}\n\n`;
        });

        response += `\nShowing top 20 results for "${query}"\n`;
        response += `To watch, click on the video link or use the command:\n`;

        await conn.sendMessage(from, { text: response }, { quoted: mek });
    } catch (error) {
        console.error('Error in YouTube search:', error);
        reply('❌ An error occurred while searching YouTube. Please try again later.');
    }
});

// Helper function to format large numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

//video2

cmd({
  pattern: "video2",
  alias: ["video2", "ytmp2"],
  desc: "Download video",
  category: "download",
  react: '🎬',
  filename: __filename
}, async (bot, message, options, {
  from,
  quoted,
  body,
  isCmd,
  command,
  args,
  q,
  isGroup,
  sender,
  senderNumber,
  botNumber2,
  botNumber,
  pushname,
  isMe,
  isOwner,
  groupMetadata,
  groupName,
  participants,
  groupAdmins,
  isBotAdmins,
  isAdmins,
  reply
}) => {
  try {
    if (!q) {
      return reply("*Please provide a link or a name💫*");
    }
    
    // Search YouTube for the query
    const searchResults = await yts(q);
    const video = searchResults.videos[0]; // Get the first video
    const videoUrl = video.url;
    
    // Create message with video details
    let caption = `
    ╭─────────────────❖
    │𝘔𝘈𝘓𝘈𝘒𝘈 VIDEO2 DOWNLOADING
    ╰─────────────────❖
       ──────────────────❖
      ╭────────────────❖
      │ ℹ️ *DARK_ALFHA_MD* 
      │
      │☍ ⦁ *Title:* ${video.title}
      │☍ ⦁ *Duration:* ${video.timestamp}
      │☍ ⦁ *Views:* ${video.views}
      │☍ ⦁ *Uploaded On:* ${video.ago}
      ╰────────────────❖  
     > *© 𝙿𝚘𝚠𝚎𝚛𝚍 𝙱𝚢 🧚‍♂️⃝𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 𝚅1💕⃟*
    `;

    // Send video thumbnail as an image
    await bot.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: caption
    }, { quoted: message });

    // Download the video
    const downloadResult = await fg.ytv(videoUrl);
    const videoDownloadUrl = downloadResult.dl_url;

    // Send the video file
    await bot.sendMessage(from, {
      video: { url: videoDownloadUrl },
      mimetype: "video/mp4"
    }, { quoted: message });

    // Send the video as a document
    await bot.sendMessage(from, {
      document: { url: videoDownloadUrl },
      mimetype: "video/mp4",
      fileName: `${video.title}.mp4`,
      caption: "> *© 𝙿𝚘𝚠𝚎𝚛𝚍 𝙱𝚢 𝙼𝙰𝙻𝙰𝙺𝙰-𝙼𝙳 🎬"
    }, { quoted: message });

    // React to the completion
    await options.react('✅');
  } catch (error) {
    reply(`${error}`);
  }
});

// Utility function
function hi() {
  console.log("Hello World!");
}
hi();

//video3

const videoCommand = {
  pattern: "video3",
  alias: ["ytvideo3"],
  use: ".video lelena",
  react: "📽️",
  desc: descv, // Description variable (assumed defined elsewhere)
  category: "download",
  filename: __filename
};

cmd(videoCommand, async (bot, message, args, context) => {
  const {
    from,
    prefix,
    reply,
    quoted,
    body,
    isCmd,
    command,
    args: commandArgs,
    q: query,
    isGroup,
    sender,
    senderNumber,
    botNumber,
    pushname,
    isMe,
    isOwner,
    groupMetadata,
    groupName,
    participants,
    groupAdmins,
    isBotAdmins,
    isAdmins
  } = context;

  try {
    if (!query) {
      return await reply("Please provide a video link.");
    }

    if (isUrl(query) && !ytreg(query)) {
      return await reply("Invalid YouTube link.");
    }

    if (isUrl(query) && query.includes("/shorts")) {
      const sections = [
        {
          title: "Normal Quality 🎶",
          rows: [
            { title: "240p", rowId: `${prefix}240p ${query}`, description: "240p" },
            { title: "360p", rowId: `${prefix}360p ${query}`, description: "360p" },
            { title: "480p", rowId: `${prefix}480p ${query}`, description: "480p" },
            { title: "720p", rowId: `${prefix}720p ${query}`, description: "720p" },
            { title: "1080p", rowId: `${prefix}1080p ${query}`, description: "1080p" }
          ]
        },
        {
          title: "Document Quality 📂",
          rows: [
            { title: "240p", rowId: `${prefix}24p ${query}`, description: "240p" },
            { title: "360p", rowId: `${prefix}36p ${query}`, description: "360p" },
            { title: "480p", rowId: `${prefix}48p ${query}`, description: "480p" },
            { title: "720p", rowId: `${prefix}72p ${query}`, description: "720p" },
            { title: "1080p", rowId: `${prefix}108p ${query}`, description: "1080p" }
          ]
        }
      ];

      return await bot.replyList(from, {
        caption: "👨‍💻 Select Video Type",
        footer: "Footer text here",
        sections,
        buttonText: "Reply with a number"
      }, { quoted: message });
    }

    if (ytreg(query)) {
      // Handle normal YouTube video processing
      const videoSearch = require("yt-search");
      const searchResults = await videoSearch(query);
      const video = searchResults.videos[0];
      const videoInfo = `
        📽️ *Video Downloader* 📽️
        Title: ${video.title}
        Views: ${video.views}
        Duration: ${video.timestamp}
        URL: ${video.url}
      `;

      const sections = [
        {
          title: "Normal Quality 🎶",
          rows: [
            { title: "240p", rowId: `${prefix}240p ${video.url}`, description: "240p" },
            { title: "360p", rowId: `${prefix}360p ${video.url}`, description: "360p" },
            { title: "480p", rowId: `${prefix}480p ${video.url}`, description: "480p" },
            { title: "720p", rowId: `${prefix}720p ${video.url}`, description: "720p" },
            { title: "1080p", rowId: `${prefix}1080p ${video.url}`, description: "1080p" }
          ]
        },
        {
          title: "Document Quality 📂",
          rows: [
            { title: "240p", rowId: `${prefix}24p ${video.url}`, description: "240p" },
            { title: "360p", rowId: `${prefix}36p ${video.url}`, description: "360p" },
            { title: "480p", rowId: `${prefix}48p ${video.url}`, description: "480p" },
            { title: "720p", rowId: `${prefix}72p ${video.url}`, description: "720p" },
            { title: "1080p", rowId: `${prefix}108p ${video.url}`, description: "1080p" }
          ]
        }
      ];

      return await bot.replyList(from, {
        caption: videoInfo,
        footer: "Footer text here",
        sections,
        buttonText: "Reply with a number"
      }, { quoted: message });
    }
  } catch (error) {
    reply("An error occurred.");
    console.error(error);
  }
});

//song3

const songCommand = {
  pattern: "song3",
  alias: ["ytsong3"],
  use: ".song lelena",
  react: '🎧',
  category: "download",
  filename: __filename,
  desc: descs
};

cmd(songCommand, async (bot, message, args, {
  from,
  prefix,
  quoted,
  body,
  isCmd,
  command,
  q,
  isGroup,
  sender,
  senderNumber,
  botNumber,
  pushname,
  isMe,
  isOwner,
  groupMetadata,
  groupName,
  participants,
  groupAdmins,
  isBotAdmins,
  isAdmins,
  reply
}) => {
  try {
    // If no query is provided
    if (!q) {
      return await reply("Please provide a YouTube link or search query.");
    }

    // Validate the URL and check if it's a YouTube Shorts URL
    if (isUrl(q) && !ytreg(q)) {
      return await reply("Invalid YouTube URL.");
    }

    if (isUrl(q) && q.includes("/shorts")) {
      const options = [{
        title: '',
        rows: [
          { title: '1', rowId: prefix + "ytmp3 " + q, description: "Normal type song 🎶" },
          { title: '2', rowId: prefix + "ytdocs " + q, description: "Document type song 📂" }
        ]
      }];

      const response = {
        text: "[👨‍💻 VAJIRA - MD 👨‍💻]\n\n*SELECT SONG TYPE*",
        footer: "*Powered by Technical Cybers*",
        buttonText: "🔢 Reply below number to select song type.",
        sections: options
      };

      return await bot.replyList(from, response, { quoted: message });
    }

    // Handle normal YouTube links
    if (ytreg(q)) {
      const options = [{
        title: '',
        rows: [
          { title: '1', rowId: prefix + "ytmp3 " + q, description: "Normal type song 🎶" },
          { title: '2', rowId: prefix + "ytdocs " + q, description: "Document type song 📂" }
        ]
      }];

      const response = {
        text: "[👨‍💻 VAJIRA - MD 👨‍💻]\n\n*SELECT SONG TYPE*",
        footer: "*Powered by Technical Cybers*",
        buttonText: "🔢 Reply below number to select song type.",
        sections: options
      };

      return await bot.replyList(from, response, { quoted: message });
    }

    // Convert YouTube search query into a link
    q = convertYouTubeLink(q);
    const searchResults = await yts(q);
    const video = searchResults.videos[0];

    const videoInfo = `
📽️ *VAJIRA-MD VIDEO-DOWNLOADER* 📽️

┌──────────────────

*ℹ️ Title:* ${video.title}
*👁️‍🗨️ Views:* ${video.views}
*🕘 Duration:* ${video.timestamp}
*📌 Ago:* ${video.ago}
*🔗 Url:* ${video.url}

└──────────────────`;

    const options = [{
      title: '',
      rows: [
        { title: '1', rowId: prefix + "ytmp3 " + video.url, description: "Normal type song 🎶" },
        { title: '2', rowId: prefix + "ytdocs " + video.url, description: "Document type song 📂" }
      ]
    }];

    const response = {
      image: { url: video.thumbnail },
      caption: videoInfo,
      footer: config.FOOTER,
      title: '',
      buttonText: "🔢 Reply below number",
      sections: options
    };

    return await bot.replyList(from, response, { quoted: message });
  } catch (error) {
    reply("ERROR !!");
    console.error(error);
  }
});



