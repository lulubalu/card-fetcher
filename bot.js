// Getting libraries
require("dotenv").config();
const fs = require('fs');
const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const prefix = "!";
const express = require("express");
const app = express();
const port = 3000;
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const secretCommandFiles = fs.readdirSync('./secret_commands').filter(file => file.endsWith('.js'));

for (const file of secretCommandFiles) {
	const command = require(`./secret_commands/${file}`);
	client.commands.set(command.name, command);
}

async function registerCommands() {
    await client.application?.fetch();
    for (const file of commandFiles) {
	    const command = require(`./commands/${file}`);
	    client.commands.set(command.name, command);
        try {
            const commandSet = await client.application?.commands.create(command);
        } catch(error) {
            console.log(error);
        }
    }
    console.log("All commands registered");
}

function ErrorMessage(ErrorMsg, msg) {
    console.log(ErrorMsg);
    let ErrorEmbed = new MessageEmbed()
        .setTitle('Whoops!')
        .setDescription("Looks like I've run into an error:\n\n`" + ErrorMsg + "`\n\nPlease ping my creator @Sei Bellissima to let her know about this!\n\n||If you are the one who summoned me, Sei, shame on you. <:rookgrin:736050803021840474> Now go and fix me!||")
        .setColor(0xa90000)
    
    switch(msg.type) {
        case "DEFAULT":
            msg.channel.send({ embeds: [ ErrorEmbed ] });
            return;
        case "APPLICATION_COMMAND":
            msg.reply({ embeds: [ ErrorEmbed ] });
            return;
    }
}

function FetchCommand(message) {
    let CommandMessage = new MessageEmbed()
        .setTitle("Not a recognized fetch command")
        .setDescription("Type **!fetchhelp** to see the available commands")
        .setColor(0xa90000)
    message.channel.send({ embeds: [ CommandMessage ] });
}

//LOG ON, then WAIT FOR MESSAGES
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("!fetchhelp");
    registerCommands();
    client.channels.cache.get(process.env.LOG_CHANNEL).send({ content: "Logged in and ready!" });
});

client.on("messageCreate", async msg => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;
    let body = msg.content.slice(prefix.length);
    let command, args;
    if (body.indexOf(' ') > -1) {
        command = body.substr(0, body.indexOf(' ')).toLowerCase();
        args = body.substr(body.indexOf(" ") + 1);
    } else command = body.toLowerCase();

    if (!client.commands.has(command)) {
        if (command.startsWith("fetch")) {
            FetchCommand(msg);
        }
        return;
    }

	try {
		client.commands.get(command).execute(msg, args, client);
	} catch (error) {
		console.error(error);
		ErrorMessage(error, msg);
        client.channels.cache.get(process.env.LOG_CHANNEL).send({ content: "ERROR:\n\n` " + reason + "`" });
	}
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	try {
		client.commands.get(interaction.commandName).execute(interaction, undefined, client);
	} catch (error) {
		console.error(error);
		ErrorMessage(error, interaction);
        client.channels.cache.get(process.env.LOG_CHANNEL).send({ content: "ERROR:\n\n` " + error + "`" });
	}
});

process.on('unhandledRejection', function (reason, p) {
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    client.channels.cache.get(process.env.LOG_CHANNEL).send({ content: "ERROR:\n\n`" + reason + "`" });
});

app.get('/', (req, res) => res.send("Hello World!"));

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));

client.login(process.env.DISCORD_TOKEN);