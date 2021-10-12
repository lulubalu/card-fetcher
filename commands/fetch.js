const { MessageEmbed } = require("discord.js");
const _ = require("lodash");
const cardDatabase = require("../databases/cards.json");
const graftDatabase = require("../databases/grafts.json");
const bobaDatabase = require("../databases/boonsBanes.json");
const mutatorsPerksDatabase = require("../databases/mutatorsPerks.json");
const peopleDatabase = require("../databases/people.json")
const coinDatabase = require("../databases/coins.json");
const specialDatabase = require("../databases/specialCases.json");
const { sendEmbed } = require("../sendEmbed");

const databases = [ cardDatabase, graftDatabase, bobaDatabase, mutatorsPerksDatabase, peopleDatabase, coinDatabase, specialDatabase ];

const enterName = new MessageEmbed()
    .setTitle("Unable to Fetch")
    .setDescription("Please enter the name of a valid item after the command! Eg: `!fetch Stab`")
    .setColor(0xa90000)

async function NotFound(message, Request, keyFound, attemptedFetch) {
    let descToAdd = `Item "${Request}" not found!`
    if (keyFound) {
        descToAdd += `\n\nA key by the name \`${attemptedFetch}\` exists, which means the item you're searching for has no data, but an unused icon. Card Fetcher can fetch unused icons, so try \`!fetchicon ${Request}\``;
    }
    if (message.type == "APPLICATION_COMMAND") descToAdd = descToAdd.replace("!fetchicon", "/fetchicon");

    const NotFoundEmbed = new MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription(descToAdd)
        .setColor(0xa90000);
    
    if (message.type == "APPLICATION_COMMAND") {
        await message.reply({ embeds: [ NotFoundEmbed ] });
    } else {
        message.channel.send({ embeds: [ NotFoundEmbed ] });
    }
}

module.exports = {
	name: "fetch",
    description: "Fetches the requested item and all of its available info.",
    options: [
		{
			name: "input",
			description: "Enter the name of the item you want to fetch. (Required)",
			type: "STRING",
            required: true,
		},
    ],
	execute(message, args, fetchingRandom) {
        if (message.type == "APPLICATION_COMMAND" && fetchingRandom != "Fetching") {
            args = message.options.getString("input");
        }
        if (typeof args === "undefined") {
            message.channel.send({ embeds: [ enterName ] });
            return;
        }

        OriginalRequest = args;
        args = args.toLowerCase();
        let toFetch;

        //making request database-friendly
        if (args.includes("  ")) {
            do {
                args = args.replace(/ +/g, " ")
            } while (args.includes("  "));
        }

        if (args.startsWith(" ")) {
            do {
                args = args.slice(1);
            } while (args.startsWith(" "));
        }
        
        toFetch = args.replace(/\r?\n|\r/g, "").replace(/[- ]/g, "_").replace(/\+/g, "_plus").replace(/[,.':!?()\u2018\u2019\u201C\u201D]/g, "");

        let keyExists = false,
            isSpecialKey = false;
            wasFound = false;

        for (let i = 0; i < databases.length; i++) {
            if (!keyExists && i == databases.length - 1) isSpecialKey = _.has(databases[i], toFetch);
            if (!keyExists) keyExists = _.has(databases[i], toFetch);
            let valid = typeof _.get(databases[i], toFetch + ".name") !== "undefined";
            let isValidKey = keyExists && valid;

            if (isValidKey || isSpecialKey) {
                wasFound = true;
                sendEmbed(message, toFetch, databases[i], i + 1);
                break;
            }
        }

        if (!wasFound) {
            NotFound(message, OriginalRequest, keyExists, toFetch);
        }
	},
};