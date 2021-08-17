const { MessageEmbed, MessageAttachment } = require("discord.js");
const fuzzysort = require("fuzzysort");
const _ = require("lodash");

const cardDatabase = require("../databases/cards.json");
const graftDatabase = require("../databases/grafts.json");
const bobaDatabase = require("../databases/boonsBanes.json");
const mutatorsPerksDatabase = require("../databases/mutatorsPerks.json");

let cardNames = _.map(cardDatabase, "name");
cardNames = cardNames.filter(function (x) {
    return x !== undefined;
});
cardNames[cardNames.indexOf("Boosted Barrage")] = "Boosted Barrage (Battle)";
cardNames[cardNames.indexOf("Boosted Barrage")] = "Boosted Barrage (Negotiation)";
cardNames[cardNames.indexOf("Bully")] = "Bully (Card)";

let graftNames = _.map(graftDatabase, "name");
graftNames = graftNames.filter(function (x) {
    return x !== undefined;
});
graftNames[graftNames.indexOf("Burnt-out Graft")] = "Burnt-out Graft (Battle)";
graftNames[graftNames.indexOf("Burnt-out Graft")] = "Burnt-out Graft (Negotiation)";

let bobaNames = _.map(bobaDatabase, "name");
bobaNames = bobaNames.filter(function (x) {
    return x !== undefined;
});
bobaNames[bobaNames.indexOf("Bully")] = "Bully (Bane)";

let mutatorsPerksNames = _.map(mutatorsPerksDatabase, "name");
mutatorsPerksNames = mutatorsPerksNames.filter(function (x) {
    return x !== undefined;
});

const enterQuery = new MessageEmbed()
    .setTitle("Unable to Search")
    .setDescription("Please enter your search query after the command! Eg: `!fetchsearch Stab`")
    .setColor(0xa90000)

const tooShort = new MessageEmbed()
    .setTitle("Unable to Search")
    .setDescription("Your query is too short; please enter a query that is at least 4 characters in length!")
    .setColor(0xa90000)

async function noResults(message, query) {
    const noResultsEmbed = new MessageEmbed()
        .setTitle(`No Results for "${query}"!`)
        .setColor(0xa90000)
    
    if (message.type == "APPLICATION_COMMAND") {
        await message.reply({ embeds: [ noResultsEmbed ] });
    } else {
        message.channel.send({ embeds: [ noResultsEmbed ] });
    }
}

module.exports = {
	name: "fetchsearch",
	description: "Search the databases with a query.",
    options: [
		{
			name: "input",
			description: "Enter the query you want to search with. (Required)",
			type: "STRING",
            required: true,
		},
    ],
	execute(message, args) {
        if (message.type == "APPLICATION_COMMAND") {
            args = message.options.getString("input");
        }
        if (typeof args === "undefined") {
            message.channel.send({ embeds: [ enterQuery ] });
            return;
        }
        if (args.length < 4) {
            if (message.type == "APPLICATION_COMMAND") {
                message.reply({ embeds: [ tooShort ] });
            } else {
                message.channel.send({ embeds: [ tooShort ] });
            }
            return;
        }

        let toSend = "```";
            first = true;
            totalResults = 0

        const cardResults = fuzzysort.go(args, cardNames, { threshold: -30 });
        if (cardResults.length > 0) {
            totalResults += cardResults.length;
            first = false;
            toSend += "CARDS:\n\n"
            for (let i = 0; i < cardResults.length; i += 2) {
                toSend += `${cardResults[i].target.padEnd(35)}${(i + 1 == cardResults.length) ? "" : cardResults[i + 1].target}`
                    + `${(i + 2 >= cardResults.length) ? "" : "\n"}`;
            }
        }

        const graftResults = fuzzysort.go(args, graftNames, { threshold: -30 });
        if (graftResults.length > 0) {
            totalResults += graftResults.length;
            toSend += `${(first) ? "" : "\n\n"}GRAFTS:\n\n`
            if (first) first = false;
            for (let i = 0; i < graftResults.length; i += 2) {
                toSend += `${graftResults[i].target.padEnd(35)}${(i + 1 == graftResults.length) ? "" : graftResults[i + 1].target}`
                + `${(i + 2 >= graftResults.length) ? "" : "\n"}`;
            }
        }

        const bobaResults = fuzzysort.go(args, bobaNames, { threshold: -30 });
        if (bobaResults.length > 0) {
            totalResults += bobaResults.length;
            toSend += `${(first) ? "" : "\n\n"}BOONS/BANES:\n\n`
            if (first) first = false;
            for (let i = 0; i < bobaResults.length; i += 2) {
                toSend += `${bobaResults[i].target.padEnd(35)}${(i + 1 == bobaResults.length) ? "" : bobaResults[i + 1].target}`
                + `${(i + 2 >= bobaResults.length) ? "" : "\n"}`;
            }
        }

        const mutatorsPerksResults = fuzzysort.go(args, mutatorsPerksNames, { threshold: -30 });
        if (mutatorsPerksResults.length > 0) {
            totalResults += mutatorsPerksResults.length;
            toSend += `${(first) ? "" : "\n\n"}MUTATORS/PERKS:\n\n`
            if (first) first = false;
            for (let i = 0; i < mutatorsPerksResults.length; i += 2) {
                toSend += `${mutatorsPerksResults[i].target.padEnd(35)}${(i + 1 == mutatorsPerksResults.length) ? "" : mutatorsPerksResults[i + 1].target}`
                + `${(i + 2 >= mutatorsPerksResults.length) ? "" : "\n"}`;
            }
        }

        toSend += "```"
        if (totalResults > 0) {
            let caption = `${totalResults} Result${(totalResults == 1) ? "" : "s"} for **${args}**:\n`;
            if (caption.length + toSend.length > 2000) {
                toSend = toSend.slice(3);
                toSend = toSend.substring(0, toSend.length - 3);
                const attachment = new MessageAttachment(Buffer.from(toSend), "results.txt");
                caption = `${totalResults} Result${(totalResults == 1) ? "" : "s"} for **${args}**`
                    + " (Results put in txt due to message length restrictions):";
                if (message.type == "APPLICATION_COMMAND") {
                    message.reply({ content: caption, files: [ attachment ] })
                } else {
                    message.channel.send({ content: caption, files: [ attachment ] });
                }
            } else {
                if (message.type == "APPLICATION_COMMAND") {
                    message.reply({ content: caption + toSend })
                } else {
                    message.channel.send({ content: caption + toSend });
                }
            }
        } else {
            noResults(message, args)
        }
	},
};