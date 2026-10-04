const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "events",
    aliases: ["event"],
    version: "1.0.0",
    role: 2, // শুধুমাত্র Bot Owner/Admin
    author: "Mr.king",
    shortDescription: {
      en: "Manage and reload bot events"
    },
    longDescription: {
      en: "Load, reload, or list all event modules in GoatBot v2."
    },
    category: "owner",
    guide: {
      en: "{pn} list\n{pn} reload <event_name>\n{pn} reloadall"
    }
  },

  onStart: async function ({ message, args, api }) {
    const action = args[0]?.toLowerCase();

    // ========= LIST EVENTS =========
    if (!action || action === "list" || action === "ls") {
      const eventsFolder = path.join(process.cwd(), "scripts", "events");

      if (!fs.existsSync(eventsFolder)) {
        return message.reply("❌ `scripts/events` ফোল্ডারটি পাওয়া যায়নি!");
      }

      const files = fs.readdirSync(eventsFolder).filter(file => file.endsWith(".js"));

      if (files.length === 0) {
        return message.reply("📂 কোনো Event Module পাওয়া যায়নি।");
      }

      let msg = `⚡ **Total Events Loaded:** ${files.length}\n━━━━━━━━━━━━━━━━━━\n`;
      files.forEach((file, index) => {
        msg += `${index + 1}. 📄 ${file}\n`;
      });

      return message.reply(msg);
    }

    // ========= RELOAD A SPECIFIC EVENT =========
    if (action === "reload" || action === "r") {
      const eventName = args[1];

      if (!eventName) {
        return message.reply("❌ কোনো event-এর নাম দাওনি!\nউদাহরণ: `.events reload join`");
      }

      const fileName = eventName.endsWith(".js") ? eventName : `${eventName}.js`;
      const eventPath = path.join(process.cwd(), "scripts", "events", fileName);

      if (!fs.existsSync(eventPath)) {
        return message.reply(`❌ \`${fileName}\` নামের কোনো Event ফাইলে পাওয়া যায়নি!`);
      }

      try {
        // Clear node require cache
        delete require.cache[require.resolve(eventPath)];
        
        // Dynamic re-require
        const newEvent = require(eventPath);

        if (global.GoatBot && global.GoatBot.events) {
          global.GoatBot.events.set(newEvent.config.name, newEvent);
        }

        return message.reply(`✅ Event \`${newEvent.config.name || fileName}\` সফলভাবে রিলোড করা হয়েছে!`);
      } catch (err) {
        return message.reply(`❌ Event রিলোড করতে সমস্যা হয়েছে:\n${err.message}`);
      }
    }

    // ========= RELOAD ALL EVENTS =========
    if (action === "reloadall" || action === "ra") {
      const eventsFolder = path.join(process.cwd(), "scripts", "events");

      try {
        const files = fs.readdirSync(eventsFolder).filter(file => file.endsWith(".js"));
        let count = 0;
        let errCount = 0;

        for (const file of files) {
          const filePath = path.join(eventsFolder, file);
          try {
            delete require.cache[require.resolve(filePath)];
            const eventModule = require(filePath);

            if (global.GoatBot && global.GoatBot.events && eventModule.config) {
              global.GoatBot.events.set(eventModule.config.name, eventModule);
            }
            count++;
          } catch (e) {
            errCount++;
          }
        }

        return message.reply(`✅ মোট **${count}** টি Event সফলভাবে রিলোড হয়েছে!${errCount > 0 ? `\n⚠ ${errCount} টি ফাইল লোড হতে ব্যর্থ হয়েছে।` : ""}`);
      } catch (error) {
        return message.reply(`❌ Events রিলোড করতে ব্যর্থ হয়েছে: ${error.message}`);
      }
    }

    return message.reply("❌ ভুল কমান্ড! সঠিক ব্যবহার:\n• `.events list`\n• `.events reload <name>`\n• `.events reloadall`");
  }
};
