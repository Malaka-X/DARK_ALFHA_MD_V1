const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "XKhUjAKI#6SQnSRAiHCxbXD3nwgGKZrDUMaVLG3NMs9omg_bqY8A",
MONGODB: process.env.MONGODB || "mongodb://mongo:QDFyMgNIJnEQEdusBOqGqlvvXfLLlOXY@junction.proxy.rlwy.net:12006",
ALIVE_IMG: process.env.ALIVE_IMG || "https://i.ibb.co/QNwLWTN/20241201-230018.jpg",
BOT_NAME: process.env.BOT_NAME || "➺ᴅᴀʀᴋ-ᴀʟꜰʜᴀ-ʙᴏᴛ࿐",
LANG: process.env.BOT_LANG || 'EN' ,
OMDB_API_KEY: process.env.OMDB_API_KEY || "76cb7f39",
};
