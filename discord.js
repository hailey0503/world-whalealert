require("dotenv").config();
const {Client, GatewayIntentBits, EmbedBuilder, PermissionBitField, Permissions} = require('discord.js');
const discordClient = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

discordClient.on("ready", (x) => {
	console.log(`${x.user.tag} is ready!`);
	discordClient.user.setActivity('Subscribe to worldWhaleAlert');
})

discordClient.login(process.env.DISCORD_TOKEN)
module.exports = { discordClient }