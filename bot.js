// Getting libraries
require('dotenv').config();
const Discord = require('discord.js');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { http, https } = require('follow-redirects');
const cheerio = require('cheerio');
var _ = require('lodash');
let database = require('./database.json');
const prefix = "!";
const express = require('express');
const app = express();
const port = 3000;
const client = new Discord.Client();

//Setting embeds
const TempEmbed = new Discord.MessageEmbed()
    .setTitle('Fetching card. YAP!')
    .setColor(0x00b71a)

const HelpEmbed = new Discord.MessageEmbed()
    .setDescription("Hi there! I'm your friendly neighborhood card fetcher. At your command I fetch whatever card you want and all its available info!\n\n" + '"**!fetch [card name]**"' + " -- This will fetch the card's stats, description, flavor text and card image if available.\n\n" + '"**!fetchicon [card name]**"' + " -- This will fetch the card art alone.\n\n" + '"**!fetchstats**"' + " -- Get card stats, bot ping and other stats.\n\nRemember to use the commands above without the quotes and brackets, and that **the card name must be spelled correctly.**\n\nIf you encounter any errors while using me be sure to ping my creator @Sei Bellissima to let her know about it! You can also report issues or send suggestions to my github repository: https://github.com/Sei-Bellissima/card-fetcher\n\nTo display this message again, type " + '"!fetchhelp"')
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
        .setTitle('Unable to Fetch')
        .setDescription('Card "' + Request + '" not found!')
        .setColor(0xa90000)
    MsgToEdit.edit(NotFoundEmbed);
}

function IconNotFoundEmbed(message, AttemptedFetch) {
    var IconNotFound = new Discord.MessageEmbed()
        .setTitle('Unable to Fetch')
        .setDescription('Icon for "' + AttemptedFetch + '" not found!')
        .setColor(0xa90000)
    message.channel.send(IconNotFound);
}

function PleaseEnterAName(message) {
    var EnterName = new Discord.MessageEmbed()
        .setTitle('Unable to Fetch')
        .setDescription('Please enter a card name after the command!')
        .setColor(0xa90000)
    message.channel.send(EnterName);
}

function FetchCommand(message) {
    var CommandMessage = new Discord.MessageEmbed()
        .setTitle('Not a recognized fetch command')
        .setDescription('Type **!fetchhelp** to see the available commands')
        .setColor(0xa90000)
    message.channel.send(CommandMessage);
}

function FinalEmbedMessage(message, wikiLink, wikiImage, pgStatus, description, cardEntry) {
    var footer = ""
    var finalEmbed = new Discord.MessageEmbed()
        .setTitle(_.get(database, cardEntry + '.name'))
        .setDescription(description)
        .setImage(wikiImage)
        .setColor(0x08e0db)
        .addFields(
            { name: 'Character', value: _.get(database, cardEntry + '.character'), inline: true },
            { name: 'Deck', value: _.get(database, cardEntry + '.deck'), inline: true },
        );
    if (!_.get(database, cardEntry + '.keywords').includes("Unplayable")) {
        finalEmbed.addFields(
            { name: 'Actions', value: _.get(database, cardEntry + '.actions'), inline: true },
        );
    }
    if (_.get(database, cardEntry + '.upgrades') != "N/A") {
        finalEmbed.addFields(
            { name: 'XP. Needed', value: _.get(database, cardEntry + '.xp'), inline: true },
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

var GlobalSentMessage, GlobalMessage;
var FetchingCard = false;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Listening at http://localhost:${port}`));

//LOG ON, then WAIT FOR MESSAGES
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("!fetchhelp");
});

client.on('message', async msg => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return;
    var body = msg.content.slice(prefix.length).toLowerCase();
    if (body == "fetch" || body == "fetchicon") {
        PleaseEnterAName(msg);
        return;
    }
    GlobalMessage = msg;
    //splitting message by first space
    var CardRequest, OriginalRequest, command, splitStr
    if (body.indexOf(' ') >= 0) {
        command = body.substr(0, body.indexOf(' '));
        OriginalRequest = body.substr(body.indexOf(' ') + 1);
        CardRequest = body.substr(body.indexOf(' ') + 1);
    } else command = body;
    if (command == "fetchhelp") {
        msg.channel.send(HelpEmbed)
    } else if (command == "fetchstats") {
        //console.log(_.keys(database));
        var total = 0;
        var namedCards = 0;
        var icons = 0;
        var battleCards = 0;
        var negotiationCards = 0;
        var attackCards = 0;
        var maneuverCards = 0;
        var diplomacyCards = 0;
        var hostilityCards = 0;
        var itemCards = 0;
        var statusCards = 0;
        var flourishCards = 0;
        var basicCards = 0;
        var commonCards = 0;
        var uncommonCards = 0;
        var rareCards = 0;
        var uniqueCards = 0;
        var salCards = 0;
        var rookCards = 0;
        var smithCards = 0;
        var generalCards = 0;
        _.forEach(database, function (value, key) {
            //console.log(key);
            total++;
            if (typeof _.get(database, key + '.name') !== 'undefined') {
                namedCards++;
            }

            var iconLink = _.get(database, key + '.icon');
            if (typeof iconLink !== 'undefined' && iconLink != "N/A") {
                icons++;
            }

            if (_.get(database, key + '.deck') == "Battle") {
                battleCards++;
            } else if (_.get(database, key + '.deck') == "Negotiation") {
                negotiationCards++;
            }

            if (_.get(database, key + '.type') == "Attack") {
                attackCards++;
            } else if (_.get(database, key + '.type') == "Maneuver") {
                maneuverCards++;
            } else if (_.get(database, key + '.type') == "Diplomacy") {
                diplomacyCards++;
            } else if (_.get(database, key + '.type') == "Hostility") {
                hostilityCards++;
            } else if (_.get(database, key + '.type') == "Item") {
                itemCards++;
            } else if (_.get(database, key + '.type') == "Status") {
                statusCards++;
            } else if (_.get(database, key + '.type') == "Flourish") {
                flourishCards++;
            }

            if (_.get(database, key + '.rarity') == "Basic") {
                basicCards++
            } else if (_.get(database, key + '.rarity') == "Common") {
                commonCards++;
            } else if (_.get(database, key + '.rarity') == "Uncommon") {
                uncommonCards++;
            } else if (_.get(database, key + '.rarity') == "Rare") {
                rareCards++;
            } else if (_.get(database, key + '.rarity') == "Unique") {
                uniqueCards++;
            }

            var characterType = _.get(database, key + '.character');
            if (characterType == "Sal") {
                salCards++;
            } else if (characterType == "Rook") {
                rookCards++
            } else if (characterType == "Smith") {
                smithCards++
            } else if(characterType == "General" || characterType == "Daily" || characterType == "Npc") {
                generalCards++
            }
        });
        var ping = Date.now() - msg.createdTimestamp;
        var statsEmbed = new Discord.MessageEmbed()
            .setTitle("Card Fetcher's Stats")
            .setDescription("**Total no. of keys in the database:** " + total +
                "\n**Total Cards:** " + namedCards +
                "\n**Icons:** " + icons +
                "\n**Battle Cards:** " + battleCards +
                "\n**Negotiation Cards:** " + negotiationCards +
                "\n**Attack Cards:** " + attackCards +
                "\n**Maneuver Cards:** " + maneuverCards +
                "\n**Diplomacy Cards:** " + diplomacyCards +
                "\n**Hostility Cards:** " + hostilityCards +
                "\n**Item Cards:** " + itemCards +
                "\n**Status Cards:** " + statusCards +
                "\n**Flourish Cards:** " + flourishCards +
                "\n**Basic Cards:** " + basicCards +
                "\n**Common Cards:** " + commonCards +
                "\n**Uncommon Cards:** " + uncommonCards +
                "\n**Rare Cards:** " + rareCards +
                "\n**Unique Cards:** " + uniqueCards +
                "\n**Sal Cards:** " + salCards +
                "\n**Rook Cards:** " + rookCards +
                "\n**Smith Cards:** " + smithCards +
                "\n**General Cards:** " + generalCards +
                "\n\n**Latency:** " + ping + "ms.\n**API Latency:** "
                + Math.round(client.ws.ping) + "ms." +
                "\n**No. of servers I'm in:** " + client.guilds.cache.size);
        msg.channel.send(statsEmbed);
    } else if (command == "fetchicon") {
        if (CardRequest.indexOf(" ") > -1) {
            splitStr = CardRequest.split(' ');
            for (var i = 0; i < splitStr.length; i++) {
                if (splitStr[i] == " " || splitStr[i] == "") {
                    let removed = splitStr.splice(i, 1);
                    i--;
                };
            }
            CardRequest = splitStr.join(' ');
        };
        IconToFetch = CardRequest.replace(/[- ]/g, "_").replace(/[,.'’:!]/g, "");
        var ImageLink = _.get(database, IconToFetch + '.icon');
        if (typeof ImageLink !== 'undefined' && ImageLink != "N/A") {
            const attachment = new MessageAttachment(ImageLink);
            attachment.name = IconToFetch + ".png";
            console.log("SENDING " + ImageLink + " AS ATTACHMENT");
            msg.channel.send(attachment);
        } else IconNotFoundEmbed(msg, OriginalRequest);
    } else if (command == "fetch") {
        FetchingCard = true;
        const SentMessage = await msg.channel.send(TempEmbed);
        GlobalSentMessage = SentMessage;
        var wikirequest;
        if (CardRequest.indexOf(" ") > -1) {
            splitStr = CardRequest.split(' ');
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
            wikirequest = splitStr.join(' ');
        } else {
            wikirequest = CardRequest.charAt(0).toUpperCase() + CardRequest.substring(1);
        }
        if (wikirequest == "Shock-box") { wikirequest = "Shock-Box"; }
        //replacing apostraphies and spaces to make it url friendly
        wikirequest = wikirequest.replace(/ /g, "_").replace(/'/g, '%27').replace(/:/g, '');
        if (wikirequest == "Boosted_Robo-kick") { wikirequest = "Boosted_Robo-Kick"; }
        if (wikirequest == "Enhanced_Robo-kick") { wikirequest = "Enhanced_Robo-Kick"; }
        var PageToOpen = 'https://griftlands.gamepedia.com/' + wikirequest
        var ImageToOpen = 'https://griftlands.gamepedia.com/File:' + wikirequest + ".png"
        //making request database-friendly
        if (CardRequest.indexOf(" ") > -1) {
            splitStr = CardRequest.split(' ');
            for (var i = 0; i < splitStr.length; i++) {
                if (splitStr[i] == " " || splitStr[i] == "") {
                    let removed = splitStr.splice(i, 1);
                    i--;
                };
            }
            CardRequest = splitStr.join(' ');
        };
        var CardToFetch = CardRequest.replace(/[- ]/g, "_").replace(/[,.'’:!]/g, "");

        console.log("SEARCHING FOR WIKI PAGE: " + PageToOpen);

        var DOMcheck, fetchPageResult, fetchImageResult;

        function fetchPage(url) {
            return new Promise(function (resolve, reject) {
                //GRABBING STATUS
                https.get(url, function (response) {
                    DOMcheck = response.statusCode;
                    if (DOMcheck != 404) {
                        var data = "";
                        response.on('data', function (chunk) {
                            data += chunk;
                        });
                        response.on('end', function () {
                            resolve(data);
                        });
                    } else {
                        resolve(DOMcheck);
                    }
                }).on('error', function (e) {
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
                if (!_.has(database, CardToFetch) || typeof _.get(database, CardToFetch + '.name') === 'undefined') {
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
                    if (_.get(database, CardToFetch + '.flavour') != "**") {
                        Desc += _.get(database, CardToFetch + '.flavour') + "\n\n";
                    }
                    if (_.get(database, CardToFetch + '.desc') != "") {
                        Desc += _.get(database, CardToFetch + '.desc') + "\n\n";
                    }
                    var Upgrades = _.get(database, CardToFetch + '.upgrades');
                    var Rarity = _.get(database, CardToFetch + '.rarity');
                    var Type = _.get(database, CardToFetch + '.type');
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

        //Dangerous territory, chaining functions, I HAVE NEVER DONE THIS BEFORE AND I DON'T LIKE IT :(
        fetchPage(PageToOpen).then(function (result) {
            console.log("FIRST RESULT RECEIVED")
            fetchPageResult = result;
            return fetchPage(ImageToOpen);
        }).then(function (result) {
            fetchImageResult = result;
            return FinalEdit(fetchPageResult, fetchImageResult);
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

client.login(process.env.DISCORD_TOKEN);
