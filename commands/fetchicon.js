const { MessageEmbed, MessageAttachment } = require("discord.js");
const _ = require("lodash");
const cardDatabase = require("../databases/cards.json");
const graftDatabase = require("../databases/grafts.json");
const bobaDatabase = require("../databases/boonsBanes.json");
const mutatorsPerksDatabase = require("../databases/mutatorsPerks.json");
const specialDatabase = require("../databases/specialCases.json");

const enterName = new MessageEmbed()
    .setTitle("Unable to Fetch")
    .setDescription("Please enter the name of a valid item after the command! Eg: `!fetchicon Stab`")
    .setColor(0xa90000)

async function IconNotFoundEmbed(message, attemptedFetch) {
    let IconNotFound = new MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription(`Icon for \"${attemptedFetch}\" not found!`)
        .setColor(0xa90000)

    if (message.type == "APPLICATION_COMMAND") {
        await message.reply({ embeds: [ IconNotFound ] });
    } else {
        message.channel.send({ embeds: [ IconNotFound ] });
    }
}

async function specialCaseMessage(message, caseEntry) {
    let desc = _.get(specialDatabase, caseEntry + ".desc")
        .replace(/\!fetch/g, `${(message.type == "APPLICATION_COMMAND") ? "/" : "!" }fetchicon`);
    const specialEmbed = new MessageEmbed()
        .setTitle(_.get(specialDatabase, caseEntry + ".title"))
        .setDescription(desc)
        .setColor(0x00b71a);
    
    if (message.type == "APPLICATION_COMMAND") {
        await message.reply({ embeds: [ specialEmbed ] });
    } else {
        message.channel.send({ embeds: [ specialEmbed ] });
    }
}

module.exports = {
	name: "fetchicon",
    description: "Fetches the requested item's art.",
    options: [
		{
			name: "input",
			description: "Enter the name of the item you want to fetch. (Required)",
			type: "STRING",
            required: true,
		},
    ],
	execute(message, args, fetchingRandom) {
        if (message.type == "APPLICATION_COMMAND" && fetchingRandom != "Fetching Random") {
            args = message.options.getString("input");
        }
        if (typeof args === "undefined") {
            message.channel.send({ embeds: [ enterName ] });
            return;
        }
        let iconToFetch = args.toLowerCase();
		
        if (iconToFetch.includes("  ")) {
            iconToFetch = iconToFetch.replace(/ +/g, " ")
        }

        iconToFetch = iconToFetch.replace(/\r?\n|\r/g, "").replace(/[- ]/g, "_").replace(/\+/g, "_plus").replace(/[,.':!?\u2018\u2019\u201C\u201D]/g, "");

        if (_.has(specialDatabase, iconToFetch)) {
            specialCaseMessage(message, iconToFetch);
            return;
        }

        let databaseToUse = cardDatabase;
        let imageLink = _.get(databaseToUse, iconToFetch + ".icon");
        if (typeof imageLink === "undefined" || imageLink == "N/A") {
            databaseToUse = graftDatabase;
            imageLink = _.get(databaseToUse, iconToFetch + ".icon");
        }
        if (typeof imageLink === "undefined" || imageLink == "N/A") {
            databaseToUse = bobaDatabase;
            imageLink = _.get(databaseToUse, iconToFetch + ".icon");
        }
        if (typeof imageLink === "undefined" || imageLink == "N/A") {
            databaseToUse = mutatorsPerksDatabase;
            imageLink = _.get(databaseToUse, iconToFetch + ".icon");
        }
        if (typeof imageLink !== "undefined" && imageLink != "N/A") {
            const attachment = new MessageAttachment(imageLink);
            attachment.name = `${iconToFetch}.png`;
            console.log(`SENDING ${imageLink} AS ATTACHMENT`);
            
            if (message.type == "APPLICATION_COMMAND" || fetchingRandom == "Fetching Random") {
                let nameToUse = _.get(databaseToUse, iconToFetch + ".name");
                if (typeof nameToUse === "undefined") {
                    nameToUse = iconToFetch;
                }
                if (message.type == "APPLICATION_COMMAND") {
                    message.reply({ content: `Icon for **${nameToUse}**`, files: [ attachment ] });
                } else {
                    message.channel.send({ content: `Icon for **${nameToUse}**`, files: [ attachment ] });
                }
            } else {
                message.channel.send({ files: [ attachment ] });
            }
        } else IconNotFoundEmbed(message, args);
	},
};