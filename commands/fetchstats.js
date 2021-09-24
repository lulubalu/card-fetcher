const Discord = require("discord.js");
const { MessageAttachment } = require("discord.js");
const cardDatabase = require("../databases/cards.json");
const graftDatabase = require("../databases/grafts.json");
const bobaDatabase = require("../databases/boonsBanes.json");
const mutatorsPerksDatabase = require("../databases/mutatorsPerks.json");
const peopleDatabase = require("../databases/people.json")
const coinDatabase = require("../databases/coins.json");
const specialDatabase = require("../databases/specialCases.json");
const pkgFile = require('../package.json');
const _ = require("lodash");

//total number of everything
let statsTotal = Object.keys(cardDatabase).length + Object.keys(graftDatabase).length
    + Object.keys(bobaDatabase).length + Object.keys(mutatorsPerksDatabase).length
    + Object.keys(peopleDatabase).length + Object.keys(coinDatabase).length
    + Object.keys(specialDatabase).length;

//icons
let statsIconsCards = _.map(cardDatabase, "icon");
statsIconsCards = statsIconsCards.filter(function (x) {
    return x !== undefined;
});
statsIconsCards = _.uniq(statsIconsCards).length;

let statsIconsGrafts = _.map(graftDatabase, "icon");
statsIconsGrafts = statsIconsGrafts.filter(function (x) {
    return x !== undefined;
});
statsIconsGrafts = _.uniq(statsIconsGrafts).length;

let statsIconsBobas = _.map(bobaDatabase, "icon");
statsIconsBobas = statsIconsBobas.filter(function (x) {
    return x !== undefined;
});
statsIconsBobas = statsIconsBobas.filter(function (x) {
    return x != "N/A";
});
statsIconsBobas = _.uniq(statsIconsBobas).length;

let statsIconsMutatorsPerks = _.map(mutatorsPerksDatabase, "icon");
statsIconsMutatorsPerks = statsIconsMutatorsPerks.filter(function (x) {
    return x !== undefined;
});
statsIconsMutatorsPerks = statsIconsMutatorsPerks.filter(function (x) {
    return x !== "N/A";
});
statsIconsMutatorsPerks = _.uniq(statsIconsMutatorsPerks).length;

let statsIconsPeople = _.map(peopleDatabase, "icon");
statsIconsPeople = statsIconsPeople.filter(function (x) {
    return x !== undefined;
});
statsIconsPeople = statsIconsPeople.filter(function (x) {
    return x !== "N/A";
});
statsIconsPeople = _.uniq(statsIconsPeople).length;

//coin icons are all valid and unique, no need for filtering
let statsIconsCoins = Object.keys(coinDatabase).length;

let statsIcons = statsIconsCards + statsIconsGrafts + statsIconsBobas + statsIconsMutatorsPerks + statsIconsPeople + statsIconsCoins;

//defined items with names
let statsCards = _.map(cardDatabase, "name");
statsCards = statsCards.filter(function (x) {
    return x !== undefined;
});

let statsGrafts = _.map(graftDatabase, "name");
statsGrafts = statsGrafts.filter(function (x) {
    return x !== undefined;
});

let statsBobas = _.map(bobaDatabase, "name");
statsBobas = statsBobas.filter(function (x) {
    return x !== undefined;
});

let statsMutatorsPerks = _.map(mutatorsPerksDatabase, "name");
statsMutatorsPerks = statsMutatorsPerks.filter(function (x) {
    return x !== undefined;
});

let statsPeople = _.map(peopleDatabase, "name");
statsPeople = statsPeople.filter(function (x) {
    return x !== undefined;
});



//coin names are all valid, no need for filtering
let statsCoins = Object.keys(coinDatabase).length;

//unused icons
let unusedCardIcons = _.map(cardDatabase, "name").filter(function (x) {
    return x === undefined;
}).length;

let unusedGraftIcons = _.map(graftDatabase, "name").filter(function (x) {
    return x === undefined;
}).length;

let unusedMutatorPerkIcons = _.map(mutatorsPerksDatabase, "name").filter(function (x) {
    return x === undefined;
}).length;

let unusedIcons = unusedCardIcons + unusedGraftIcons + unusedMutatorPerkIcons;

let statsUsedIcons = statsIcons - unusedIcons;

//Misc Stats
const decks = _.countBy(cardDatabase, "deck");
const cardTypes = _.countBy(cardDatabase, "type");
const cardRarities = _.countBy(cardDatabase, "rarity");
const cardCharacters = _.countBy(cardDatabase, "character");

const graftTypes = _.countBy(graftDatabase, "type");
const graftRarities = _.countBy(graftDatabase, "rarity");
const graftCharacters = _.countBy(graftDatabase, "character");

const bobaTypes = _.countBy(bobaDatabase, "type");
const mutatorPerkTypes = _.countBy(mutatorsPerksDatabase, "type");

const specialCases = Object.keys(specialDatabase).length;

let statsDesc = "Total no. of keys in databases: " + statsTotal +
    "\nTotal Icons (Includes Unused Icons): " + statsIcons +
    "\nTotal Used Icons: " + statsUsedIcons +
    "\nTotal Unused Icons: " + unusedIcons +
    "\n\nTotal Cards: " + statsCards.length +
    "\nCard Icons: " + statsIconsCards +
    "\nBattle Cards: " + decks.Battle +
    "\nNegotiation Cards: " + decks.Negotiation +
    "\nAttack Cards: " + cardTypes.Attack +
    "\nManeuver Cards: " + cardTypes.Maneuver +
    "\nDiplomacy Cards: " + cardTypes.Diplomacy +
    "\nHostility Cards: " + cardTypes.Hostility +
    "\nManipulate Cards: " + cardTypes.Manipulate +
    "\nParasite Cards: " + cardTypes.Parasite +
    "\nScore Cards: " + cardTypes.Score +
    "\nItem Cards: " + cardTypes.Item +
    "\nStatus Cards: " + cardTypes.Status +
    "\nFlourish Cards: " + cardTypes.Flourish +
    "\nBasic Cards: " + cardRarities.Basic +
    "\nCommon Cards: " + cardRarities.Common +
    "\nUncommon Cards: " + cardRarities.Uncommon +
    "\nRare Cards: " + cardRarities.Rare +
    "\nUnique Cards: " + cardRarities.Unique +
    "\nSal Cards: " + cardCharacters.Sal +
    "\nRook Cards: " + cardCharacters.Rook +
    "\nSmith Cards: " + cardCharacters.Smith +
    "\nGeneral Cards: " + cardCharacters.General +
    "\nUnused Card Icons: " + unusedCardIcons +
    "\n\nTotal Grafts: " + statsGrafts.length +
    "\nGraft Icons: " + statsIconsGrafts +
    "\nBattle Grafts: " + graftTypes.Battle +
    "\nNegotiation Grafts: " + graftTypes.Negotiation +
    "\nGeneral Grafts: " + graftCharacters.General +
    "\nSal Grafts: " + graftCharacters.Sal +
    "\nRook Grafts: " + graftCharacters.Rook +
    "\nSmith Grafts: " + graftCharacters.Smith +
    "\nCommon Grafts: " + graftRarities.Common +
    "\nUncommon Grafts: " + graftRarities.Uncommon +
    "\nRare Grafts: " + graftRarities.Rare +
    "\nUnique Grafts: " + graftRarities.Unique +
    "\nBoss Grafts: " + graftRarities.Boss +
    "\nCosmic Grafts: " + graftRarities.Cosmic +
    "\nUnused Graft Icons: " + unusedGraftIcons +
    "\n\nTotal Boons and Banes: " + statsBobas.length +
    "\nBoons and Banes Icons: " + statsIconsBobas +
    "\nBoons: " + bobaTypes.Boon +
    "\nBanes: " + bobaTypes.Bane +
    "\n\nTotal Mutators and Perks: " + statsMutatorsPerks.length +
    "\nMutators and Perks Icons: " + statsIconsMutatorsPerks +
    "\nMutators: " + mutatorPerkTypes.Mutator +
    "\nPerks: " + mutatorPerkTypes.Perk +
    "\nUnused Mutators and Perks Icons: " + unusedMutatorPerkIcons +
    "\n\nPeople: " + statsPeople.length +
    "\nPeople Icons: " + statsIconsPeople +
    "\n\nCoins: " + statsCoins +
    "\nCoin Icons: " + statsIconsCoins +
    "\n\nSpecial Cases: " + specialCases;

async function fetchStats(currentPing, currentLatency, message, client) {
    let descToSend = "**Current Version:** " + pkgFile.version +
        "\n**Ping:** " + currentPing +
        "ms.\n**API Latency:** " + currentLatency +
        "ms.\n**No. of servers I'm in:** " +
        client.guilds.cache.size;
    
    const attachment = new MessageAttachment(Buffer.from(statsDesc), "stats.txt");
    if (message.type == "APPLICATION_COMMAND") {
        await message.reply({ content: descToSend, files: [ attachment ] });
    } else {
        message.channel.send({ content: descToSend, files: [ attachment ] });
    }
}

module.exports = {
	name: "fetchstats",
    description: "Gets database stats, ping, and bot stats.",
	execute(message, args, client) {
		let ping = Date.now() - message.createdTimestamp;
        let APIPing = Math.round(client.ws.ping);
        fetchStats(ping, APIPing, message, client);
	},
};