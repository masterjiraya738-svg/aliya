module.exports = {
	config: {
		name: "npx",
		version: "1.0",
		author: "NTKhang",
		role: 2,
		category: "config",
		guide: {
			en: "{pn} <cmd_name> - Toggle prefix-less mode for a specific command\n{pn} all - Enable prefix-less mode for all commands\n{pn} off - Disable prefix-less mode"
		}
	},

	langs: {
		en: {
			turnedOff: "Turned off prefix-less mode.",
			turnedAll: "Prefix-less mode enabled for ALL commands.",
			addedCmd: "Prefix-less mode enabled for command: %1",
			removedCmd: "Prefix-less mode disabled for command: %1",
			notFound: "Command %1 not found."
		}
	},

	onStart: async function ({ args, message, globalData, getLang }) {
		const target = args[0]?.toLowerCase();

		if (!target) {
			return message.send(this.config.guide.en.replace(/\{pn\}/g, "npx"));
		}

		let npxData = await globalData.get("npx_settings", "data", { mode: "none", list: [] });

		if (target === "off") {
			npxData.mode = "none";
			npxData.list = [];
			await globalData.set("npx_settings", npxData, "data");
			return message.send(getLang("turnedOff"));
		}

		if (target === "all") {
			npxData.mode = "all";
			npxData.list = [];
			await globalData.set("npx_settings", npxData, "data");
			return message.send(getLang("turnedAll"));
		}

		const command = global.GoatBot.commands.get(target) || global.GoatBot.commands.get(global.GoatBot.aliases.get(target));
		if (!command) {
			return message.send(getLang("notFound", target));
		}

		const realCmdName = command.config.name;

		if (npxData.mode !== "custom") {
			npxData.mode = "custom";
			npxData.list = [];
		}

		if (npxData.list.includes(realCmdName)) {
			npxData.list = npxData.list.filter(item => item !== realCmdName);
			await globalData.set("npx_settings", npxData, "data");
			return message.send(getLang("removedCmd", realCmdName));
		} else {
			npxData.list.push(realCmdName);
			await globalData.set("npx_settings", npxData, "data");
			return message.send(getLang("addedCmd", realCmdName));
		}
	}
};
			
