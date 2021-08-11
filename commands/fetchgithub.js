const pkgFile = require('../package.json');
const { MessageEmbed } = require("discord.js");
const { http, https } = require("follow-redirects");
const cheerio = require("cheerio");

module.exports = {
	name: "fetchgithub",
    description: "Gets Github links and dependency versions.",
	execute(message) {
        let responseURL;
		function fetchPage(url) {
            return new Promise(function (resolve, reject) {
                https.get(url, function (response) {
                    if (response.statusCode != 404) {
                        responseURL = response.responseUrl;
                        let data = "";
                        response.on("data", function (chunk) {
                            data += chunk;
                        });
                        response.on("end", function () {
                            resolve(data);
                        });
                    } else {
                        resolve(response.statusCode);
                    }
                }).on("error", function (e) {
                    reject(e);
                });
            })
        }

        fetchPage("https://github.com/Sei-Bellissima/card-fetcher/releases/latest").then(function(result) {
            const $ = cheerio.load(result);
            let notes = $(".markdown-body").html().replace("    ", "").replace("\n  ", "").replace("<p>", "")
                .replace(/<br>/g, "").replace(/<\/p>/g, "").replace(/<p>/g, "\n").replace(/<em>/g, "*")
                .replace(/<\/em>/g, "*");
            notes = $(notes).text();
            let image = $("[property='og:image']").attr("content");
            let timeStamp = $("relative-time").attr("datetime");
            let title = `Version ${pkgFile.version}`;
            let elementToCheck = $('[data-content="Issues"] + span.Counter');
            let issues;
            if (elementToCheck.length) {
                if (typeof elementToCheck.attr("hidden") !== "undefined" && elementToCheck.html() == "0") {
                    issues = "None!";
                } else {
                    issues = elementToCheck.html();
                }
            } else {
                issues = "Unable to retrieve";
            }
            let Dependencies = JSON.stringify(pkgFile.dependencies, null, " ").replace(/\r?\n|\r/g, "").replace(/{|}/g, "").slice(1);
            let desc = `Change notes of latest version:\n\`\`\`${notes}\`\`\`\nHomepage: ${pkgFile.homepage}\nIssue tracker: ${pkgFile.bugs.url}` +
                ` \`Current issues: ${issues}\`\nReleases: https://github.com/Sei-Bellissima/card-fetcher/releases \nLatest Release: ${responseURL}` +
                `\nDependencies:\n\`\`\`${Dependencies}\`\`\``;
            let gitEmbed = new MessageEmbed()
                .setTitle(title)
                .setColor(0xf1e05a)
                .setTimestamp(timeStamp)
                .setDescription(desc)
                .setImage(image)
                .setURL(pkgFile.homepage)
                .setFooter(pkgFile.homepage);
            
            
            if (message.type == "APPLICATION_COMMAND") {
                message.reply({ embeds: [ gitEmbed ] });
            } else {
                message.channel.send({ embeds: [ gitEmbed ] });
            }
        });
	},
};