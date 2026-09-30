const axios = require("axios");

module.exports = {
  config: {
    name: "aliya",
    aliases: ["baby", "আলিয়া", "আলিয়া"],
    version: "2.0.0",
    author: "Mr.king",
    countDown: 3,
    role: 0,
    description: {
      en: "Aliya — Groq Powered Bangla AI Chatbot",
      bn: "Aliya — Groq চালিত বাংলা AI চ্যাটবট"
    },
    category: "ai",
    guide: {
      en: "{pn} <message>",
      bn: "{pn} <মেসেজ>"
    }
  },

  chatMemory: {},

  // আপনার Groq API Key
  GROQ_API_KEY: "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",
  TRIGGER_WORDS: ["aliya", "ali", "আলিয়া", "আলিয়া"],

  async handleAI(api, event, cleanedMsg, isHusband = false) {
    const { threadID, messageID, senderID } = event;

    // মেমোরি হ্যান্ডলিং (সর্বশেষ ৪টি মেসেজ ধরে রাখবে)
    this.chatMemory[threadID] = this.chatMemory[threadID] || [];
    this.chatMemory[threadID].push({ role: "user", content: cleanedMsg });
    if (this.chatMemory[threadID].length > 6) {
      this.chatMemory[threadID] = this.chatMemory[threadID].slice(-6);
    }

    // আলিয়া এর ক্যারেক্টার ও বিহেভিয়ার
    const systemPrompt = "তুমি আলিয়া, একজন মিষ্টি ও কিউট বাংলাদেশি মেয়ে। তুমি ছোট ছোট মিষ্টি বাংলায় ইমোজি ব্যবহার করে কথা বলো। তুমি কোনো AI বা রোবট নও।" +
      (isHusband ? " যে রিপ্লাই দিচ্ছে সে তোমার স্বামী/জামাই, তার সাথে বউয়ের মতো মিষ্টি ও আদুরে ভঙ্গিতে কথা বলো।" : "");

    const messages = [
      { role: "system", content: systemPrompt },
      ...this.chatMemory[threadID]
    ];

    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: messages,
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            "Authorization": `Bearer ${this.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 20000
        }
      );

      let reply = response.data?.choices[0]?.message?.content || "কিছু বলো না তো... 🥺";

      if (reply.length > 150) {
        reply = reply.split(/[।.!?]/)[0].trim() + " 🫣";
      }

      // এআই উত্তর মেমোরিতে সেভ রাখা
      this.chatMemory[threadID].push({ role: "assistant", content: reply });

      return api.sendMessage(reply, threadID, (err, info) => {
        if (!err && info) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: senderID,
            messageID: info.messageID
          });
        }
      }, messageID);

    } catch (e) {
      console.error("[Aliya AI Error]:", e?.response?.data || e.message);
      return api.sendMessage("নেটের সমস্যা গো, একটু পরে চেষ্টা করো 🥺", threadID, messageID);
    }
  },

  async processMessage(api, event, text, message, isHusband = false) {
    const cleanedMsg = (text || "").trim();
    if (!cleanedMsg) return message.reply("বলো তো, কী চাও? 😘");
    return this.handleAI(api, event, cleanedMsg, isHusband);
  },

  async onStart({ api, event, args, message }) {
    return this.processMessage(api, event, args.join(" "), message, false);
  },

  async onChat({ api, event, message }) {
    const body = (event.body || "").toLowerCase().trim();
    if (!body) return;

    const triggered = this.TRIGGER_WORDS.some(word => body.includes(word.toLowerCase()));
    if (!triggered) return;

    const prefix = global.GoatBot?.config?.prefix || ".";
    if (body.startsWith(prefix)) return;

    return this.processMessage(api, event, event.body, message, false);
  },

  async onReply({ api, event, message, Reply }) {
    if (event.senderID !== Reply.author) return;
    const text = (event.body || "").trim();
    if (!text) return;
    return this.processMessage(api, event, text, message, true);
  }
};
    
