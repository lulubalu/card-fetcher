const { MessageEmbed } = require("discord.js");

const helpEmbed = new MessageEmbed()
    .setDescription("Hi there! I'm a bot designed to fetch cards from Klei Entertainment's *Griftlands*."
        + " \n\nNot only do I fetch cards, I also fetch grafts, boons, and banes!\n\n"
        + "\"**!fetch [item name]**\" -- This will fetch the item's stats, description, flavor text and card image if available.\n\n"
        + "\"**!fetchicon [item name]**\" -- This will fetch the item's art alone.\n\n"
        + "\"**!fetchstats**\" -- Get database stats, bot ping and other stats.\n\n"
        + "\"**!fetchgithub**\" -- Get github links and info, including change notes for my latest version and dependency versions.\n\n"
        + "Remember to use the commands above without the quotes and brackets, and that **the item's name must be spelled correctly.**"
        + "\n\nIf you encounter any errors while using me be sure to ping my creator @Sei Bellissima to let her know about it! You can also report issues or send suggestions to my github repository: https://github.com/Sei-Bellissima/card-fetcher\n\nTo display this message again, type " + '"!fetchhelp"')
    .setThumbnail("https://i.ibb.co/VmnxVvr/Auto-Dog-Boticon.png")
    .setColor(0x08e0db);

module.exports = {
    name: "fetchhelp",
    execute(message) {
        message.channel.send(helpEmbed);
    },
};