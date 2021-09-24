const _ = require("lodash");
const cardDatabase = require("../databases/cards.json");
const graftDatabase = require("../databases/grafts.json");
const bobaDatabase = require("../databases/boonsBanes.json");
const mutatorsPerksDatabase = require("../databases/mutatorsPerks.json");
const peopleDatabase = require("../databases/people.json")
const coinDatabase = require("../databases/coins.json");

const databases = [ cardDatabase, graftDatabase, bobaDatabase, mutatorsPerksDatabase, peopleDatabase, coinDatabase ];

module.exports = {
	name: "fetchrandom",
    description: "Fetches a random item.",
	execute(message, args, client) {
		let dbToUse = databases[Math.floor(Math.random() * databases.length)];
        let keyList = Object.keys(dbToUse);
        let itemToUse = keyList[Math.floor(Math.random() * keyList.length)];
        if (typeof _.get(dbToUse, itemToUse + ".name") === "undefined") {
            do {
                itemToUse = keyList[Math.floor(Math.random() * keyList.length)];
            } while (typeof _.get(dbToUse, itemToUse + ".name") === "undefined");
        }
        client.commands.get("fetch").execute(message, itemToUse, "Fetching Random");
	},
};