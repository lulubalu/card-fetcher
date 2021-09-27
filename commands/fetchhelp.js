require("dotenv").config();
const { MessageEmbed } = require("discord.js");

const helpEmbed = new MessageEmbed()
    .setDescription("Hi there! I'm a bot designed to fetch cards from Klei Entertainment's *Griftlands*."
        + " \n\nNot only do I fetch cards, I also fetch grafts, boons, banes, mutators, perks, people and Rook's Lucky Coins!\n\n"
        + "\"**!fetch [item name]**\" -- This will fetch the item's stats, description, flavor text and image if available.\n\n"
        + "\"**!fetchicon [item name]**\" -- This will fetch the item's art alone.\n\n"
        + "\"**!fetchsearch [-optional option] [search query]**\" -- Searches across all databases and returns similar results."
        + " (Valid Options: `name`, `flavor`, `flavour`, `description`. Without a provided option, Card Fetcher defaults to searching by name)\n\n"
        + "\"**!fetchrandom / !fetchrandomicon**\" -- fetches a random item/a random item art.\n\n"
        + "\"**!fetchstats**\" -- Get database stats, bot ping and other stats.\n\n"
        + "\"**!fetchgithub**\" -- Get github links and info, including change notes for my latest version and dependency versions.\n\n"
        + "Remember to use the commands above without the quotes and brackets, and that **the item's name must be spelled correctly.**"
        + "\n\nIf you encounter any errors while using me be sure to ping my creator @Sei Bellissima to let her know about it!"
        + " You can also report issues or send suggestions to my github repository: https://github.com/Sei-Bellissima/card-fetcher")
    .setThumbnail(process.env.AVATAR)
    .setColor(0x08e0db)
    .setFooter("To display this message again, type \"!fetchhelp\"");

module.exports = {
	name: "fetchhelp",
    description: "Get Card Fetcher's list of commands.",
	async execute(message) {
        if (message.type == "APPLICATION_COMMAND") {
            await message.reply({ embeds: [ helpEmbed ] });
        } else {
	        message.channel.send({ embeds: [ helpEmbed ] });
        }
	},
};