const allOnEvent = global.GoatBot.onEvent;

module.exports = {
	config: {
		name: "onEvent",
		version: "1.2",
		author: "NTKhang",
		description: "Loop to all event in global.GoatBot.onEvent and run when have new event",
		category: "events"
	},

	onStart: async ({ api, args, message, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName }) => {
		for (const item of allOnEvent) {
			if (typeof item === "string") continue;
			
			try {
				if (typeof item.onStart === "function") {
					await item.onStart({ 
						api, 
						args, 
						message, 
						event, 
						threadsData, 
						usersData, 
						dashBoardData, 
						globalData, 
						threadModel, 
						userModel, 
						dashBoardModel, 
						globalModel, 
						role, 
						commandName 
					});
				}
			} catch (err) {
				console.error(`[ ERROR ] Event ${item.config?.name || "Unknown"} failed:`, err);
			}
		}
	}
};
