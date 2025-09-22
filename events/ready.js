require('dotenv').config();
const { Events } = require("discord.js");
const RichPresenceManager = require('../utils/richPresence');

let presenceManager;

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    console.log(`Bot is running in ${process.env.NODE_ENV} mode`);

    presenceManager = new RichPresenceManager(client);
    presenceManager.start();
  },
};