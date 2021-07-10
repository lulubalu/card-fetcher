const { MessageEmbed, MessageAttachment } = require("discord.js");
const _ = require("lodash");
const cardDatabase = require("../databases/cards.json");
const graftDatabase = require("../databases/grafts.json");

function pleaseEnterAName(message) {
    const enterName = new MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription("Please enter the name of a card/graft after the command! Eg: `!fetchicon Stab`")
        .setColor(0xa90000)
    message.channel.send(enterName);
}

function IconNotFoundEmbed(message, attemptedFetch) {
    let IconNotFound = new MessageEmbed()
        .setTitle("Unable to Fetch")
        .setDescription(`Icon for \"${attemptedFetch}\" not found!`)
        .setColor(0xa90000)
    message.channel.send(IconNotFound);
}

module.exports = {
	name: "fetchicon",
	execute(message, args) {
        if (typeof args === "undefined") {
            pleaseEnterAName(message);
            return;
        }
        let request, splitStr;
		if (args.indexOf(" ") > -1) {
            splitStr = args.split(" ");
            for (i = 0; i < splitStr.length; i++) {
                if (splitStr[i] == " " || splitStr[i] == "") {
                    let removed = splitStr.splice(i, 1);
                    i--;
                };
            }
            request = splitStr.join(" ").toLowerCase();
        } else {
            request = args.toLowerCase()
        }

        let iconToFetch = request.replace(/[- ]/g, "_").replace(/\+/g, "_plus").replace(/[,.':!?\u2018\u2019\u201C\u201D]/g, "");
        let imageLink = _.get(cardDatabase, iconToFetch + '.icon');
        if (typeof imageLink === "undefined" || imageLink == "N/A") {
            imageLink = _.get(graftDatabase, iconToFetch + '.icon');
        }
        if (typeof imageLink !== 'undefined' && imageLink != "N/A") {
            const attachment = new MessageAttachment(imageLink);
            attachment.name = `${iconToFetch}.png`;
            console.log(`SENDING ${imageLink} AS ATTACHMENT`);
            message.channel.send(attachment);
        } else IconNotFoundEmbed(message, args);
	},
};