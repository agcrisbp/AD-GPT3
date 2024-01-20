'use strict';

const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const express = require("express");
const path = require("path");
const app = express();
const data = fs.readFileSync("config.json");
const obj = JSON.parse(data);

const channelId = process.env.CHANNEL_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ],
});
 
// Info jika gagal login
try {
    client.login(process.env.TOKEN);
} catch (error) {
    console.error(`Gagal masuk menggunakan Discord.js: ${error.message}`);
}

app.use(express.static(path.join(__dirname, "public")));

app.post("/", async (req, res) => {
 if (req.headers["get-link"] == "true") {
  client.guilds.cache.map(async guild => {
   client.user.setActivity("Generate A Link", { type: "PLAYING" });
 
   const channel = guild.channels.cache.get(channelId);
 
   if (channel) {
    await channel.createInvite({
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