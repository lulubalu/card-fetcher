const { MessageEmbed } = require("discord.js");
const _ = require("lodash");

const states = {
    "1": "CARD",
    "2": "GRAFT",
    "3": "BOBA",
    "4": "MUTATORSPERKS",
    "5": "PEOPLE",
    "6": "COIN",
    "7": "SPECIAL"
}

module.exports = {
    sendEmbed(message, entry, database, databaseNumber) {
        let state = states[databaseNumber];
        let urlToUse = "https://griftlands.fandom.com/wiki/";
        let descToAdd = "";
        let finalEmbed = new MessageEmbed();

        //title and color are the easiest to do, get those out of the way first
        if (state == "SPECIAL") {
            finalEmbed
                .setTitle(_.get(database, entry + ".title"))
                .setColor(0x00b71a);
        } else {
            finalEmbed
                .setTitle(_.get(database, entry + ".name"))
                .setColor(0x08e0db);
        }

        //image
        if (state == "CARD") {
            if (_.get(database, entry + ".image") == "N/A") {
                finalEmbed.setImage("https://i.ibb.co/wcNk6mW/Image-Missing.png");
            } else finalEmbed.setImage(_.get(database, entry + ".image"));
        } else if (state != "SPECIAL") {
            if (_.get(database, entry + ".icon") == "N/A") {
                finalEmbed.setImage("https://i.ibb.co/wcNk6mW/Image-Missing.png");
            } else finalEmbed.setImage(_.get(database, entry + ".icon"));
        }

        //starting with description; check for flavor texts first
        let mayHaveFlavor = state == "CARD" || state == "GRAFT";
        if (mayHaveFlavor && _.get(database, entry + ".flavour") != "**") {
            descToAdd = _.get(database, entry + ".flavour") + "\n\n";
        }

        //check if a person, if not will do desc
        if (state == "PEOPLE" && _.get(database, entry + ".bio") != "N/A") {
            descToAdd = _.get(database, entry + ".bio")
        } else if (state != "PEOPLE" && _.get(database, entry + ".desc") != "") { //add description from database if not blank
            if (state == "SPECIAL" && message.type == "APPLICATION_COMMAND") {
                descToAdd += _.get(database, entry + ".desc").replace(/\!fetch/g, "/fetch");
            } else descToAdd += _.get(database, entry + ".desc");
        }

        //The "Type" field is set first for Grafts, Boons, Banes, Mutators, and Perks
        //And the key they use is the same, so set that next
        if (state == "GRAFT" || state == "BOBA" || state == "MUTATORSPERKS") {
            finalEmbed.addFields(
                { name: "Type", value: _.get(database, entry + ".type"), inline: true }
            );
        }

        //now we go onto specifics for each type of state
        //Cards first
        if (state == "CARD") {
            let upgrades = _.get(database, entry + ".upgrades");
            let rarity = _.get(database, entry + ".rarity");
            let type = _.get(database, entry + ".type");
            let keywords = _.get(database, entry + ".keywords");

            descToAdd += `\n\n${rarity} ${type} Card`;

            if (upgrades != "N/A") {
                descToAdd += "\n\n";
                for (let i = 1; i <= upgrades.length; i++) {
                    descToAdd += `**Upgrade ${i}**: ${upgrades[i - 1]}${(i === upgrades.length) ? "" : "\n"}`;
                }
            }
        
            if (_.get(database, entry + ".xp") == "N/A" && upgrades != "N/A" && !keywords.includes("Hatch")) {
                descToAdd += "\n\nThis card cannot be upgraded by playing it; however it can be upgraded through other means.";
            }

            //set url, if N/A will not be applied later
            urlToUse = _.get(database, entry + ".wikilink");

            finalEmbed
                .addFields(
                    { name: "Character", value: _.get(database, entry + ".character"), inline: true },
                    { name: "Deck", value: _.get(database, entry + ".deck"), inline: true },
                );

            if (!keywords.includes("Unplayable")) {
                finalEmbed.addFields(
                    { name: "Actions", value: _.get(database, entry + ".actions"), inline: true },
                );
            }
        
            if (upgrades != "N/A" && _.get(database, entry + ".xp") != "N/A" && !keywords.includes("Hatch")) {
                finalEmbed.addFields(
                    { name: "XP. Needed", value: _.get(database, entry + ".xp"), inline: true },
                );
            }
        }

        //Grafts
        if (state == "GRAFT") {
            let upgrade = _.get(database, entry + ".upgrade");
            if (upgrade != "N/A") {
                descToAdd += `\n\nUpgrade: ${upgrade}`;
            }

            let type = _.get(database, entry + ".type");
            urlToUse += `Grafts#${(type == "Battle") ? "Battle_Grafts" : "Negotiation_Grafts"}`;

            finalEmbed
                .addFields(
                    { name: "Character", value: _.get(database, entry + ".character"), inline: true },
                    { name: "Rarity", value: _.get(database, entry + ".rarity"), inline: true },
                );

            let xp = _.get(database, entry + ".xp");
            if (xp != "N/A") {
                finalEmbed.addFields(
                    { name: "XP. Needed", value: _.get(database, entry + ".xp"), inline: true },
                );
            }
        }

        //Boons/Banes
        if (state == "BOBA") {
            let type = _.get(database, entry + ".type");
            urlToUse += `Relationships#List_of_${(type == "Boon") ? "Boons" : "Banes"}`;

            let givenBy = _.get(database, entry + ".givenby");
            if (givenBy.length > 0) {
                descToAdd += `\n\nGiven by:\n${givenBy.join("\n")}`;
            }
        }

        //Mutators/Perks
        if (state == "MUTATORSPERKS") {
            let type = _.get(database, entry + ".type");
            urlToUse += `${(type == "Mutator") ? "Mutators" : "Perks"}`;
        }

        //People
        if (state == "PEOPLE") {
            urlToUse = "N/A"; //wikilinks are a TODO
            faction = _.get(database, entry + ".faction");
            title = _.get(database, entry + ".title");

            if (faction != "N/A" && title != "N/A") {
                descToAdd += `${descToAdd != "" ? "\n\n" : ""}${faction} ${title}`;
            } else if (title != "N/A") {
                descToAdd += `${descToAdd != "" ? "\n\n" : ""}${title}`;
            }
            
            //everything else is just checking if valid and then adding fields
            if (_.get(database, entry + ".gender") != "N/A") {
                finalEmbed.addFields(
                    { name: "Gender", value: _.get(database, entry + ".gender"), inline: true },
                )
            }
            if (_.get(database, entry + ".species") != "N/A") {
                finalEmbed.addFields(
                    { name: "Species", value: _.get(database, entry + ".species"), inline: true },
                )
            }
            if (_.get(database, entry + ".health") != "N/A") {
                finalEmbed.addFields(
                    { name: "Base Health", value: _.get(database, entry + ".health").toString(), inline: true },
                )
            }
            if (_.get(database, entry + ".deathLoot") != "N/A") {
                finalEmbed.addFields(
                    { name: "Death Loot", value: _.get(database, entry + ".deathLoot"), inline: true },
                )
            }
            if (_.get(database, entry + ".boon") != "N/A") {
                finalEmbed.addFields(
                    { name: "Boon", value: _.get(database, entry + ".boon"), inline: true },
                )
            }
            if (_.get(database, entry + ".bane") != "N/A") {
                finalEmbed.addFields(
                    { name: "Bane", value: _.get(database, entry + ".bane"), inline: true },
                )
            }
        }

        //Coins
        if (state == "COIN") {
            urlToUse += "Rook#Lucky_Coins";
        }

        //finally set description, url and footer
        finalEmbed.setDescription(descToAdd);
        if (urlToUse != "N/A" && state != "SPECIAL") {
            finalEmbed.setURL(urlToUse);
            finalEmbed.setFooter(urlToUse, "https://i.ibb.co/Zh8VshB/Favicon.png");
        } else if (state != "SPECIAL" && state != "PEOPLE") {
            finalEmbed.setFooter("Wiki page not available");
        }

        //Send embed!
        if (message.type == "APPLICATION_COMMAND") {
            message.reply({ embeds: [ finalEmbed ] });
        } else {
            message.channel.send({ embeds: [ finalEmbed ] });
        }
    }
}