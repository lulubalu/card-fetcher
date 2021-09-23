const _ = require("lodash");
const cardDatabase = require("../databases/cards.json");
const graftDatabase = require("../databases/grafts.json");
const bobaDatabase = require("../databases/boonsBanes.json");
const mutatorsPerksDatabase = require("../databases/mutatorsPerks.json");
const coinDatabase = require("../databases/coins.json");

const databases = [ cardDatabase, graftDatabase, bobaDatabase, mutatorsPerksDatabase, coinDatabase ];

module.exports = {
	name: "fetchiconrandom",
    description: "Fetches a random item's art.",
	execute(message, args, client) {
		let dbToUse = databases[Math.floor(Math.random() * databases.length)];
        let keyList = Object.keys(dbToUse);
        let itemToUse = keyList[Math.floor(Math.random() * keyList.length)];
        let chosenicon = _.get(dbToUse, itemToUse + ".icon");
        if (typeof chosenicon === "undefined" || chosenicon == "N/A") {
            do {
                let itemToUse = keyList[Math.floor(Math.random() * keyList.length)];
                chosenicon = _.get(dbToUse, itemToUse + ".icon");
            } while (typeof chosenicon === "undefined" || chosenicon == "N/A");
        }
        client.commands.get("fetchicon").execute(message, itemToUse, "Fetching Random");
	},
};