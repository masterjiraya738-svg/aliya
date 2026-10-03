const { writeFileSync } = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
	config: {
		name: "whitelists",
		aliases: ["wl"],
		version: "1.6",
		author: "Arafat",
		countDown: 5,
		role: 1,
		description: {
			en: "Add, remove, edit whiteListIds role"
		},
		category: "admin",
		guide: {
			en: '   {pn} [add | -a] <uid | @tag>: Add whiteListIds role for user'
				+ '\n	  {pn} [remove | -r] <uid | @tag>: Remove whiteListIds role of user'
				+ '\n	  {pn} [list | -l]: List all whiteListIds'
				+ '\n	  {pn} clear: Remove all users from the whitelist'
				+ "\n   {pn} -m [on | off]: turn on/off the mode only whitelistIds can use bot"
				+ "\n {pn} -m noti [on | off]: turn on/off the notification when user is not whitelistIds use bot"
		}
	},

	langs: {
		en: {
			added: `╭✦✅ | 𝙰𝚍𝚍𝚎𝚍 %1 𝚞𝚜𝚎𝚛𝚜\n%2`,
			alreadyAdmin: `\n╭✦⚠️ | 𝙰𝚕𝚛𝚎𝚊𝚍𝚢 𝚊𝚍𝚍𝚎𝚍 %1 𝚞𝚜𝚎𝚛𝚜\n%2`,
			missingIdAdd: "⚠️ | 𝙿𝚕𝚎𝚊𝚜𝚎 𝚎𝚗𝚝𝚎𝚛 𝚄𝙸𝙳 𝚝𝚘 𝚊𝚍𝚍 𝚠𝚑𝚒𝚝𝚎𝙻𝚒𝚜刻 𝚛𝚘𝚕𝚎",
			removed: `╭✦✅ | 𝚁𝚎𝚖𝚘𝚟𝚎𝚍 %1 𝚞𝚜𝚎𝚛𝚜\n%2`,
			notAdmin: `╭✦⚠️ | 𝙳𝚒𝚍𝚗'𝚝 𝚊𝚍𝚍 %1 𝚞𝚜𝚎𝚛𝚜\n%2`,
			missingIdRemove: "⚠️ | 𝙿𝚕𝚎𝚊𝚜𝚎 𝚎𝚗𝚝𝚎𝚛 𝚄𝙸𝙳 𝚝𝚘 𝚛𝚎𝚖𝚘𝚟𝚎 𝚠𝚑𝚒𝚝𝚎𝙻𝚒𝚜𝚝 𝚛𝚘𝚕𝚎",
			listAdmin: `╭✦✨ | 𝙻𝚒𝚜𝚝 𝚘𝚏 𝚆𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝𝚎𝚍 𝚄𝚜𝚎𝚛𝚜\n%1\n╰───────────────────⧕`,
			cleared: "✅ | 𝙲𝚕𝚎𝚊𝚛𝚎𝚍 𝚊𝚕𝚕 𝚞𝚜𝚎𝚛𝚜 𝚏𝚛𝚘𝚖 𝚝𝚑𝚎 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝.",
			emptyList: "⚠️ | 𝚃𝚑𝚎 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝 𝚒𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝚎𝚖𝚙𝚝𝚢.",
			turnedOn: "✅ | 𝚃𝚞𝚛𝚗𝚎𝚍 𝚘按下 𝚝𝚑𝚎 𝚖𝚘𝚍𝚎 𝚘𝚗𝚕𝚢 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝𝙸𝚍𝚜 𝚌𝚊𝚗 𝚞𝚜𝚎 𝚋𝚘𝚝",
			turnedOff: "❎ | 𝚃𝚞𝚛𝚗𝚎𝚍 𝚘𝚏𝚏 𝚝𝚑𝚎 𝚖𝚘𝚍𝚎 𝚘𝚗𝚕𝚢 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝𝙸𝚍𝚜 𝚌𝚊𝚗 𝚞𝚜𝚎 𝚋𝚘𝚝",
			turnedOnNoti: "✅ | 𝚃𝚞𝚛𝚗𝚎𝚍 𝚘𝚗 𝚝𝚑𝚎 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 𝚠𝚑𝚎𝚗 𝚞𝚜𝚎𝚛 𝚒𝚜 𝚗𝚘𝚝 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝𝙸𝚍𝚜 𝚞𝚜𝚎 𝚋𝚘𝚝",
			turnedOffNoti: "❎ | 𝚃𝚞𝚛𝚗𝚎𝚍 𝚘𝚏𝚏 𝚝𝚑𝚎 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 𝚠𝚑𝚎𝚗 𝚞𝚜𝚎𝚛 𝚒𝚜 𝚗𝚘𝚝 𝚠𝚑𝚒𝚝𝚎𝚕𝚒𝚜𝚝𝙸𝚍𝚜 𝚞𝚜𝚎 𝚋𝚘𝚝"
		}
	},

	onStart: async function ({ message, args, usersData, event, getLang, api }) {
		const permission = ["61593801485340"];
		if (!permission.includes(event.senderID)) {
			return message.reply("⚠️ | Only Bot Owner can use this command.");
		}

		switch (args[0]) {
			case "add":
			case "-a":
			case "+": {
				let uids = [];
				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else if (args.length > 1)
					uids = args.slice(1).filter(arg => !isNaN(arg));

				if (uids.length == 0) return message.reply(getLang("missingIdAdd"));

				const notAdminIds = [];
				const authorIds = [];
				for (const uid of uids) {
					if (config.whiteListMode.whiteListIds.includes(uid))
						authorIds.push(uid);
					else {
						notAdminIds.push(uid);
						config.whiteListMode.whiteListIds.push(uid);
					}
				}

				const getNames = await Promise.all(uids.map(async uid => {
					const name = await usersData.getName(uid);
					return { uid, name };
				}));

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
				return message.reply(
					(notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.filter(u => notAdminIds.includes(u.uid)).map(({ uid, name }) => `├‣ 𝚄𝚂𝙴𝚁 𝙽𝙰𝙼𝙴: ${name}\n├‣ 𝚄𝚂𝙴𝚁 𝙸𝙳: ${uid}`).join("\n")) : "")
					+ (authorIds.length > 0 ? getLang("alreadyAdmin", authorIds.length, authorIds.map(uid => `├‣ 𝚄𝚂𝙴𝚁 𝙸𝙳: ${uid}`).join("\n")) : "")
				);
			}

			case "remove":
			case "rm":
			case "-r":
			case "-": {
				let uids = [];
				if (Object.keys(event.mentions).length > 0)
					uids = Object.keys(event.mentions);
				else if (event.messageReply)
					uids.push(event.messageReply.senderID);
				else if (args.length > 1)
					uids = args.slice(1).filter(arg => !isNaN(arg));

				if (uids.length == 0) return message.reply(getLang("missingIdRemove"));

				const notAdminIds = [];
				const authorIds = [];
				for (const uid of uids) {
					if (config.whiteListMode.whiteListIds.includes(uid)) {
						authorIds.push(uid);
						config.whiteListMode.whiteListIds.splice(config.whiteListMode.whiteListIds.indexOf(uid), 1);
					} else {
						notAdminIds.push(uid);
					}
				}

				const getNames = await Promise.all(authorIds.map(async uid => {
					const name = await usersData.getName(uid);
					return { uid, name };
				}));

				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
				return message.reply(
					(authorIds.length > 0 ? getLang("removed", authorIds.length, getNames.map(({ uid, name }) => `├‣ 𝚄𝚂𝙴𝚁 𝙽𝙰𝙼𝙴: ${name}\n├‣ 𝚄𝚂𝙴𝚁 𝙸𝙳: ${uid}`).join("\n")) : "")
					+ (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `├‣ 𝚄𝚂𝙴𝚁 𝙸𝙳: ${uid}`).join("\n")) : "")
				);
			}

			case "clear": {
				if (config.whiteListMode.whiteListIds.length == 0) {
					return message.reply(getLang("emptyList"));
				}
				config.whiteListMode.whiteListIds = [];
				writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
				return message.reply(getLang("cleared"));
			}

			case "list":
			case "-l": {
				if (config.whiteListMode.whiteListIds.length == 0) {
					return message.reply(getLang("emptyList"));
				}
				const getNames = await Promise.all(config.whiteListMode.whiteListIds.map(async uid => {
					const name = await usersData.getName(uid);
					return { uid, name };
				}));
				return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `├‣ 𝚄𝚂𝙴𝚁 𝙽𝙰𝙼𝙴: ${name}\n├‣ 𝚄𝚂𝙴𝚁 𝙸𝙳: ${uid}`).join("\n")));
			}

			case "m":
			case "mode":
			case "-m": {
				let isSetNoti = false;
				let value;
				let indexGetVal = 1;

				if (args[1] == "noti") {
					isSetNoti = true;
					indexGetVal = 2;
				}

				if (args[indexGetVal] == "on")
					value = true;
				else if (args[indexGetVal] == "off")
					value = false;

				if (isSetNoti) {
					config.hideNotiMessage.whiteListMode = !value;
					message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
				} else {
					config.whiteListMode.enable = value;
					message.reply(getLang(value ? "turnedOn" : "turnedOff"));
				}

				writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
				return;
			}

			default:
				return message.SyntaxError();
		}
	}
};
