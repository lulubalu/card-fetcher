// Getting libraries
require("dotenv").config();
const Discord = require("discord.js");
const { MessageEmbed, MessageAttachment } = require("discord.js");
const { http, https } = require("follow-redirects");
const cheerio = require("cheerio");
var _ = require("lodash");
let database = require("./database.json");
const pkgFile = require('./package.json');
const prefix = "!";
const express = require("express");
const app = express();
const port = 3000;
const client = new Discord.Client();

//getting the stats used when !fetchstats is used
//and putting them into a description (that will be added onto)
let statsTotal = Object.keys(database).length;
let statsIcons = _.map(database, "icon");
statsIcons = statsIcons.filter(function (x) {
    return x !== undefined;
});
statsIcons = _.uniq(statsIcons);
let statsCards = _.map(database, "name");
statsCards = statsCards.filter(function (x) {
    return x !== undefined;
});
const decks = _.countBy(database, "deck");
const types = _.countBy(database, "type")
const rarities = _.countBy(database, "rarity");
const characters = _.countBy(database, "character");
const versionNumber = _.get(pkgFile, 'version');
let statsDesc = "**Total no. of keys in the database:** " + statsTotal +
    "\n**Total Cards:** " + statsCards.length +
    "\n**Icons:** " + statsIcons.length +
    "\n**Battle Cards:** " + decks.Battle +
    "\n**Negotiation Cards:** " + decks.Negotiation +
    "\n**Attack Cards:** " + types.Attack +
    "\n**Maneuver Cards:** " + types.Maneuver +
    "\n**Diplomacy Cards:** " + types.Diplomacy +
    "\n**Hostility Cards:** " + types.Hostility +
    "\n**Item Cards:** " + types.Item +
    "\n**Status Cards:** " + types.Status +
    "\n**Flourish Cards:** " + types.Flourish +
    "\n**Basic Cards:** " + rarities.Basic +
    "\n**Common Cards:** " + rarities.Common +
    "\n**Uncommon Cards:** " + rarities.Uncommon +
    "\n**Rare Cards:** " + rarities.Rare +
    "\n**Unique Cards:** " + rarities.Unique +
    "\n**Sal Cards:** " + characters.Sal +
    "\n**Rook Cards:** " + characters.Rook +
    "\n**Smith Cards:** " + characters.Smith +
    "\n**General Cards:** " + characters.General +
    "\n\n**Current Version:** " + versionNumber;

//Setting embeds
const TempEmbed = new Discord.MessageEmbed()
    .setTitle("Fetching card. YAP!")
    .setColor(0x00b71a)

const HelpEmbed = new Discord.MessageEmbed()
    .setDescription("Hi there! I'm your friendly neighborhood card fetcher."
        + " At your command I fetch whatever card you want and all its available info!\n\n"
        + "\"**!fetch [card name]**\" -- This will fetch the card's stats, description, flavor text and card image if available.\n\n"
        + "\"**!fetchicon [card name]**\" -- This will fetch the card art alone.\n\n"
        + "\"**!fetchstats**\" -- Get card stats, bot ping and other stats.\n\n"
        + "Remember to use the commands above without the quotes and brackets, and that **the card name must be spelled correctly.**"
        + "\n\nIf you encounter any errors while using me be sure to ping my creator @Sei Bellissima to let her know about it! You can also report issues or send suggestions to my github repository: https://github.com/Sei-Bellissima/card-fetcher\n\nTo display this message again, type " + '"!fetchhelp"')
    .setThumbnail("https://i.ibb.co/VmnxVvr/Auto-Dog-Boticon.png")
    .setColor(0x08e0db)

function ErrorMessage(ErrorMsg, MsgToEdit, RequestMessage, WillEdit) {
    console.log(ErrorMsg);
    var ErrorEmbed = new Discord.MessageEmbed()
        .setTitle('Whoops!')
        .setDescription("Looks like I've run into an error:\n\n`" + ErrorMsg + "`\n\nPlease ping my creator @Sei Bellissima to let her know about this!\n\n||If you are the one who summoned me, Sei, shame on you. <:rookgrin:736050803021840474> Now go and fix me!||")
        .setColor(0xa90000)
    if (WillEdit == true) {
        MsgToEdit.edit(ErrorEmbed);
    } else {
        RequestMessage.channel.send(ErrorEmbed);
    }
}

function NotFound(MsgToEdit, Request) {
    var NotFoundEmbed = new Discord.MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription("Card \"" + Request + "\" not found!")
        .setColor(0xa90000)
    MsgToEdit.edit(NotFoundEmbed);
}

function IconNotFoundEmbed(message, AttemptedFetch) {
    var IconNotFound = new Discord.MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription("Icon for \"" + AttemptedFetch + "\" not found!")
        .setColor(0xa90000)
    message.channel.send(IconNotFound);
}

function PleaseEnterAName(message) {
    var EnterName = new Discord.MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription("Please enter a card name after the command!")
        .setColor(0xa90000)
    message.channel.send(EnterName);
}

function FetchCommand(message) {
    var CommandMessage = new Discord.MessageEmbed()
        .setTitle("Not a recognized fetch command")
        .setDescription("Type **!fetchhelp** to see the available commands")
        .setColor(0xa90000)
    message.channel.send(CommandMessage);
}

function FinalEmbedMessage(message, wikiLink, wikiImage, pgStatus, description, cardEntry) {
    var footer = ""
    var finalEmbed = new Discord.MessageEmbed()
        .setTitle(_.get(database, cardEntry + ".name"))
        .setDescription(description)
        .setImage(wikiImage)
        .setColor(0x08e0db)
        .addFields(
            { name: "Character", value: _.get(database, cardEntry + ".character"), inline: true },
            { name: "Deck", value: _.get(database, cardEntry + ".deck"), inline: true },
        );
    if (!_.get(database, cardEntry + ".keywords").includes("Unplayable")) {
        finalEmbed.addFields(
            { name: "Actions", value: _.get(database, cardEntry + ".actions"), inline: true },
        );
    }
    if (_.get(database, cardEntry + ".upgrades") != "N/A" && _.get(database, cardEntry + ".xp") != "N/A") {
        finalEmbed.addFields(
            { name: "XP. Needed", value: _.get(database, cardEntry + ".xp"), inline: true },
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

function fetchStats(currentPing, currentLatency, message) {
    let descToSend = statsDesc + "\n**Latency:** " + currentPing +
        "ms.\n**API Latency:** " + currentLatency +
        "ms.\n**No. of servers I'm in:** " +
        client.guilds.cache.size;
    let statsEmbed = new Discord.MessageEmbed()
        .setTitle("Card Fetcher's Stats")
        .setDescription(descToSend);
    message.channel.send(statsEmbed);
}

var GlobalSentMessage, GlobalMessage;
var FetchingCard = false;

//LOG ON, then WAIT FOR MESSAGES
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("!fetchhelp");
});

client.on("message", async msg => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return;
    var body = msg.content.slice(prefix.length).toLowerCase();
    if (body == "fetch" || body == "fetchicon") {
        PleaseEnterAName(msg);
        return;
    }
    //splitting message by first space
    var CardRequest, OriginalRequest, command, splitStr
    if (body.indexOf(" ") >= 0) {
        command = body.substr(0, body.indexOf(" "));
        OriginalRequest = body.substr(body.indexOf(" ") + 1);
        CardRequest = body.substr(body.indexOf(" ") + 1);
    } else command = body;
    if (command == "fetchhelp") {
        GlobalMessage = msg;
        msg.channel.send(HelpEmbed);
    } else if (command == "fetchstats") {
        GlobalMessage = msg;
        let ping = Date.now() - msg.createdTimestamp;
        let APIPing = Math.round(client.ws.ping);
        fetchStats(ping, APIPing, msg);
    } else if (command == "fetchicon") {
        GlobalMessage = msg;
        if (CardRequest.indexOf(" ") > -1) {
            splitStr = CardRequest.split(" ");
            for (var i = 0; i < splitStr.length; i++) {
                if (splitStr[i] == " " || splitStr[i] == "") {
                    let removed = splitStr.splice(i, 1);
                    i--;
                };
            }
            CardRequest = splitStr.join(" ");
        };
        IconToFetch = CardRequest.replace(/[- ]/g, "_").replace(/\+/g, "_plus").replace(/[,.'’:!]/g, "");
        var ImageLink = _.get(database, IconToFetch + '.icon');
        if (typeof ImageLink !== 'undefined' && ImageLink != "N/A") {
            const attachment = new MessageAttachment(ImageLink);
            attachment.name = IconToFetch + ".png";
            console.log("SENDING " + ImageLink + " AS ATTACHMENT");
            msg.channel.send(attachment);
        } else IconNotFoundEmbed(msg, OriginalRequest);
    } else if (command == "fetch") {
        GlobalSentMessage = msg;
        const SentMessage = await msg.channel.send(TempEmbed);
        var wikirequest;
        if (CardRequest.indexOf(" ") > -1) {
            splitStr = CardRequest.split(" ");
            for (var i = 0; i < splitStr.length; i++) {
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
            wikirequest = CardRequest.charAt(0).toUpperCase() + CardRequest.substring(1);
        }
        if (wikirequest == "Shock-box") { wikirequest = "Shock-Box"; }
        //replacing apostraphies and spaces to make it url friendly
        wikirequest = wikirequest.replace(/ /g, "_").replace(/['’]/g, '%27').replace(/[:+]/g, "");
        if (wikirequest == "Boosted_Robo-kick") { wikirequest = "Boosted_Robo-Kick"; }
        if (wikirequest == "Enhanced_Robo-kick") { wikirequest = "Enhanced_Robo-Kick"; }
        var PageToOpen = 'https://griftlands.gamepedia.com/' + wikirequest
        var ImageToOpen = 'https://griftlands.gamepedia.com/File:' + wikirequest + ".png"
        //making request database-friendly
        if (CardRequest.indexOf(" ") > -1) {
            splitStr = CardRequest.split(" ");
            for (var i = 0; i < splitStr.length; i++) {
                if (splitStr[i] == " " || splitStr[i] == "") {
                    let removed = splitStr.splice(i, 1);
                    i--;
                };
            }
            CardRequest = splitStr.join(" ");
        };
        var CardToFetch = CardRequest.replace(/[- ]/g, "_").replace(/\+/g, "_plus").replace(/[,.'’:!]/g, "")

        console.log("SEARCHING FOR WIKI PAGE: " + PageToOpen);

        var DOMcheck, fetchPageResult, fetchImageResult;

        function fetchPage(url) {
            return new Promise(function (resolve, reject) {
                //GRABBING STATUS
                https.get(url, function (response) {
                    DOMcheck = response.statusCode;
                    if (DOMcheck != 404) {
                        var data = "";
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
                    ErrorMessage(e, SentMessage, GlobalMessage, FetchingCard);
                    reject(e);
                });
            })
        }

        var Page;
        var descriptionToAdd = "";
        var CardImage = "https://i.ibb.co/wcNk6mW/Image-Missing.png";

        function FinalEdit(pageResult, imageResult) {
            return new Promise(function (resolve, reject) {
                if (!_.has(database, CardToFetch) || typeof _.get(database, CardToFetch + ".name") === "undefined") {
                    NotFound(SentMessage, OriginalRequest);
                } else {
                    if (pageResult !== 404) {
                        Page = PageToOpen;
                    }
                    if (imageResult !== 404) {
                        //loading page content with cheerio
                        const $ = cheerio.load(imageResult);
                        CardImage = $(".mw-filepage-other-resolutions a").first().attr("href");
                    }
                    var Desc = "";
                    if (_.get(database, CardToFetch + ".flavour") != "**") {
                        Desc += _.get(database, CardToFetch + ".flavour") + "\n\n";
                    }
                    if (_.get(database, CardToFetch + ".desc") != "") {
                        Desc += _.get(database, CardToFetch + ".desc") + "\n\n";
                    }
                    var Upgrades = _.get(database, CardToFetch + ".upgrades");
                    var Rarity = _.get(database, CardToFetch + ".rarity");
                    var Type = _.get(database, CardToFetch + ".type");
                    descriptionToAdd += Desc + Rarity + " " + Type + " Card";
                    if (Upgrades != "N/A") {
                        descriptionToAdd += "\n\n"
                        var UpgradeNumber = 1;
                        for (var i = 0; i < Upgrades.length; i++) {
                            if (i === Upgrades.length - 1) { //Last upgrade
                                descriptionToAdd += "**Upgrade " + UpgradeNumber + "**: " + Upgrades[i];
                            } else { //first/middle upgrades
                                descriptionToAdd += "**Upgrade " + UpgradeNumber + "**: " + Upgrades[i] + "\n";
                            }
                            UpgradeNumber++
                        }
                    }
                    FinalEmbedMessage(SentMessage, Page, CardImage, pageResult, descriptionToAdd, CardToFetch);
                }
            });
        }

        const pageFetch = fetchPage(PageToOpen);
        const imageFetch = fetchPage(ImageToOpen);

        Promise.all([pageFetch, imageFetch]).then(([page, image]) => {
            return FinalEdit(page, image);
        }).catch((error) => {
            ErrorMessage(error, SentMessage, GlobalMessage, FetchingCard);
        });
    } else if (command.startsWith("fetch")) {
        FetchCommand(msg);
    } else return;
});

process.on('unhandledRejection', function (reason, p) {
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    ErrorMessage(reason, GlobalSentMessage, GlobalMessage, FetchingCard);
});

app.get('/', (req, res) => res.send("Hello World!"));

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));

client.login(process.env.DISCORD_TOKEN);