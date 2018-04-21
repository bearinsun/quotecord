const { Client, RichEmbed } = require("discord.js"),
	client = new Client();

client.on("ready", () => {
	console.log(
		`Quotecord is currently running and is logged in as ${
			client.user.username
		}.`
	);
	console.log("To exit Quotecord, press any key...");

	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.on("data", process.exit.bind(process, 0));
});

client.on("message", message => {
	if (message.client === client) {
		const messageContent = message.content,
			channel = message.channel;

		const tags = messageContent.match(/{quote:\d+}/g);
		if (!tags) return;

		channel.fetchMessages().then(messages => {
			if (message.deletable) message.delete();

			messageContent.split(/{quote:\d+}/).forEach((beforeTag, index) => {
				const tag = tags[index];

				if (tag) {
					const quote = messages.get(
						tags[index].split(":")[1].replace("}", "")
					);

					if (!quote) return;

					channel.send(
						beforeTag,
						new RichEmbed({
							author: {
								name: quote.member
									? quote.member.nickname || quote.author.username
									: quote.author.username,
								icon_url: quote.author.displayAvatarURL
							},
							description: quote.content,
							footer: {
								text: quote.createdAt.toLocaleDateString("en-US", {
									hour: "numeric",
									minute: "numeric",
									second: "numeric"
								})
							}
						})
					);

					return;
				}

				if (beforeTag) channel.send(beforeTag);
			});
		});
	}
});

const fs = require("fs"),
	path = require("path");

fs.writeFile(
	"config.json",
	JSON.stringify({ token: "" }, null, "\t"),
	{ flag: "wx" },
	error => {
		if (error && error.code === "EEXIST") {
			fs.readFile("config.json", "utf8", (error, data) => {
				const config = JSON.parse(data);
				if (config.token) {
					client.login(config.token);
					return;
				}

				console.log(
					"Cannot login: config.json exists but no client token was specified."
				);
				console.log("Press any key to exit...");

				process.stdin.setRawMode(true);
				process.stdin.resume();
				process.stdin.on("data", process.exit.bind(process, 0));
			});

			return;
		}

		console.log(
			"Quotecord has successfully created the config.json file. Please add your client token to it."
		);
		console.log("Press any key to exit...");

		process.stdin.setRawMode(true);
		process.stdin.resume();
		process.stdin.on("data", process.exit.bind(process, 0));
	}
);
