const { MessageEmbed } = require("discord.js");
const _ = require("lodash");
const cardDatabase = require("../databases/cards.json");
const graftDatabase = require("../databases/grafts.json");
const bobaDatabase = require("../databases/boonsBanes.json");
const specialDatabase = require("../databases/specialCases.json");

function pleaseEnterAName(message) {
    const enterName = new MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription("Please enter the name of a card/graft after the command! Eg: `!fetch Stab`")
        .setColor(0xa90000);
    message.channel.send(enterName);
}

function NotFound(MsgToEdit, Request) {
    const NotFoundEmbed = new MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription(`Item "${Request}" not found!`)
        .setColor(0xa90000);
    MsgToEdit.edit(NotFoundEmbed);
}

function finalEmbedMessage(message, cardEntry) {
    let footer = "";
    let desc = "";
    let finalEmbed = new MessageEmbed()
        .setTitle(_.get(cardDatabase, cardEntry + ".name"))
        .setColor(0x08e0db)
        .addFields(
            { name: "Character", value: _.get(cardDatabase, cardEntry + ".character"), inline: true },
            { name: "Deck", value: _.get(cardDatabase, cardEntry + ".deck"), inline: true },
        );

    if (_.get(cardDatabase, cardEntry + ".flavour") != "**") {
        desc += _.get(cardDatabase, cardEntry + ".flavour") + "\n\n";
    }
    if (_.get(cardDatabase, cardEntry + ".desc") != "") {
        desc += _.get(cardDatabase, cardEntry + ".desc") + "\n\n";
    }

    let upgrades = _.get(cardDatabase, cardEntry + ".upgrades");
    let rarity = _.get(cardDatabase, cardEntry + ".rarity");
    let type = _.get(cardDatabase, cardEntry + ".type");
    let keywords = _.get(cardDatabase, cardEntry + ".keywords");

    desc += `${rarity} ${type} Card`

    if (upgrades != "N/A") {
        desc += "\n\n";
        for (let i = 1; i <= upgrades.length; i++) {
            desc += `**Upgrade ${i}**: ${upgrades[i - 1]}${(i === upgrades.length) ? "" : "\n"}`;
        }
    }

    if (_.get(cardDatabase, cardEntry + ".xp") == "N/A" && upgrades != "N/A" && !keywords.includes("Hatch")) {
        desc += "\n\nThis card cannot be upgraded by playing it; however it can be upgraded through other means.";
    }

    finalEmbed.setDescription(desc);
    
    let wikilink = _.get(cardDatabase, cardEntry + ".wikilink");
    if (wikilink != "N/A") {
        finalEmbed.setURL(wikilink);
        footer += wikilink;
    } else {
        footer += "Wiki page not available";
    }

    if (_.get(cardDatabase, cardEntry + ".image") != "N/A") {
        finalEmbed.setImage(_.get(cardDatabase, cardEntry + ".image"));
        footer += " | Images from the wiki may not be up to date with the game";
    } else {
        finalEmbed.setImage("https://i.ibb.co/wcNk6mW/Image-Missing.png");
    }

    if (!keywords.includes("Unplayable")) {
        finalEmbed.addFields(
            { name: "Actions", value: _.get(cardDatabase, cardEntry + ".actions"), inline: true },
        );
    }

    if (upgrades != "N/A" && _.get(cardDatabase, cardEntry + ".xp") != "N/A" && !keywords.includes("Hatch")) {
        finalEmbed.addFields(
            { name: "XP. Needed", value: _.get(cardDatabase, cardEntry + ".xp"), inline: true },
        );
    }

    if (wikilink != "N/A") {
        finalEmbed.setFooter(footer, "https://i.ibb.co/Zh8VshB/Favicon.png");
    } else {
        finalEmbed.setFooter(footer);
    }

    message.edit(finalEmbed);
}

function finalEmbedMessageGraft(graft, MsgToEdit) {
    let type = _.get(graftDatabase, graft + ".type");
    let urlToUse = `https://griftlands.fandom.com/wiki/Grafts#${(type == "Battle") ? "Battle_Grafts" : "Negotiation_Grafts"}`;
    let finalEmbed = new MessageEmbed()
        .setTitle(_.get(graftDatabase, graft + ".name"))
        .setImage(_.get(graftDatabase, graft + ".icon"))
        .setColor(0x08e0db)
        .setURL(urlToUse)
        .setFooter(urlToUse, "https://i.ibb.co/Zh8VshB/Favicon.png")
        .addFields(
            { name: "Type", value: type, inline: true },
            { name: "Character", value: _.get(graftDatabase, graft + ".character"), inline: true },
            { name: "Rarity", value: _.get(graftDatabase, graft + ".rarity"), inline: true },
        )
        let desc = "";
        let flavour = _.get(graftDatabase, graft + ".flavour");
        if (flavour != "**") {
            desc = `${flavour}\n\n`;
        }
        desc += _.get(graftDatabase, graft + ".desc");
        let upgrade = _.get(graftDatabase, graft + ".upgrade");
        if (upgrade != "N/A") {
            desc += `\n\nUpgrade: ${upgrade}`;
        }
        let xp = _.get(graftDatabase, graft + ".xp");
        if (xp != "N/A") {
            finalEmbed.addFields(
                { name: "XP. Needed", value: _.get(graftDatabase, graft + ".xp"), inline: true },
            );
        }
        finalEmbed.setDescription(desc);
        MsgToEdit.edit(finalEmbed);

}

function finalEmbedMessageBoba(boba, MsgToEdit) {
    let type = _.get(bobaDatabase, boba + ".type");
    let urlToUse = `https://griftlands.fandom.com/wiki/Relationships#List_of_${(type == "Boon") ? "Boons" : "Banes"}`
    let finalEmbed = new MessageEmbed()
        .setTitle(_.get(bobaDatabase, boba + ".name"))
        .setImage(_.get(bobaDatabase, boba + ".icon"))
        .setColor(0x08e0db)
        .setURL(urlToUse)
        .setFooter(urlToUse, "https://i.ibb.co/Zh8VshB/Favicon.png")
        .addFields(
            { name: "Type", value: type, inline: true },
        );
    let desc = _.get(bobaDatabase, boba + ".desc");
    let givenBy = _.get(bobaDatabase, boba + ".givenby");
    if (givenBy.length > 0) {
        desc += `\n\nGiven by:\n${givenBy.join("\n")}`;
    }
    finalEmbed.setDescription(desc);
    MsgToEdit.edit(finalEmbed);
}

function specialCaseMessage(MsgToEdit, caseEntry) {
    const specialEmbed = new MessageEmbed()
        .setTitle(_.get(specialDatabase, caseEntry + ".title"))
        .setDescription(_.get(specialDatabase, caseEntry + ".desc"))
        .setColor(0x00b71a);
    MsgToEdit.edit(specialEmbed);
}

const tempEmbed = new MessageEmbed()
    .setTitle("Fetching item. YAP!")
    .setColor(0x00b71a);

module.exports = {
	name: "fetch",
	async execute(message, args) {
        if (typeof args === "undefined") {
            pleaseEnterAName(message);
            return;
        }
        let sentMessage = await message.channel.send(tempEmbed);

        OriginalRequest = args;
        args = args.toLowerCase();
        let toFetch, splitStr;

        //making request database-friendly
        if (args.indexOf(" ") > -1) {
            splitStr = args.split(" ");
            for (i = 0; i < splitStr.length; i++) {
                if (splitStr[i] == " " || splitStr[i] == "") {
                    let removed = splitStr.splice(i, 1);
                    i--;
                };
            }
            args = splitStr.join(" ");
        };
        toFetch = args.replace(/\r?\n|\r/g, "").replace(/[- ]/g, "_").replace(/\+/g, "_plus").replace(/[,.':!?\u2018\u2019\u201C\u201D]/g, "");

        let fetchingGraft = false;
            fetchingBoba = false;
            specialCase = false;

        if (!_.has(cardDatabase, toFetch) || typeof _.get(cardDatabase, toFetch + ".name") === "undefined") {
            fetchingGraft = true;
        }
        if (fetchingGraft) {
            if (!_.has(graftDatabase, toFetch) || typeof _.get(graftDatabase, toFetch + ".name") === "undefined") {
                fetchingBoba = true;
            } else {
                finalEmbedMessageGraft(toFetch, sentMessage);
                return;
            }
        }
        if (fetchingBoba) {
            if (!_.has(bobaDatabase, toFetch) || typeof _.get(bobaDatabase, toFetch + ".name") === "undefined") {
                specialCase = true;
            } else {
                finalEmbedMessageBoba(toFetch, sentMessage);
                return;
            }
        }
        if (specialCase) {
            if (!_.has(specialDatabase, toFetch)) {
                NotFound(sentMessage, OriginalRequest);
            } else {
                specialCaseMessage(sentMessage, toFetch);
                return;
            }
        } else {
            finalEmbedMessage(sentMessage, toFetch);
        }
	},
};