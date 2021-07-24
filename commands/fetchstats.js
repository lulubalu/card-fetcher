const Discord = require("discord.js");
const { MessageAttachment } = require("discord.js");
const cardDatabase = require("../databases/cards.json");
const graftDatabase = require("../databases/grafts.json");
const bobaDatabase = require("../databases/boonsBanes.json");
const pkgFile = require('../package.json');
const _ = require("lodash");

//total number of everything
let statsTotal = Object.keys(cardDatabase).length + Object.keys(graftDatabase).length + Object.keys(bobaDatabase).length;

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
statsIconsBobas = _.uniq(statsIconsBobas).length;

let statsIcons = statsIconsCards + statsIconsGrafts + statsIconsBobas;

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

//unused icons
let unusedCardIcons = _.map(cardDatabase, "name").filter(function (x) {
    return x === undefined;
}).length;

let unusedGraftIcons = _.map(graftDatabase, "name").filter(function (x) {
    return x === undefined;
}).length;

//Misc Stats
const decks = _.countBy(cardDatabase, "deck");
const cardTypes = _.countBy(cardDatabase, "type");
const cardRarities = _.countBy(cardDatabase, "rarity");
const cardCharacters = _.countBy(cardDatabase, "character");

const graftTypes = _.countBy(graftDatabase, "type");
const graftRarities = _.countBy(graftDatabase, "rarity");
const graftCharacters = _.countBy(graftDatabase, "character");

const bobaTypes = _.countBy(bobaDatabase, "type");

let statsDesc = "Total no. of keys in databases: " + statsTotal +
    "\nTotal Icons: " + statsIcons +
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
    "\nBanes: " + bobaTypes.Bane;

function fetchStats(currentPing, currentLatency, message, client) {
    let descToSend = "**Current Version:** " + pkgFile.version +
        "\n**Ping:** " + currentPing +
        "ms.\n**API Latency:** " + currentLatency +
        "ms.\n**No. of servers I'm in:** " +
        client.guilds.cache.size;
    
    const attachment = new MessageAttachment(Buffer.from(statsDesc), "stats.txt");
    message.channel.send(descToSend, attachment);

}

module.exports = {
	name: "fetchstats",
	execute(message, args, client) {
		let ping = Date.now() - message.createdTimestamp;
        let APIPing = Math.round(client.ws.ping);
        fetchStats(ping, APIPing, message, client);
	},
};