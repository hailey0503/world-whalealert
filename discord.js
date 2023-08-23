require("dotenv").config();
const {Client, GatewayIntentBits, EmbedBuilder, PermissionBitField, Permissions} = require('discord.js');
const discordClient = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
const channel = discordClient.channels.cache.get("1143646553093984428");

/*
const url = `<YOUR WEBHOOK URL>`;
const fetch = require('node-fetch');

function sendMessage(message) {
   fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"username": "Hashnode Bot", "content": `New blog post 👉 [${message.title}](${message.url})`})
    });
}
*/
discordClient.on("ready", (x) => {
	console.log(`${x.user.tag} is ready!`);
	
	discordClient.user.setActivity('Subscribe to worldWhaleAlert');
})

const sendDiscordMessage = async (text) => {
	
	const embed = new EmbedBuilder()
		.setTitle("Whale Alert!")
		.setDescription(text)
		.setColor('Random')
		.addFields({ 
			name: 'Field title', 
			value: 'Some random value',
			inline: true,
		})
	channel.send({ embeds: [exampleEmbed] }); //????
	
}

discordClient.login(process.env.DISCORD_TOKEN)
module.exports = { discordClient, sendDiscordMessage }