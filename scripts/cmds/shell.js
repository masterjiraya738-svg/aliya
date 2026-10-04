const { exec } = require("child_process");

module.exports = {
  config: {
    name: "shell",
    aliases: ["sl],
    version: "1.0.0",
    role: 2, // শুধুমাত্র Bot Owner/Admin ব্যবহার করতে পারবে
    author: "Mr.king",
    shortDescription: {
      en: "Run terminal / shell commands"
    },
    longDescription: {
      en: "Execute terminal commands on the host server directly from messenger."
    },
    category: "owner",
    guide: {
      en: "{pn} <command>\nExample: {pn} ls\nExample: {pn} node -v"
    }
  },

  onStart: async function ({ message, args }) {
    const command = args.join(" ");

    if (!command) {
      return message.reply("❌ কোনো শেল কমান্ড ইনপুট দাওনি!\nউদাহরণ: `.shell ls` অথবা `.shell pm2 status`");
    }

    message.reply(`⚙ Executing: \`${command}\` ...`);

    exec(command, { cwd: process.cwd(), maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      let output = "";

      if (error) {
        output += `❌ Error:\n${error.message}\n\n`;
      }
      if (stderr) {
        output += `⚠ Stderr:\n${stderr}\n\n`;
      }
      if (stdout) {
        output += `✅ Stdout:\n${stdout}`;
      }

      if (!output.trim()) {
        output = "✅ Command executed successfully with no output.";
      }

      // মেসেঞ্জার মেসেজ ক্যারেক্টার লিমিট স্লাইস (최대 3800 chars)
      if (output.length > 3800) {
        output = output.slice(0, 3800) + "\n\n... (Output truncated)";
      }

      return message.reply(output);
    });
  }
};
