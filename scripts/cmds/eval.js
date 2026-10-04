module.exports = {
  config: {
    name: "eval",
    aliases: ["e"],
    version: "1.0.0",
    role: 2,
    author: "Mr.king",
    shortDescription: { en: "Execute raw JavaScript code" },
    category: "owner",
    guide: { en: "{pn} <javascript code>" }
  },

  onStart: async function ({ message, args, api, event, usersData, threadsData }) {
    const code = args.join(" ");
    if (!code) return message.reply("❌ কোনো JavaScript কোড দাওনি!");

    try {
      let evaled = await eval(code);
      if (typeof evaled !== "string") {
        evaled = require("util").inspect(evaled, { depth: 1 });
      }

      if (evaled.length > 3800) evaled = evaled.slice(0, 3800) + "\n...(truncated)";
      return message.reply(`✅ **Result:**\n\`\`\`js\n${evaled}\n\`\`\``);
    } catch (err) {
      return message.reply(`❌ **Error:**\n\`\`\`js\n${err.message}\n\`\`\``);
    }
  }
};
