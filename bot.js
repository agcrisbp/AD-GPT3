'use strict';

const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
require('dotenv').config();
const collection = new Map();
require('colors');
const fs = require('fs');
const moment = require('moment-timezone');
const commands = require('./commands');
const cron = require('node-cron');
const express = require("express");
const path = require("path");
const app = express();

const data = fs.readFileSync("config.json");
const obj = JSON.parse(data);


// Setel zona waktu ke WIB (Indonesia Jakarta)
moment.tz.setDefault('Asia/Jakarta');


const logFilePath = path.join(__dirname, 'gpt_3.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Alihkan console.log ke file log
const originalConsoleLog = console.log;

let lastLoggedMessage = '';

console.log = function (message) {
    const formattedTimestamp = moment().format('dd, DD-MM-YYYY HH:mm:ss');
    const logEntry = `[${formattedTimestamp}] ${message}`;
    
    if (logEntry !== lastLoggedMessage) {
        logStream.write(`${logEntry}\n`);
        lastLoggedMessage = logEntry;
    }
};

// Jadwalkan tugas untuk menghapus konten file log setiap hari pada pukul 00.00 WIB
cron.schedule('0 0 * * *', () => {
    fs.truncateSync(logFilePath);
    console.log('[GPT-3.5] Log berhasil dihapus otomatis!');
});

// Inisialisasi klien Discord.js
const client = new Client({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers // Add this intent
    ],
    allowedMentions: {
        repliedUser: true,
        parse: ['users', 'roles', 'everyone']
    },
    presence: {
        activities: [],
        status: "online"
    },
});

client.once('ready', async () => {
    const serverId = process.env.SERVER_ID;
    let serverName = "Unknown Server";

    try {
        const server = await client.guilds.fetch(serverId);
        serverName = server ? server.name : serverName;
    } catch (error) {
        console.error(`Failed to fetch server information: ${error.message}`);
    }

    client.user.setPresence({
        activities: [{ name: `${serverName}`, type: 3 }],
        status: 'online'
    });

    console.log(`Logged in as ${client.user.tag} in server: ${serverName}`.green);
});


// Pencegahan Crash
process.on('unhandledRejection', async (err, cause) => {
    console.log(`[Uncaught Rejection]: ${err}`.bold.red);
    console.log(cause);
});

process.on('uncaughtException', async err => {
    console.log(`[Uncaught Exception] ${err}`.bold.red);
});

client.on('ready', async () => {
    const stringlength = 69;
    console.log(`┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`.magenta)
    console.log(`┃ `.magenta + " ".repeat(-1 + (stringlength - ` ┃ `.length - `[Events] ${client.user.tag} is online!`.length) / 2) + `[Events] ${client.user.tag} is online!`.green.bold + " ".repeat((stringlength - ` ┃ `.length - `[Events] ${client.user.tag} is online!`.length) / 2) + "┃".magenta)
    console.log(`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.magenta);
    
});

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

let prompt = [
    {"role": "system", "content": `I'm AD-GPT, created by [Aghea](https://aghea.site/discord), a Freelance Developer and Cybersecurity, you can check his website at https://aghea.site. You can contact Aghea without any login required at https://contact.aghea.site or email him at https://email.aghea.site. AD-GPT is an Utility Discord Bot which has Chatbot feature. I have to chat casually. Do not give information on adult topics. Always Format text using markdown: **bold**, # Heading 1, ## Heading 2 and ### Heading 3 to write headings. Support server: https://west.fly.dev/.`},
];// Kamu bisa memodifikasi prompt ini

// Daftar perintah yang diizinkan
const allowedCommands = ['!clean', '!log']; 

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.guild.available) await message.guild.fetch().catch(e => null);

    const allowedChannels = process.env.CHANNEL_ID ? process.env.CHANNEL_ID.split(',').map(channelId => BigInt(channelId.trim())) : [];
    const currentChannelId = BigInt(message.channel.id);

    // Check if the message is in the designated welcome channel
    if (message.content.toLowerCase().includes('welcome') && allowedChannels.includes(currentChannelId)) {
        // Handle welcome message logic here
        console.log('Welcome message logic triggered.');
        return;
    }

    // Check if the message is in the designated chatbot channel
    if (allowedChannels.length > 0 && !allowedChannels.includes(currentChannelId)) {
        return;
    }

// Fungsi async untuk mendapatkan nama server dan nama channel berdasarkan ID channel
async function getServerAndChannelNames(channelId) {
    try {
        const channel = await client.channels.fetch(channelId);
        const serverName = channel.guild ? channel.guild.name : 'Server Tidak Dikenal';
        const channelName = channel.name || 'Channel Tidak Dikenal';
        return { serverName, channelName };
    } catch (error) {
        console.error(`Error saat mengambil nama server dan channel untuk ID channel ${channelId}: ${error.message}`);
        return { serverName: 'Server Tidak Dikenal', channelName: 'Channel Tidak Dikenal' };
    }
}

if (allowedChannels.length > 0) {


    // Mengambil informasi server dan channel untuk channel saat ini
    const currentChannelId = BigInt(message.channel.id);
    const { serverName, channelName } = await getServerAndChannelNames(currentChannelId);

    console.log(`[GPT-3.5] ${serverName} #${channelName} oleh ${message.author.tag}: "${message.cleanContent}"`);
} else {
    console.log('CHANNEL_ID belum diatur.');
}

    try {
        // Continue with the chatbot logic only if the message is in the allowed channel
        if (message.content.toLowerCase() === '!clean' && commands.isBotOwner(message.author.id)) {
            // Tangani perintah !clean untuk pemilik bot
            commands.cleanLogFile(message.channel);
            return;
        } else if (message.content.toLowerCase() === '!log' && commands.isBotOwner(message.author.id)) {
            // Tangani perintah !log untuk pemilik bot
            commands.sendLogFileToOwner(message.author, message.channel);
            return;
        }
        
        collection.forEach((value, key) => {
            let l = value[value.length - 1];
            if (!l || !Array.isArray(l) || !l[0]) return collection.delete(key);
            if (Date.now() - l[0] >= 60 * 1000) collection.delete(key)
        });

        if (!message.channel.permissionsFor(client.user.id).has(PermissionsBitField.Flags.SendMessages)) return;
        if (message.type != 0 || ![0, 5, 10, 11, 12].includes(message.channel.type)) return; // Mengabaikan Balasan

        message.channel.sendTyping().catch(e => { null }); // Bot sedang mengetik..

        if (!collection.has(message.author.id)) {
            collection.set(message.author.id, []);
        }

        let userm = collection.get(message.author.id);
        if (!userm || !Array.isArray(userm)) userm = [];
        userm = userm.filter(d => d && d[0]);
        userm = userm.filter(d => 60 * 1000 - (Date.now() - d[0]) >= 0);

        // Mengenali pengirim pesan
        let prev = [
            { 'role': 'user', 'content': `Hi! My name is ${message.member.displayName}` },
            { 'role': 'assistant', 'content': `Nice to meet you ${message.member.displayName}!` }
        ];
        // -------

        // Memuat percakapan sebelumnya
        await userm.forEach(async d => {
            let userline = [d[1]];
            let botline = userline.concat([d[2]]);
            prev = prev.concat(botline);
        });

        let b = prompt.concat(prev).concat([{ "role": "user", "content": message.cleanContent }]);
        // console.log(b); // untuk debugging.

        const openai = new OpenAIApi(configuration);
        let err = false;
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: b,
            temperature: 0.9,
            max_tokens: 1500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.6,
        }).catch(async e => {
            console.log(`${e}`.red);
            err = true;
            await message.channel.send({ content: `[Kesalahan OpenAI]`.concat(e) });
        });

        if (err || !Array.isArray(response.data.choices)) return;

        let reply = response.data.choices[0]?.message?.content;

        // Memotong pesan untuk menghindari limit character Discord
        await commands.sendMessageInChunks(message.channel, reply);

        if (err) return;

        userm.push([Date.now(), { "role": "user", "content": message.cleanContent }, { "role": "assistant", "content": reply }]);
        collection.set(message.author.id, userm);

        return;
    } catch (e) {
        console.log(`[AI-Chat] ${e}`.red);
    }
});

client.on('guildMemberAdd', async member => {
    console.log(`New member joined: ${member.user.tag}`);
    
    // Increment the member count
    const memberCount = member.guild.memberCount;

    const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
    const welcomeMessage = `Welcome ${member.user}! You are the ${memberCount}th member. <a:EmojiName:EmojiID>
    
> Let's talk in <#ChannelID>.
`; // Replace with your welcome message

    try {
        const welcomeChannel = await member.guild.channels.fetch(welcomeChannelId);
        if (welcomeChannel) {
            if (welcomeChannel.permissionsFor(client.user.id).has(PermissionsBitField.Flags.SendMessages)) {
                welcomeChannel.send(welcomeMessage);
            } else {
                console.error(`Tidak mempunyai izin mengirim pesan di channel ${welcomeChannel.name}`);
            }
        } else {
            console.error(`Welcome channel tidak ditemukan.`);
        }
    } catch (error) {
        console.error(`Error mengirim pesan selamat datang: ${error.message}`);
    }
});

client.once('ready', async () => {
    const serverId = process.env.SERVER_ID;
    let serverName = "Unknown Server";

    try {
        const server = await client.guilds.fetch(serverId);
        serverName = server ? server.name : serverName;
    } catch (error) {
        console.error(`Failed to fetch server information: ${error.message}`);
    }

    client.user.setPresence({
        activities: [{ name: `${serverName}`, type: 3 }],
        status: 'online'
    });

    console.log(`Logged in as ${client.user.tag} in server: ${serverName}`.green);
});

// Pencegahan Crash
process.on('unhandledRejection', async (err, cause) => {
    console.log(`[Uncaught Rejection]: ${err}`.bold.red);
    console.log(cause);
});

process.on('uncaughtException', async err => {
    console.log(`[Uncaught Exception] ${err}`.bold.red);
});
 
// Info jika gagal login
try {
    client.login(process.env.DISCORD_BOT_TOKEN);
} catch (error) {
    console.error(`Gagal masuk menggunakan Discord.js: ${error.message}`);
}

const inviteChannelId = process.env.INVITE_CHANNEL_ID;

app.use(express.static(path.join(__dirname, "public")));

app.post("/", async (req, res) => {
 if (req.headers["get-link"] == "true") {
  client.guilds.cache.map(async guild => {
   client.user.setActivity("Generate A Link", { type: "PLAYING" });
 
   const inviteChannel = guild.channels.cache.get(inviteChannelId);
 
   if (inviteChannel) {
    await inviteChannel.createInvite({
     maxAge: obj["bot-settings"]["max-age"],
     maxUses: obj["bot-settings"]["max-uses"]
    }).then(async (invite) => {
     client.user.setActivity();
     res.send(`${invite.url}`);
    });
   }
  });
 }
 else {
  res.send("Header Argument Not Found!");
 }

});

app.listen(obj["site-settings"]["port"], () => {
 console.log("Server running in http://0.0.0.0:"+obj["site-settings"]["port"]);
});