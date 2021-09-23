const { MessageEmbed, MessageAttachment } = require("discord.js");
const fuzzysort = require("fuzzysort");
const _ = require("lodash");

const cardDatabase = require("../databases/cards.json");
const graftDatabase = require("../databases/grafts.json");
const bobaDatabase = require("../databases/boonsBanes.json");
const mutatorsPerksDatabase = require("../databases/mutatorsPerks.json");
const coinDatabase = require("../databases/coins.json");

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

const validOptions = [ "name", "flavor", "flavour", "description" ]

const enterQuery = new MessageEmbed()
    .setTitle("Unable to Search")
    .setDescription("Please enter your search query after the command! Eg: `!fetchsearch Stab`")
    .setColor(0xa90000)

const enterQueryOption = new MessageEmbed()
    .setTitle("Unable to Search")
    .setDescription("Please enter your search query after the option! Eg: `!fetchsearch -description Drink`")
    .setColor(0xa90000)

const tooShort = new MessageEmbed()
    .setTitle("Unable to Search")
    .setDescription("Your query is too short; please enter a query that is at least 4 characters in length!")
    .setColor(0xa90000)

async function noResults(message, query) {
    let descToAdd = `Trouble finding what you're searching for? Try search options:\n\n`;
    if (message.type == "APPLICATION_COMMAND") {
        descToAdd += "Type `/fetchsearch`, enter your query into `input`, and then an option into `option`.\n\n The valid options are are `name`, `flavor`, `flavour`, `description`\n\n"
        + "For example: \"/fetchsearch `input:Influence` `option:description`\" returns all cards with \"Influence\" in their descriptions.";
    } else {
        descToAdd += "!fetchsearch [-optional option] [search query]\n\n"
        + "The valid options are are `name`, `flavor`, `flavour`, `description`\n\n"
        + "For example: `!fetchsearch -description Influence` returns all cards with \"Influence\" in their descriptions.";
    }
    const noResultsEmbed = new MessageEmbed()
        .setTitle(`No Results for "${query}"!`)
        .setDescription(descToAdd)
        .setColor(0xa90000)
    
    if (message.type == "APPLICATION_COMMAND") {
        await message.reply({ embeds: [ noResultsEmbed ] });
    } else {
        message.channel.send({ embeds: [ noResultsEmbed ] });
    }
}

async function invalidOption(message, optionUsed) {
    const noResultsEmbed = new MessageEmbed()
        .setTitle(`"${optionUsed}" is not a valid option`)
        .setDescription("Valid options are `name`, `flavor`, `flavour`, `description`")
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
        {
            name: "option",
            description: "Search the values of the option you enter. (Optional; defaults to name. !fetchelp for valid options)",
            type: "STRING",
            required: false,
        }
    ],
	execute(message, args) {
        let optionToUse;
        if (message.type == "APPLICATION_COMMAND") {
            args = message.options.getString("input");
            optionToUse = message.options.getString("option")
        }

        if (typeof args === "undefined") {
            message.channel.send({ embeds: [ enterQuery ] });
            return;
        }

        if (args.startsWith("-") && message.type != "APPLICATION_COMMAND") {
            if (args.indexOf(' ') > -1) {
                optionToUse = args.substr(0, args.indexOf(' ')).slice(1);
                args = args.substr(args.indexOf(" ") + 1);
            } else {
                message.channel.send({ embeds: [ enterQueryOption ] });
                return;
            }
        }

        if (args.length < 4 && args != "bog") {
            if (message.type == "APPLICATION_COMMAND") {
                message.reply({ embeds: [ tooShort ] });
            } else {
                message.channel.send({ embeds: [ tooShort ] });
            }
            return;
        }

        if (optionToUse != null && !validOptions.includes(optionToUse)) {
            invalidOption(message, optionToUse);
            return
        }

        let toSend = "```";
            first = true;
            totalResults = 0

        if (optionToUse == "description" || optionToUse == "flavor" || optionToUse == "flavour") {
            let cardValuesToSearch;
            if (optionToUse == "description") {
                cardValuesToSearch = _.mapValues(cardDatabase, function(o) {
                    let descToUse = o.desc;
                    if (descToUse != undefined) {
                        descToUse = descToUse.replace(/\*/g, "").replace(/\n/g, " ")
                            .replace(/<:heads:757659165719134388>/g, "Heads")
                            .replace(/<:snails:757659165807214778>/g, "Snails");
                    }
                    return descToUse;
                });
            } else {
                cardValuesToSearch = _.mapValues(cardDatabase, function(o) {
                    let flavToUse = o.flavour;
                    if (flavToUse != undefined) {
                        flavToUse = flavToUse.replace(/\*/g, "");
                    }
                    return flavToUse;
                });
            }
            cardValuesToSearch = Object.keys(cardValuesToSearch).map(key => ({ key, value: cardValuesToSearch[key] }));
            
            let cardResults;
            if (optionToUse == "description") {
                cardResults = fuzzysort.go(args, cardValuesToSearch, { key: "value", threshold: -150 });
            } else {
                cardResults = fuzzysort.go(args, cardValuesToSearch, { key: "value", threshold: -160  });
            }
            if (cardResults.length > 0) {
                first = false;
                toSend += "CARDS:\n\n";
                totalResults += cardResults.length;
                for (let i = 0; i < cardResults.length; i += 2) {
                    let name1 = _.get(cardDatabase, `${cardResults[i].obj.key}.name`);
                    toSend += name1.padEnd(35);
                    let name2;
                    if (i + 1 != cardResults.length) {
                        name2 = _.get(cardDatabase, `${cardResults[i + 1].obj.key}.name`);
                        toSend += name2;
                    }
                    if (i + 2 < cardResults.length) toSend += "\n"
                }
            }
            if (toSend.endsWith(" ")) {
                do {
                    toSend = toSend.substring(0, toSend.length - 1);
                } while (toSend.endsWith(" "));
            }

            let graftValuesToSearch;
            if (optionToUse == "description") {
                graftValuesToSearch = _.mapValues(graftDatabase, function(o) {
                    let descToUse = o.desc;
                    if (descToUse != undefined) {
                        descToUse = descToUse.replace(/\*/g, "").replace(/\n/g, " ")
                    }
                    return descToUse;
                });
            } else {
                graftValuesToSearch = _.mapValues(graftDatabase, function(o) {
                    let flavToUse = o.flavour;
                    if (flavToUse != undefined) {
                        flavToUse = flavToUse.replace(/\*/g, "");
                    }
                    return flavToUse;
                });
            }
            graftValuesToSearch = Object.keys(graftValuesToSearch).map(key => ({ key, value: graftValuesToSearch[key] }));

            let graftResults;
            if (optionToUse == "description") {
                graftResults = fuzzysort.go(args, graftValuesToSearch, { key: "value", threshold: -150 });
            } else {
                graftResults = fuzzysort.go(args, graftValuesToSearch, { key: "value", threshold: -160  });
            }

            if (graftResults.length > 0) {
                toSend += `${(first) ? "" : "\n\n"}GRAFTS:\n\n`;
                if (first) first = false;
                totalResults += graftResults.length;
                for (let i = 0; i < graftResults.length; i += 2) {
                    let name1 = _.get(graftDatabase, `${graftResults[i].obj.key}.name`);
                    toSend += name1.padEnd(35);
                    let name2;
                    if (i + 1 != graftResults.length) {
                        name2 = _.get(graftDatabase, `${graftResults[i + 1].obj.key}.name`);
                        toSend += name2;
                    }
                    if (i + 2 < graftResults.length) toSend += "\n"
                }
            }
            if (toSend.endsWith(" ")) {
                do {
                    toSend = toSend.substring(0, toSend.length - 1);
                } while (toSend.endsWith(" "));
            }

            if (optionToUse == "description") {
                let bobaValuesToSearch = _.mapValues(bobaDatabase, function(o) {
                    let descToUse = o.desc;
                    if (descToUse != undefined) {
                        descToUse = descToUse.replace(/\*/g, "").replace(/\n/g, " ")
                    }
                    return descToUse;
                });
                bobaValuesToSearch = Object.keys(bobaValuesToSearch).map(key => ({ key, value: bobaValuesToSearch[key] }));

                let bobaResults = fuzzysort.go(args, bobaValuesToSearch, { key: "value", threshold: -150 });
                if (bobaResults.length > 0) {
                    toSend += `${(first) ? "" : "\n\n"}BOONS/BANES:\n\n`;
                    if (first) first = false;
                    totalResults += bobaResults.length;
                    for (let i = 0; i < bobaResults.length; i += 2) {
                        let name1 = _.get(bobaDatabase, `${bobaResults[i].obj.key}.name`);
                        toSend += name1.padEnd(35);
                        let name2;
                        if (i + 1 != bobaResults.length) {
                            name2 = _.get(bobaDatabase, `${bobaResults[i + 1].obj.key}.name`);
                            toSend += name2;
                        }
                        if (i + 2 < bobaResults.length) toSend += "\n"
                    }
                }
                if (toSend.endsWith(" ")) {
                    do {
                        toSend = toSend.substring(0, toSend.length - 1);
                    } while (toSend.endsWith(" "));
                }

                let mutatorsPerksValuesToSearch = _.mapValues(mutatorsPerksDatabase, function(o) {
                    let descToUse = o.desc;
                    if (descToUse != undefined) {
                        descToUse = descToUse.replace(/\*/g, "").replace(/\n/g, " ")
                    }
                    return descToUse;
                });
                mutatorsPerksValuesToSearch = Object.keys(mutatorsPerksValuesToSearch).map(key => ({ key, value: mutatorsPerksValuesToSearch[key] }));

                let mutatorsPerksResults = fuzzysort.go(args, mutatorsPerksValuesToSearch, { key: "value", threshold: -150 });
                if (mutatorsPerksResults.length > 0) {
                    toSend += `${(first) ? "" : "\n\n"}MUTATORS/PERKS:\n\n`;
                    if (first) first = false;
                    totalResults += mutatorsPerksResults.length;
                    for (let i = 0; i < mutatorsPerksResults.length; i += 2) {
                        let name1 = _.get(mutatorsPerksDatabase, `${mutatorsPerksResults[i].obj.key}.name`);
                        toSend += name1.padEnd(35);
                        let name2;
                        if (i + 1 != mutatorsPerksResults.length) {
                            name2 = _.get(mutatorsPerksDatabase, `${mutatorsPerksResults[i + 1].obj.key}.name`);
                            toSend += name2;
                        }
                        if (i + 2 < mutatorsPerksResults.length) toSend += "\n"
                    }
                }
                if (toSend.endsWith(" ")) {
                    do {
                        toSend = toSend.substring(0, toSend.length - 1);
                    } while (toSend.endsWith(" "));
                }

                let coinValuesToSearch = _.mapValues(coinDatabase, function(o) {
                    let descToUse = o.desc;
                    if (descToUse != undefined) {
                        descToUse = descToUse.replace(/\n/g, " ")
                            .replace(/<:heads:757659165719134388>/g, "Heads")
                            .replace(/<:snails:757659165807214778>/g, "Snails");
                    }
                    return descToUse;
                });
                coinValuesToSearch = Object.keys(coinValuesToSearch).map(key => ({ key, value: coinValuesToSearch[key] }));

                let coinResults = fuzzysort.go(args, coinValuesToSearch, { key: "value", threshold: -150 });
                if (coinResults.length > 0) {
                    toSend += `${(first) ? "" : "\n\n"}COINS:\n\n`;
                    if (first) first = false;
                    totalResults += coinResults.length;
                    for (let i = 0; i < coinResults.length; i += 2) {
                        let name1 = _.get(coinDatabase, `${coinResults[i].obj.key}.name`);
                        toSend += name1.padEnd(35);
                        let name2;
                        if (i + 1 != coinResults.length) {
                            name2 = _.get(coinDatabase, `${coinResults[i + 1].obj.key}.name`);
                            toSend += name2;
                        }
                        if (i + 2 < coinResults.length) toSend += "\n"
                    }
                }
            }
            if (toSend.endsWith(" ")) {
                do {
                    toSend = toSend.substring(0, toSend.length - 1);
                } while (toSend.endsWith(" "));
            }

            if (totalResults > 0) {
                toSend += "```";
                let caption = `${totalResults} Result${(totalResults == 1) ? "" : "s"} for **${args}**`
                    + ` (Searching *${(optionToUse == "description") ? "Descriptions" : "Flavor Texts"}*):\n`;
                if (caption.length + toSend.length > 2000) {
                    toSend = toSend.slice(3);
                    toSend = toSend.substring(0, toSend.length - 3);
                    const attachment = new MessageAttachment(Buffer.from(toSend), "results.txt");
                    caption = `${totalResults} Result${(totalResults == 1) ? "" : "s"} for **${args}**`
                        + ` (Searching *${(optionToUse == "description") ? "Descriptions" : "Flavor Texts"}*;`
                        + " results put in txt due to message length restrictions):"
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
                noResults(message, args);
            }
            return;
        }
        
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
        if (toSend.endsWith(" ")) {
            do {
                toSend = toSend.substring(0, toSend.length - 1);
            } while (toSend.endsWith(" "));
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
        if (toSend.endsWith(" ")) {
            do {
                toSend = toSend.substring(0, toSend.length - 1);
            } while (toSend.endsWith(" "));
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
        if (toSend.endsWith(" ")) {
            do {
                toSend = toSend.substring(0, toSend.length - 1);
            } while (toSend.endsWith(" "));
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
        if (toSend.endsWith(" ")) {
            do {
                toSend = toSend.substring(0, toSend.length - 1);
            } while (toSend.endsWith(" "));
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