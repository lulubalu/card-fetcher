const { MessageEmbed, MessageAttachment } = require("discord.js");
const _ = require("lodash");
const cardDatabase = require("../databases/cards.json");
const graftDatabase = require("../databases/grafts.json");
const bobaDatabase = require("../databases/boonsBanes.json");
const mutatorsPerksDatabase = require("../databases/mutatorsPerks.json");
const peopleDatabase = require("../databases/people.json")
const coinDatabase = require("../databases/coins.json");
const specialDatabase = require("../databases/specialCases.json");

const databases = [ cardDatabase, graftDatabase, bobaDatabase, mutatorsPerksDatabase, peopleDatabase, coinDatabase, specialDatabase ];

const specialCharacters = [ "sal", "rook", "smith", "kalandra" ];

const enterName = new MessageEmbed()
    .setTitle("Unable to Fetch")
    .setDescription("Please enter the name of a valid item after the command! Eg: `!fetchicon Stab`")
    .setColor(0xa90000)

async function IconNotFoundEmbed(message, attemptedFetch, keyExists, fetchingFullBody, isPerson) {
    let descToAdd = `${fetchingFullBody ? "Full body portrait" : "Icon"} for \"${attemptedFetch}\" not ${keyExists ? "available" : "found"}!`;
    if (fetchingFullBody && !isPerson && keyExists) {
        descToAdd += "\n\nThe `fetchfullbody` command only works for people, so fetch a person instead. Ex: `!fetchfullbody Sal`";
        if (message.type == "APPLICATION_COMMAND") {
            descToAdd = descToAdd.replace(/\!fetch/g, "/fetch");
        }
    }
    let IconNotFound = new MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription(descToAdd)
        .setColor(0xa90000);

    if (message.type == "APPLICATION_COMMAND") {
        await message.reply({ embeds: [ IconNotFound ] });
    } else {
        message.channel.send({ embeds: [ IconNotFound ] });
    }
}

async function specialOutfitNotAvailable(message, person, attemptedFetch) {
    let outfits = _.map(_.get(peopleDatabase, `${person}.fullBody`), "name");
    let name = _.get(peopleDatabase, `${person}.name`);
    let descToAdd = `"${attemptedFetch}" is not an outfit for ${name}!\n\n${name}'s outfits are: \``;
    if (person == "kalandra") {
        descToAdd += `Foreman\``;
    } else {
        descToAdd += `${outfits.join("`, `")}\``;
    }

    descToAdd += `\n\nDo \`!fetchfullbody ${name}\` to fetch ${name}'s default outfit.`;
    if (message.type == "APPLICATION_COMMAND") {
        descToAdd = descToAdd.replace("!fetchfullbody", "/fetchfullbody");
    }

    notAvailable = new MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription(descToAdd)
        .setColor(0xa90000);

    if (message.type == "APPLICATION_COMMAND") {
        await message.reply({ embeds: [ notAvailable ] });
    } else {
        message.channel.send({ embeds: [ notAvailable ] });
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
	execute(message, args, fetchingRandom, fetchingFullBody) {
        if (message.type == "APPLICATION_COMMAND" && fetchingRandom != "Fetching" && fetchingFullBody != "Fetching") {
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

        let subKey = ".icon";
            isSpecialChar = false;
            subOutfit = "";

        if (fetchingFullBody == "Fetching") {
            fetchingFullBody = true;
            subKey = ".fullBody";
            if (iconToFetch.includes("_"))
            {
                let splitted = iconToFetch.split("_");
                if (specialCharacters.includes(splitted[0])) {
                    isSpecialChar = true;
                    iconToFetch = splitted.shift();
                    if (splitted[0] == "the") splitted.shift();
                    subOutfit = `.${splitted.join("_")}`;
                }
            } else if (specialCharacters.includes(iconToFetch)) {
                isSpecialChar = true;
            }
        };

        if (isSpecialChar) {
            let name, attachmentName, imageLink;
            if (subOutfit != "") {
                let keyToGet = iconToFetch + subKey + subOutfit;
                let outfitExists = _.has(peopleDatabase, keyToGet);
                if (!outfitExists) {
                    specialOutfitNotAvailable(message, iconToFetch, args.slice(iconToFetch.length + 1));
                    return;
                }
                name = `*${_.get(peopleDatabase, keyToGet + ".name")}*`;
                attachmentName = `${iconToFetch}_${name.toLowerCase().replace(" ", "_").replace("'", "")}`;
                imageLink = _.get(peopleDatabase, keyToGet + subKey);
            } else {
                name = "default";
                let outfitsObject = _.get(peopleDatabase, iconToFetch + subKey);
                subOutfit = `.${Object.keys(outfitsObject)[0]}`;
                attachmentName = iconToFetch;
                imageLink = _.get(peopleDatabase, iconToFetch + subKey + subOutfit + subKey);
            }

            const attachment = new MessageAttachment(imageLink);
            attachment.name = `${attachmentName}.png`;
            console.log(`SENDING ${imageLink} AS ATTACHMENT`);

            if (message.type == "APPLICATION_COMMAND") {
                message.reply({ content: `Fullbody portrait for **${_.get(peopleDatabase, iconToFetch + ".name")}**, ${name} outfit`, files: [ attachment ] });
             } else {
                message.channel.send({ files: [ attachment ] });
            }
            return;
        }

        let keyExists = false;
            imageValid = false;
            wasFound = false;
            isPerson = false;
        
        for (let i = 0; i < databases.length; i++) {
            if (!keyExists) keyExists = _.has(databases[i], iconToFetch);
            let imageLink = _.get(databases[i], iconToFetch + subKey);
            imageValid = imageLink != "N/A" && typeof imageLink !== "undefined";

            if (!isPerson) isPerson = i == 4 && _.has(databases[i], iconToFetch);

            if (keyExists && imageValid) {
                const attachment = new MessageAttachment(imageLink);
                attachment.name = `${iconToFetch}.png`;
                console.log(`SENDING ${imageLink} AS ATTACHMENT`);
            
                if (message.type == "APPLICATION_COMMAND" || fetchingRandom == "Fetching") {
                    let nameToUse = _.get(databases[i], iconToFetch + ".name");
                    if (typeof nameToUse === "undefined") {
                        nameToUse = iconToFetch;
                    }
                    if (message.type == "APPLICATION_COMMAND") {
                        message.reply({ content: `${fetchingFullBody ? "Full body portrait" : "Icon"} for **${nameToUse}**`, files: [ attachment ] });
                    } else {
                        message.channel.send({ content: `Icon for **${nameToUse}**`, files: [ attachment ] });
                    }
                 } else {
                    message.channel.send({ files: [ attachment ] });
                }
                wasFound = true;
                break;
            } else if (keyExists && !fetchingFullBody && i == databases.length - 1) {
                wasFound = true;
                specialCaseMessage(message, iconToFetch);
            }
        }

        if (!wasFound) IconNotFoundEmbed(message, args, keyExists, fetchingFullBody, isPerson);
	},
};