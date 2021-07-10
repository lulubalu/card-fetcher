const { MessageEmbed } = require("discord.js");
const { http, https } = require("follow-redirects");
const _ = require("lodash");
const cheerio = require("cheerio");
const cardDatabase = require("../databases/cards.json");
const graftDatabase = require("../databases/grafts.json");

function pleaseEnterAName(message) {
    const enterName = new MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription("Please enter the name of a card/graft after the command! Eg: `!fetch Stab`")
        .setColor(0xa90000);
    message.channel.send(enterName);
}

function NotFound(MsgToEdit, Request) {
    var NotFoundEmbed = new MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription(`Item "${Request}" not found!`)
        .setColor(0xa90000);
    MsgToEdit.edit(NotFoundEmbed);
}

function finalEmbedMessage(message, wikiLink, wikiImage, pgStatus, description, cardEntry) {
    let footer = "";
    let finalEmbed = new MessageEmbed()
        .setTitle(_.get(cardDatabase, cardEntry + ".name"))
        .setDescription(description)
        .setImage(wikiImage)
        .setColor(0x08e0db)
        .addFields(
            { name: "Character", value: _.get(cardDatabase, cardEntry + ".character"), inline: true },
            { name: "Deck", value: _.get(cardDatabase, cardEntry + ".deck"), inline: true },
        );
    if (!_.get(cardDatabase, cardEntry + ".keywords").includes("Unplayable")) {
        finalEmbed.addFields(
            { name: "Actions", value: _.get(cardDatabase, cardEntry + ".actions"), inline: true },
        );
    }
    if (_.get(cardDatabase, cardEntry + ".upgrades") != "N/A" && _.get(cardDatabase, cardEntry + ".xp") != "N/A") {
        finalEmbed.addFields(
            { name: "XP. Needed", value: _.get(cardDatabase, cardEntry + ".xp"), inline: true },
        );
    }
    if (pgStatus != 404) {
        finalEmbed.setURL(wikiLink);
        footer += wikiLink;
    } else {
        footer += "Wiki page not available";
    }
    if (wikiImage != "https://i.ibb.co/wcNk6mW/Image-Missing.png") {
        footer += " | Images from the wiki may not be up to date with the game"
    }
    if (pgStatus != 404) {
        finalEmbed.setFooter(footer, "https://i.ibb.co/Zh8VshB/Favicon.png");
    } else {
        finalEmbed.setFooter(footer);
    }
    message.edit(finalEmbed);
}

function finalEmbedMessageGraft(graft, MsgToEdit) {
    let finalEmbed = new MessageEmbed()
        .setTitle(_.get(graftDatabase, graft + ".name"))
        .setImage(_.get(graftDatabase, graft + ".icon"))
        .setColor(0x08e0db)
        .setURL("https://griftlands.fandom.com/wiki/Grafts")
        .setFooter("https://griftlands.fandom.com/wiki/Grafts", "https://i.ibb.co/Zh8VshB/Favicon.png")
        .addFields(
            { name: "Type", value: _.get(graftDatabase, graft + ".type"), inline: true },
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

function errorMessage(ErrorMsg, MsgToEdit) {
    console.log(ErrorMsg);
    let errorEmbed = new MessageEmbed()
        .setTitle('Whoops!')
        .setDescription("Looks like I've run into an error:\n\n`" + ErrorMsg + "`\n\nPlease ping my creator @Sei Bellissima to let her know about this!\n\n||If you are the one who summoned me, Sei, shame on you. <:rookgrin:736050803021840474> Now go and fix me!||")
        .setColor(0xa90000)
    MsgToEdit.edit(errorEmbed);
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
        let wikirequest, toFetch, splitStr, DOMCheck, wikiPage;
        let cardImage = "https://i.ibb.co/wcNk6mW/Image-Missing.png";
        if (args.indexOf(" ") > -1) {
            splitStr = args.split(" ");
            for (i = 0; i < splitStr.length; i++) {
                if (splitStr[i] != "battle" && splitStr[i] != "negotiation" && splitStr[i] != "of") {
                    if (splitStr[i] == " " || splitStr[i] == "") {
                        let removed = splitStr.splice(i, 1);
                        i--;
                    } else {
                        if (splitStr[i] == "autodog") {
                            splitStr[i] = "AutoDog"
                        } else splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
                    };
                }
            }
            wikirequest = splitStr.join(" ");
        } else {
            wikirequest = args.charAt(0).toUpperCase() + args.substring(1);
        }
        if (wikirequest == "Shock-box") { wikirequest = "Shock-Box"; }

        //replacing special characters to make it url friendly
        wikirequest = wikirequest.replace(/ /g, "_").replace(/['\u2018\u2019]/g, '%27').replace(/[:+]/g, "");
        if (wikirequest == "Boosted_Robo-kick") { wikirequest = "Boosted_Robo-Kick"; }
        if (wikirequest == "Enhanced_Robo-kick") { wikirequest = "Enhanced_Robo-Kick"; }
        const pageToOpen = `https://griftlands.gamepedia.com/${wikirequest}`;
        const imageToOpen = `https://griftlands.gamepedia.com/File:${wikirequest}.png`;

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
        toFetch = args.replace(/[- ]/g, "_").replace(/\+/g, "_plus").replace(/[,.':!?\u2018\u2019\u201C\u201D]/g, "");

        function fetchPage(url) {
            return new Promise(function (resolve, reject) {
                //GRABBING STATUS
                https.get(url, function (response) {
                    DOMcheck = response.statusCode;
                    if (DOMcheck != 404) {
                        let data = "";
                        response.on("data", function (chunk) {
                            data += chunk;
                        });
                        response.on("end", function () {
                            resolve(data);
                        });
                    } else {
                        resolve(DOMcheck);
                    }
                }).on("error", function (e) {
                    errorMessage(e, sentMessage);
                    reject(e);
                });
            })
        }

        function FinalEdit(pageResult, imageResult) {
            return new Promise(function (resolve, reject) {
                if (pageResult !== 404) {
                    wikiPage = pageToOpen;
                }
                if (imageResult !== 404) {
                    //loading page content with cheerio
                    const $ = cheerio.load(imageResult);
                    cardImage = $(".mw-filepage-other-resolutions a").first().attr("href");
                }
                let Desc = "";
                if (_.get(cardDatabase, toFetch + ".flavour") != "**") {
                    Desc += _.get(cardDatabase, toFetch + ".flavour") + "\n\n";
                }
                if (_.get(cardDatabase, toFetch + ".desc") != "") {
                    Desc += _.get(cardDatabase, toFetch + ".desc") + "\n\n";
                }
                let Upgrades = _.get(cardDatabase, toFetch + ".upgrades");
                let Rarity = _.get(cardDatabase, toFetch + ".rarity");
                let Type = _.get(cardDatabase, toFetch + ".type");
                let descToAdd = Desc + Rarity + " " + Type + " Card";
                if (Upgrades != "N/A") {
                    descToAdd += "\n\n";
                    for (let i = 1; i <= Upgrades.length; i++) {
                        if (i === Upgrades.length) { //Last upgrade
                            descToAdd += `**Upgrade ${i}**: ${Upgrades[i - 1]}`;
                         } else { //first/middle upgrades
                            descToAdd += `**Upgrade ${i}**: ${Upgrades[i - 1]}\n`;
                        }
                    }
                }
                finalEmbedMessage(sentMessage, wikiPage, cardImage, pageResult, descToAdd, toFetch);
            });
        }

        let fetchingGraft = false;

        if (!_.has(cardDatabase, toFetch) || typeof _.get(cardDatabase, toFetch + ".name") === "undefined") {
            fetchingGraft = true;
        }
        if (fetchingGraft) {
            if (!_.has(graftDatabase, toFetch) || typeof _.get(graftDatabase, toFetch + ".name") === "undefined") {
                NotFound(sentMessage, OriginalRequest);
            } else {
                finalEmbedMessageGraft(toFetch, sentMessage);
            }
        } else {
            const pageFetch = fetchPage(pageToOpen);
            const imageFetch = fetchPage(imageToOpen);

            Promise.all([pageFetch, imageFetch]).then(([page, image]) => {5
                return FinalEdit(page, image);
            }).catch((error) => {
                errorMessage(error, sentMessage);
            });
        }
	},
};