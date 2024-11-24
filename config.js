const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "IuFyVapB#3UaDqYGrgtSjEDIj6Jaknd3O0cc8eNwjbin7VgwLvns",
MONGODB: process.env.MONGODB || "mongodb://mongo:EdhPLwBbfhyOLwmgdkRatAcogBsKbakN@autorack.proxy.rlwy.net:23902",
ALIVE_IMG: process.env.ALIVE_IMG || "https://i.ibb.co/5Rp1c5q/20241111-195552.jpg",
BOT_NUMBER: process.env.BOT_NUMBER || "94704243771",
LANG: process.env.BOT_LANG || 'EN' ,
OMDB_API_KEY: process.env.OMDB_API_KEY || "76cb7f39",
ownerNumber: process.env.ownerNumber || "94704243771",
};
