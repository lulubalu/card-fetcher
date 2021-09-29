module.exports = {
	name: "fetchfullbody",
	description: "Fetches a full body picture of the requested character (only works with characters)",
    options: [
		{
			name: "input",
			description: "Enter the name of the item you want to fetch. (Required)",
			type: "STRING",
            required: true,
		},
    ],
	execute(message, args, client) {
        if (message.type == "APPLICATION_COMMAND") {
            args = message.options.getString("input");
        }
		client.commands.get("fetchicon").execute(message, args, null, "Fetching");
	},
};