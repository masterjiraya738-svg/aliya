module.exports = {
	config: {
		name: "makeadmin",
		aliases: ["ma"],
		version: "1.0.0",
		author: "NTKhang / Developer",
		role: 2, // Role 2 (VIP/Bot Admin) wenno isukat iti 3/4 nu kayatmo a para kadagiti Bot Admin laeng
		category: "admin",
		guide: {
			en: "{pn} - Auto promote bot admin/author to group admin\n{pn} @mention - Promote mentioned user to group admin"
		}
	},

	langs: {
		en: {
			notGroup: "⚠️ Doytoy a command ket ma-use laeng iti uneg ti group chat.",
			botNotAdmin: "❌ Masapul nga Admin ti Bot iti daitoy a group tapno makapangpabalat iti admin.",
			alreadyAdmin: "⚠️ Admin iti daitoy a group daytoy a taeng/user.",
			success: "✅ Naipagbalinen nga Admin ti group: %1",
			failed: "❌ Awan pakabaelan a mangpabalat iti admin: %1"
		}
	},

	onStart: async function ({ api, event, message, getLang }) {
		const { threadID, senderID, mentions, isGroup } = event;

		if (!isGroup) {
			return message.reply(getLang("notGroup"));
		}

		try {
			// Subliyen ti thread info tapno maammoan dagiti admin
			const threadInfo = await api.getThreadInfo(threadID);
			const botID = api.getCurrentUserID();
			const adminIDs = (threadInfo.adminIDs || []).map(item => item.id);

			// Tsekroen nu admin ti bot
			if (!adminIDs.includes(botID)) {
				return message.reply(getLang("botNotAdmin"));
			}

			// Nu adda ti na-mention a user, isuda ti pagbalinen nga admin
			// Nu awan, ti mismo a nag-command (senderID) ti pagbalinen nga admin
			let targetIDs = [];
			if (mentions && Object.keys(mentions).length > 0) {
				targetIDs = Object.keys(mentions);
			} else {
				targetIDs = [senderID];
			}

			for (const targetID of targetIDs) {
				if (adminIDs.includes(targetID)) {
					await message.reply(getLang("alreadyAdmin"));
					continue;
				}

				api.changeAdminStatus(threadID, targetID, true, (err) => {
					if (err) {
						return message.reply(getLang("failed", err.errorSummary || err.message || JSON.stringify(err)));
					}
					return message.reply(getLang("success", `@${targetID}`), () => {}, [targetID]);
				});
			}
		} catch (error) {
			console.error("[ MAKEADMIN ERROR ]", error);
			return message.reply(`❌ Adda biddut a napasamak: ${error.message || error}`);
		}
	}
};
