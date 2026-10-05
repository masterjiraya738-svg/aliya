module.exports = {
  config: {
    name: "eval",
    aliases: ["e"],
    version: "1.1.0",
    role: 2,
    author: "Mr.king",
    shortDescription: { en: "Execute raw JavaScript code" },
    category: "owner",
    guide: { en: "{pn} <javascript code>" }
  },

  onStart: async function ({ message, args, api, event, usersData, threadsData }) {
    const code = args.join(" ");
    if (!code) {
      return message.reply("⚙️ Cmd Name: Eval / JS Executor\n📌 Purpose: Executing raw JavaScript code directly in the bot environment.\n\n❌ Usage: `.eval <code>` (উদাহরণ: `.eval 2 + 2`)");
    }

    try {
      let evaled = await eval(code);
      if (typeof evaled !== "string") {
        evaled = require("util").inspect(evaled, { depth: 1 });
      }

      if (evaled.length > 3800) evaled = evaled.slice(0, 3800) + "\n...(truncated)";
      return message.reply(`⚡ JavaScript Executed Successfully\n📌 Type: Raw Code Execution\n\n✅ Result:\n\`\`\`js\n${evaled}\n\`\`\``);
    } catch (err) {
      return message.reply(`⚡ JavaScript Execution Failed\n📌 Type: Raw Code Execution\n\n❌ Error:\n\`\`\`js\n${err.message}\n\`\`\``);
    }
  }
};
  
