module.exports = {
	config: {
		name: "npx",
		version: "1.0.0",
		author: "Mr.king",
		countDown: 3,
		role: 3,
		description: "Run a command with or without prefix.",
		category: "system",
		guide: {
			en: "{pn} [command] | {pn} -r [command]"
		}
	},

	onStart: async function ({ message, args, prefix }) {
		if (!args.length)
			return message.reply(
				`Usage:\n${prefix}npx slot\n${prefix}npx -r slot`
			);

		const requirePrefix = args[0] === "-r";

		if (requirePrefix)
			args.shift();

		const commandName = args.shift();

		if (!commandName)
			return message.reply("❌ Command name missing.");

		const command = global.GoatBot.commands.get(
			commandName.toLowerCase()
		);

		if (!command)
			return message.reply(`❌ Command "${commandName}" not found.`);

		const fakeArgs = args;

		if (!requirePrefix) {
			await command.onStart({
				message,
				args: fakeArgs,
				commandName: command.config.name,
				prefix: ""
			});
			return;
		}

		await command.onStart({
			message,
			args: fakeArgs,
			commandName: command.config.name,
			prefix
		});
	}
};
