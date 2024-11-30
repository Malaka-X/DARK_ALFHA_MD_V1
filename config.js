const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "youre session id",
MONGODB: process.env.MONGODB || "enter mongodb here",
ALIVE_IMG: process.env.ALIVE_IMG || "https://i.ibb.co/V2pdBTJ/20241111-195632.jpg",
BOT_NAME: process.env.BOT_NAME || "➺ᴅᴀʀᴋ-ᴀʟꜰʜᴀ-ʙᴏᴛ࿐",
LANG: process.env.BOT_LANG || 'EN' ,
OMDB_API_KEY: process.env.OMDB_API_KEY || "76cb7f39",
};
