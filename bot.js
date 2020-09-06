// Getting libraries
require('dotenv').config();
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { http, https } = require('follow-redirects');
const phantom = require('phantom')
const cheerio = require('cheerio');
const prefix = "!";
const client = new Discord.Client();

//Setting embeds
const TempEmbed = new Discord.MessageEmbed()
    .setTitle('Fetching card. YAP!')
    .setColor(0x00b71a)

const HelpEmbed = new Discord.MessageEmbed()
    .setDescription("Hi there! I'm your friendly neighborhood card fetcher. At your command I fetch whatever card you want and all its available info from the Griftlands wiki! Please be aware that **the wiki is a heavy work-in-progress;** a database is being developed but until it is finished, **I pull data from the card's page, which can be incomplete or in a format that I'm not programmed to parse.**\n\nTo use me, type " + '"!fetch [card name]"' + " without the quotes and brackets. **The card name is case sensitive** (in most cases) **and must be spelled correctly.**\n\nBecause the wiki is actively changing unexpected bugs might pop up from time to time, so be sure to ping my creator @Sei Bellissima to let her know about any you find! You can also report issues or send suggestions to my github repository: https://github.com/Sei-Bellissima/card-fetcher\n\nTo display this message again, type " + '"!fetchhelp"')
    .setThumbnail("https://i.ibb.co/k8j3mWj/Auto-Dog-Boticon.png")
    .setColor(0x08e0db)

function ErrorMessage(ErrorMsg, MsgToEdit) {
    console.log(ErrorMsg);
    var ErrorEmbed = new Discord.MessageEmbed()
            .setTitle('Whoops!')
            .setDescription("Looks like I've run into an error:\n\n" + "`" + ErrorMsg + "`\n\nPlease ping my creator @Sei Bellissima to let her know about this!\n\n||If you are the one who summoned me, Sei, shame on you. :rookgrin: Now go and fix me!||")
            .setColor(0xa90000)
    MsgToEdit.edit(ErrorEmbed);
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
        .setFooter(Page);
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

const WarStoryEmbed = new Discord.MessageEmbed()
        .setTitle("War Story")
        .setDescription("War Story. Cost 1. Negotiation Card. Unique Manipulate. Gamble. Heads: Gain 5 Influence. Snails: Gain 4 Dominance. Expend.")
        .setColor(0x08e0db)
        .setImage("https://static.wikia.nocookie.net/griftlands_gamepedia_en/images/4/4c/War_Story.png/revision/latest/scale-to-width-down/159?cb=20200902123936")
        .setURL("https://griftlands.gamepedia.com/War_Story")
        .setFooter("https://griftlands.gamepedia.com/War_Story");

//LOG ON, then WAIT FOR MESSAGES
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("!fetchhelp"); 
});

client.on('message', async msg => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return;
    if (msg.content == "!fetch") return;
    const body = msg.content.slice(prefix.length);
    //splitting message by first space
    let CardRequest = null;
    let command = null;
    if (body.indexOf(' ') >= 0){
        command = body.substr(0,body.indexOf(' '));
        CardRequest = body.substr(body.indexOf(' ')+1);
    } else command = body;
    if (command == "fetchhelp") {
        msg.channel.send(HelpEmbed)
    } else if (command == "fetch") {
        const SentMessage = await msg.channel.send(TempEmbed);
        //replacing apostraphies and spaces to make it url friendly
        var CardToFetch = CardRequest.replace(/ /g,"_");
        CardToFetch = CardToFetch.replace(/'/g, '%27');
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
                    ErrorMessage(e, SentMessage);
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
                    ErrorMessage(e, SentMessage);
                    reject(e);
                });
            });
        }
        
        function pContent(StatusResult) {
            return new Promise(function(resolve, reject) {
                if (StatusResult === 404) { //phantom will not load if 404
                        resolve(StatusResult);
                    } else {
                        (async function() {
                            const instance = await phantom.create();
                            const page = await instance.createPage();
                            
                            const status = await page.open(PageToOpen);
                            const content = await page.property('content');
                
                            await instance.exit();
                            LoadContent = content;
                            var PromiseContent = content;
                            resolve(PromiseContent);
                        })();
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
        var SetNode = "N/A"
        var DeckTypeNode = "N/A"
        var CardTypeNode = "N/A"
        var ExpNeededNode = "N/A"
        var UpgradeableNode = "N/A"
        
        function FinalEdit(FeStatus, FeContent) {
            return new Promise(function(resolve, reject) {
                if (FeStatus === 404) {
                    NotFound(SentMessage, CardRequest);
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
                        CardImage = $(".mw-filepage-other-resolutions a").first().attr("href");
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
                        var DeckType = TableElements.indexOf('Deck Type');
                        DeckTypeNode = ++DeckType;
                        var CardType = TableElements.indexOf('Card Type');
                        CardTypeNode = ++CardType;
                        var ExpNeeded = TableElements.indexOf('Exp. Required');
                        ExpNeededNode = ++ExpNeeded;
                        var Upgradeable = TableElements.indexOf('Upgradeable');
                        UpgradeableNode = ++Upgradeable;
                        
                        if (Set > 0) {
                            Description += "**Set**: " + TableElements[SetNode] + "\n";
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
                if (FetchingImage == true) {
                    console.log("IMAGE FOUND, FETCHING");
                };
                return pContent(result);
            }
        }).then(function(result) {
            console.log("THIRD RESULT RECEIVED");
            return FinalEdit(DOMcheck, result);
        }).then(function(result) {
            console.log("FINAL MESSAGE SENT");
        }).catch((error) => {
            ErrorMessage(error, SentMessage);
        });
    } else return;
});

client.login(process.env.DISCORD_TOKEN);
