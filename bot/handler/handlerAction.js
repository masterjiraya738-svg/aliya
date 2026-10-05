const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
	const handlerEvents = require(process.env.NODE_ENV === 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

	return async function (event) {
		if (
			global.GoatBot.config.antiInbox === true &&
			(event.senderID === event.threadID || event.userID === event.senderID || event.isGroup === false) &&
			(event.senderID || event.userID || event.isGroup === false)
		) {
			return;
		}

		const message = createFuncMessage(api, event);

		try {
			await handlerCheckDB(usersData, threadsData, event);
		} catch (err) {
			console.error("[ CHECK_DB ERROR ]", err);
		}

		const handlerChat = await handlerEvents(event, message);
		if (!handlerChat) return;

		if (global.GoatBot.config?.approval) {
			const approvedtid = await globalData.get("approved", "data", {});
			if (!approvedtid.approved) {
				approvedtid.approved = [];
				await globalData.set("approved", approvedtid, "data");
			}
			if (!approvedtid.approved.includes(event.threadID)) return;
		}

		const {
			onAnyEvent, onFirstChat, onStart, onChat,
			onReply, onEvent, handlerEvent, onReaction,
			typ, presence, read_receipt
		} = handlerChat;

		if (typeof onAnyEvent === "function") {
			try {
				await onAnyEvent();
			} catch (err) {
				console.error("[ ONANYEVENT ERROR ]", err);
			}
		}

		switch (event.type) {
			case "message":
			case "message_reply":
			case "message_unsend":
				if (typeof onFirstChat === "function") await onFirstChat();
				if (typeof onChat === "function") await onChat();
				if (typeof onStart === "function") await onStart();
				if (typeof onReply === "function") await onReply();
				break;

			case "event":
				if (typeof handlerEvent === "function") await handlerEvent();
				if (typeof onEvent === "function") await onEvent();
				break;

			case "message_reaction":
				if (typeof onReaction === "function") await onReaction();

				const { delete: del = [], kick = [] } = global.GoatBot.config?.reactBy || {};

				if (del.includes(event.reaction)) {
					if (event.senderID === api.getCurrentUserID()) {
						if (global.GoatBot.config?.vipuser?.includes(event.userID)) {
							api.unsendMessage(event.messageID);
						}
					}
				}

				if (kick.includes(event.reaction)) {
					if (global.GoatBot.config?.vipuser?.includes(event.userID)) {
						api.removeUserFromGroup(event.senderID, event.threadID, (err) => { 
							if (err) console.error("[ KICK ERROR ]", err); 
						});
					}
				}
				break;

			case "typ":
				if (typeof typ === "function") await typ();
				break;

			case "presence":
				if (typeof presence === "function") await presence();
				break;

			case "read_receipt":
				if (typeof read_receipt === "function") await read_receipt();
				break;

			default:
				break;
		}
	};
};
					
