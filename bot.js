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
    .setDescription("Hi there! I'm your friendly neighborhood card fetcher. At your command I fetch whatever card you want and all its available info from the Griftlands wiki! Please be aware that **the wiki is a heavy work-in-progress;** a database is being developed but until it is finished, **I pull data from the card's page, which can be incomplete or in a format that I'm not programmed to parse.**\n\n" + '"**!fetch [card name]**"' + " -- This will fetch the card's stats, description, flavor text and card image if available. If the page for an existing card isn't found the card image alone will be posted.\n\n" + '"**!fetchicon [card name]**"' + " -- This will fetch the card art alone; you can use this for memes/reference.\n\nRemember to use the commands above without the quotes and brackets, and that **the card name must be spelled correctly.**\n\nBecause the wiki is actively changing unexpected bugs might pop up from time to time, so be sure to ping my creator @Sei Bellissima to let her know about any you find! You can also report issues or send suggestions to my github repository: https://github.com/Sei-Bellissima/card-fetcher\n\nTo display this message again, type " + '"!fetchhelp"')
    .setThumbnail("https://i.ibb.co/pw4FGTn/Auto-Dog-Boticon-Xmas.png")
    .setColor(0x08e0db)

function ErrorMessage(ErrorMsg, MsgToEdit, RequestMessage, WillEdit) {
    console.log(ErrorMsg);
    var ErrorEmbed = new Discord.MessageEmbed()
        .setTitle('Whoops!')
        .setDescription("Looks like I've run into an error:\n\n`" + ErrorMsg + "`\n\nPlease ping my creator @Sei Bellissima to let her know about this!\n\n||If you are the one who summoned me, Sei, shame on you. :rookgrin: Now go and fix me!||")
        .setColor(0xa90000)
    if (WillEdit == true) {
       MsgToEdit.edit(ErrorEmbed);
    } else {
        RequestMessage.channel.send(ErrorEmbed);
    }
}

function NotFound(MsgToEdit, Request) {
    var NotFoundEmbed = new Discord.MessageEmbed()
        .setTitle('404')
        .setDescription('Page "' + Request + '" not found!')
        .setColor(0xa90000)
    MsgToEdit.edit(NotFoundEmbed);
}

function FinalEmbedMessage(MsgToEdit, EmbedTitle, EmbedDescription, EmbedImage, Page) {
    var FinalEmbed = new Discord.MessageEmbed()
        .setTitle(EmbedTitle)
        .setDescription(EmbedDescription)
        .setColor(0x08e0db)
        .setImage(EmbedImage)
        .setURL(Page)
        .setFooter(Page, "https://i.ibb.co/Zh8VshB/Favicon.png");
    MsgToEdit.edit(FinalEmbed);
}

function ImageOnlyMessage(MsgToEdit, EmbedTitle, EmbedImage) {
    var ImageEmbed = new Discord.MessageEmbed()
        .setTitle(EmbedTitle)
        .setColor(0x08e0db)
        .setImage(EmbedImage)
        .setFooter("Page wasn't found; fetched image instead");
    MsgToEdit.edit(ImageEmbed);
}

function NotCardEmbedMessage(MsgToEdit, AttemptedFetch) {
    var NotCardEmbed = new Discord.MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription('"' + AttemptedFetch + '" is not a card!')
        .setColor(0xa90000)
    MsgToEdit.edit(NotCardEmbed);
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
    if (msg.content == "!fetch" || msg.content == "!fetchicon") {
        PleaseEnterAName(msg);
        return;
    }
    GlobalMessage = msg;
    const body = msg.content.slice(prefix.length);
    //splitting message by first space
    var CardRequest, OriginalRequest, command, splitStr
    if (body.indexOf(' ') >= 0){
        command = body.substr(0,body.indexOf(' '));
        OriginalRequest = body.substr(body.indexOf(' ')+1);
        CardRequest = body.substr(body.indexOf(' ')+1);
    } else command = body;
    if (command == "fetchhelp") {
        msg.channel.send(HelpEmbed)
    } else if (command == "fetchicon") {
        CardRequest = CardRequest.toLowerCase();
        if (CardRequest.indexOf(" ") > -1) {
            splitStr = CardRequest.split(' ');
            for (var i = 0; i < splitStr.length; i++) {
                if (splitStr[i] == " " || splitStr [i] == "") {
                    let removed = splitStr.splice(i, 1);
                    i--;
                };
            }
            CardRequest = splitStr.join(' ');
        };
        IconToFetch = CardRequest.replace(/[- ]/g,"_");
        IconToFetch = IconToFetch.replace(/[,.':]/g, "");
        var ImageLink = _.get(database, IconToFetch + '.icon');
        if (typeof ImageLink !== 'undefined') {
            const attachment = new MessageAttachment(ImageLink);
            attachment.name = IconToFetch + ".png";
            console.log("SENDING " + ImageLink + " AS ATTACHMENT");
            msg.channel.send(attachment);
        } else IconNotFoundEmbed(msg, OriginalRequest);
    } else if (command == "fetch") {
        FetchingCard = true;
        const SentMessage = await msg.channel.send(TempEmbed);
        GlobalSentMessage = SentMessage;
        splitStr = CardRequest.toLowerCase();
        if (CardRequest.indexOf(" ") > -1) {
            splitStr = splitStr.split(' ');
            for (var i = 0; i < splitStr.length; i++) {
                if (splitStr[i] != "battle" && splitStr[i] != "negotiation" && splitStr[i] != "of") {
                    if (splitStr[i] == " " || splitStr [i] == "") {
                        let removed = splitStr.splice(i, 1);
                        i--;
                    } else {
                        if (splitStr[i] == "autodog") {
                            splitStr[i] = "AutoDog"
                        } else splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
                    };
                }
            }
            CardRequest = splitStr.join(' ');
        } else {
            CardRequest = splitStr.charAt(0).toUpperCase() + splitStr.substring(1);
        }
        if (CardRequest == "Shock-box") { CardRequest = "Shock-Box"; }
        //replacing apostraphies and spaces to make it url friendly
        var CardToFetch = CardRequest.replace(/ /g,"_");
        CardToFetch = CardToFetch.replace(/'/g, '%27');
        CardToFetch = CardToFetch.replace(/:/g, '');
        if (CardToFetch == "Boosted_Robo-kick") { CardToFetch = "Boosted_Robo-Kick"; }
        if (CardToFetch == "Enhanced_Robo-kick") { CardToFetch = "Enhanced_Robo-Kick"; }
        var PageToOpen = 'https://griftlands.gamepedia.com/' + CardToFetch
        var ImageToOpen = 'https://griftlands.gamepedia.com/File:' + CardToFetch + ".png"
        console.log("FETCHING " + PageToOpen)
        
        var DOMcheck, LoadContent, PageStatus
        
        function pStatus(url) {
            return new Promise(function(resolve, reject) {
                //GRABBING STATUS
                https.get(url, function(response) {
                    DOMcheck = response.statusCode
                    PageToOpen = response.responseUrl
                    resolve(DOMcheck)
                }).on('error', function(e) {
                    ErrorMessage(e, SentMessage, GlobalMessage, FetchingCard);
                    reject(e);
                });
            })
        }
        
        function pImageStatus(url) {
            return new Promise(function(resolve, reject) {
                https.get(url, function(response) {
                    DOMcheck = response.statusCode
                    PageToOpen = response.responseUrl
                    resolve(DOMcheck)
                }).on('error', function(e) {
                    ErrorMessage(e, SentMessage, GlobalMessage, FetchingCard);
                    reject(e);
                });
            });
        }
        
        function pContent(StatusResult) {
            return new Promise(function(resolve, reject) {
                if (StatusResult === 404) { //page will not load if 404
                        resolve(StatusResult);
                    } else {
                        https.get(PageToOpen, function(res) {
                            var data = "";
                            res.on('data', function (chunk) {
                                data += chunk;
                            });
                            res.on("end", function() {
                                resolve(data);
                            });
                        }).on('error', function(e) {
                            ErrorMessage(e, SentMessage);
                            reject(e);
                        });
                    }
            });
        }
        
        var Title = "N/A"
        var Description = "No Description"
        var HasDescription = false;
        var CardImage = "https://i.ibb.co/LR1xVSM/Icon-Missing.png";
        var IsUpgradeable = false;
        
        var Categories = []
        var MustInclude = "All cards"
        var AllCardsThere = false;
        var ImageMustInclude = "Card images"
        var CardImagesThere = false;
        
        var TableElements = []
        var SetNode, RarityNode, DeckTypeNode, CardTypeNode, ExpNeededNode, UpgradeableNode;
        
        function FinalEdit(FeStatus, FeContent) {
            return new Promise(function(resolve, reject) {
                if (FeStatus === 404) {
                    NotFound(SentMessage, OriginalRequest);
                    resolve(SentMessage.content);
                } else {
                    //fetching data with cheerio
                    const $ = cheerio.load(FeContent)
                    $('#mw-normal-catlinks ul li').each(function() {
                        Categories.push($(this).text());
                    });
                    Categories.forEach(function(item) {
                        if (item == MustInclude) {
                            AllCardsThere = true
                        } else if (item == ImageMustInclude) {
                            CardImagesThere = true
                        }
                    });
                                       
                    if (CardImagesThere == true) {//proceeds to next function if it's not a card image
                        Title = $('#firstHeading').text().replace("File:", '');
                        Title = Title.replace(".png", '');
                        if (Title.search('Weakness') > -1) {
                            Title = Title.replace('Weakness', 'Weakness:');
                        }
                        CardImage = $(".mw-filepage-other-resolutions a").first().attr("href");
                        console.log("IMAGE FOUND: " + CardImage);
                        ImageOnlyMessage(SentMessage, Title, CardImage);
                        resolve(SentMessage.content);
                    } else if (AllCardsThere == true) {//will stop everything if it's NOT a card
                        var fullHTML = ''
                        //Title. Easy.
                        Title = $('#firstHeading').text();
                        //Description. Kinda difficult and weird.
                        if ($("#mw-content-text .mw-parser-output p").length) { //there's a frickin ad
                            if ($("#incontent_player").length || $("#mw-content-text .mw-parser-output h2").length === 0) {
                                $("#mw-content-text .mw-parser-output p:first-of-type")
                                    .nextUntil("div")
                                    .addBack()
                                    .each(function() {
                                        if ($(this).attr("class") == "infoboxtable") { //html is out of order on some pages
                                            return
                                        }
                                        var PreHTML = $(this).clone().html().replace(/\r?\n|\r/, '');
                                        if (PreHTML.indexOf("<br>") === -1 && PreHTML != "&apos;<b></b>") {
                                            fullHTML += PreHTML + "\n\n";
                                        } else return;
                                    });
                            } else {
                                $("#mw-content-text .mw-parser-output p:first-of-type")
                                    .nextUntil("h2")
                                    .addBack()
                                    .each(function() {
                                        if ($(this).attr("class") == "infoboxtable") { //html is out of order on some pages
                                            return
                                        }
                                        var PreHTML = $(this).clone().html().replace(/\r?\n|\r/, '');
                                        if (PreHTML.indexOf("<br>") === -1 && PreHTML != "&apos;<b></b>") {
                                            fullHTML += PreHTML + "\n\n";
                                        } else return;
                                    });
                            }
                            //there's probably a better way of doing this but I'm scatterbrained and don't know how
                            fullHTML = fullHTML.replace(/<i>/g, '*');
                            fullHTML = fullHTML.replace(/<\/i>/g, '*');
                            fullHTML = fullHTML.replace(/<b>/g, '**');
                            fullHTML = fullHTML.replace(/<\/b>/g, '**');
                            if (fullHTML.indexOf("<") > -1 && fullHTML.indexOf(">") > -1) {
                                Description = $(fullHTML).text();
                            } else {
                                Description = fullHTML
                            };
                            HasDescription = true;
                        }
                        
                        if (HasDescription == false) {
                            Description += "\n\n"
                        }
                        
                        //Table items for upgrades, deck and card types.
                        $(".infoboxtable td").each(function(){
                            //I don't know why there are line breaks but they need to be removed
                            var ToPush = $(this).text().replace(/\r?\n|\r/, '');
                            TableElements.push(ToPush);
                        })
                        //GRABBING INDEXES. THIS IS A MASSIVE PAIN IN THE BUTT!!!
                        var Set = TableElements.indexOf('Set');
                        SetNode = ++Set;
                        var Rarity = TableElements.indexOf('Rarity');
                        RarityNode = ++Rarity;
                        var DeckType = TableElements.indexOf('Deck Type');
                        DeckTypeNode = ++DeckType;
                        var CardType = TableElements.indexOf('Card Type');
                        CardTypeNode = ++CardType;
                        var ExpNeeded = TableElements.indexOf('XP required');
                        ExpNeededNode = ++ExpNeeded;
                        var Upgradeable = TableElements.indexOf('Upgradeable');
                        UpgradeableNode = ++Upgradeable;
                        
                        if (Set > 0) {
                            Description += "**Rarity**: " + TableElements[SetNode] + "\n";
                        };
                        if (Rarity > 0) {
                            Description += "**Rarity**: " + TableElements[RarityNode] + "\n";
                        };
                        if (DeckType > 0) {
                            Description += "**Deck Type**: " + TableElements[DeckTypeNode] + "\n"
                        };
                        if (CardType > 0) {
                            Description += "**Card Type**: " + TableElements[CardTypeNode];
                        };
                        
                        //Upgrades
                        if (TableElements[UpgradeableNode] != "no" && TableElements[UpgradeableNode] != "No" && 
                        $(".infoboxtable tr:contains('Upgrades')").next().length) {
                            var UpgradeNumber = 1
                            Description += "\n**Exp. Needed**: " + TableElements[ExpNeededNode]
                            $(".infoboxtable td:contains('Upgrade')").each(function() {
                                if ($(this).text() != "Upgradeable" && $(this).text() != "upgradeable") {
                                    Description += "\n**Upgrade " + UpgradeNumber + "**: " + $(this).next().text().replace(/\r?\n|\r/, '');
                                    UpgradeNumber++
                                } else return;
                            });
                        };
                        
                        //Image! Not full-size since wiki has it set up in a weird way but the embed was getting big anyway
                        if ($(".infoboxtable .image").length) {
                            CardImage = $(".infoboxtable .image img").attr('src');
                        } else if ($(".mw-parser-output .thumbimage").length) {
                            CardImage = $(".mw-parser-output .thumbimage").attr('src');
                        }
                        
                        FinalEmbedMessage(SentMessage, Title, Description, CardImage, PageToOpen)
                        
                        resolve(SentMessage.content);
                    } else {
                        NotCardEmbedMessage(SentMessage, CardRequest)
                        resolve(SentMessage.content);
                    }
                }
            });
        }
        
        function CarryOver(ResultToCarry) {
            return new Promise(function(resolve, reject) {
                resolve(ResultToCarry);
            });
        }
        
        var FetchingImage = false;
        //Dangerous territory, chaining functions, I HAVE NEVER DONE THIS BEFORE AND I DON'T LIKE IT :(
        pStatus(PageToOpen).then(function(result) {
            console.log("FIRST RESULT: " + result);
            if (result === 404) {
                console.log("PAGE NOT FOUND, LOOKING FOR IMAGE INSTEAD")
                FetchingImage = true;
                return pImageStatus(ImageToOpen);
            } else {
                console.log("PAGE FOUND: " + PageToOpen);
                return pContent(result);
            }
        }).then(function(result) {
            console.log("SECOND RESULT RECEIVED");
            if (result === 404) {
                console.log("IMAGE NOT FOUND, CARRYING OVER")
                return CarryOver(result)
            } else {
                return pContent(result);
            }
        }).then(function(result) {
            console.log("THIRD RESULT RECEIVED");
            return FinalEdit(DOMcheck, result);
        }).then(function(result) {
            console.log("FINAL MESSAGE SENT");
        }).catch((error) => {
            ErrorMessage(error, SentMessage, GlobalMessage, FetchingCard);
        });
    } else if (command.startsWith("fetch")) {
        FetchCommand(msg);
    } else return;
});

process.on('unhandledRejection', function(reason, p){
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    ErrorMessage(reason, GlobalSentMessage, GlobalMessage, FetchingCard);
});

client.login(process.env.DISCORD_TOKEN);
