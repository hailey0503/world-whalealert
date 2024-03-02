require("dotenv").config();
const {Client, GatewayIntentBits, EmbedBuilder, PermissionBitField, Permissions} = require('discord.js');
const discordClient = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
let channel;

discordClient.on("ready", (x) => {
	console.log(`${x.user.tag} is ready!`);
	channel = discordClient.channels.cache.get(process.env.DISCORD_CHANNELID);
	//console.log('channelID',process.env.DISCORD_CHANNELID)
	//console.log('channel', channel)
	discordClient.user.setActivity('Subscribe to worldWhaleAlert');
})

const sendDiscordMessage = async (text) => {
	console.log('15')
	
	const embed = new EmbedBuilder()
		.setTitle("Whale Alert!")
		.setDescription(text)
		.setColor('Random')
		.addFields({ 
			name: 'Field title', 
			value: 'Some random value',
			inline: true,
		})
	channel.send({ embeds: [embed] }); 
	console.log('27')
	
}

discordClient.login(process.env.DISCORD_TOKEN)
module.exports = { discordClient, sendDiscordMessage }