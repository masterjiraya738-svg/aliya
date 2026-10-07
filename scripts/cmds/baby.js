const axios = require("axios");

const REQUIRED_AUTHOR = "Roni";

const roniBotTriggers = [
  "baby", "bby", "babu", "bbu", "jan", "bot", "জান", "জানু", "বেবি", "wifey", "aliya", "king", "mrking", "roni"
];

const fallbackMessages = [
  "কথা কম কও, মুখে মাস্ক পইরা ঘোড়ো 😷🔥",
  "মাথাডা একদম আউলায়া দিলা তো ভাই 😵‍💫💭",
  "এমবি নাই ভাই, এমবি কিনে দে তারপর কথা কমু 📱💸",
  "পড়ালেখা বাদ দিয়া বটের লগে আলু ছুলতে আইছো? 🥔📚",
  "এক চ্যাপা মাইরা একবারে উগান্ডা পাঠায়া দিমু ✈️🐒",
  "চা খাইবা? না খাইলে ভাগো তো এখান থেকে ☕🧹",
  "তর কথা শুইন্যা আমার ফ্রিজের পানিও গরম হয়া গেছে 🧊🔥",
  "আমারে কি গুগল পাইছ নাকি? সব প্রশ্নের উত্তর পাইবা 🤖❌",
  "হুদাই চিল্লাইও না, একটু পপকন খাইয়া ঘুম দাও 🍿😴",
  "আরে ভাই থামো, এক্টু দম নিতে দাও আমারে 😮‍💨✋",
  "বিকাশে ৫০০ টাকা পাঠাও, তারপর সুন্দর উত্তর দিমু 🤑💳",
  "তোমার কথা শুইন্যা আমার ব্যাটারি ১০% কম্যা গেল 🔋🪫",
  "থামো তো ভাই! মাথায় হাত দিয়া একটু ভাবতে দাও 🤯🤔",
  "অতিরিক্ত ঢং স্বাস্থ্যের জন্য ক্ষতিকর baby 🍼😏"
];

const baseApiUrl = "https://baby-one-zeta.vercel.app";

const makeBold = (text) => {
  if (!text) return "";
  const fonts = {
    a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺",
    n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
    A: "𝗔", B: "𝗕", C: "Ｃ", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠",
    N: "𝗡", O: "𝗢", P: "𝗣", Q: "Q", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝘫", Y: "𝗬", Z: "𝗭",
    "0": "𝟬", "1": "𝟭", "2": "𝟮", "3": "𝟯", "4": "𝟰", "5": "𝟱", "6": "𝟲", "7": "𝟳", "8": "𝟴", "9": "𝟵"
  };
  return text.split("").map(char => fonts[char] || char).join("");
};

const handleMediaCheck = (attachments) => {
  if (attachments && attachments.length > 0) {
    const type = attachments[0].type;
    const replies = {
      video: ["Mb nai bby pore dio", "ajaira sop video😒"],
      audio: ["Sent 100000000tk to bkash then I will listen"],
      photo: ["iss amk picture diye potanor chesta 🌚😘"]
    };
    if (replies[type]) {
      const list = replies[type];
      return list[Math.floor(Math.random() * list.length)];
    }
  }
  return null;
};

const fetchApiResponse = async (text) => {
  try {
    const res = await axios.post(`${baseApiUrl}/api/aliya`, { text: text });
    if (res.data && res.data.message) {
      return res.data.message;
    }
  } catch {}
  return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
};

const getDatabaseStats = async () => {
  try {
    const res = await axios.get(`${baseApiUrl}/api/jan/stats`);
    if (res.data && res.data.success) {
      return `🐤 | Total Triggers = ${res.data.totalTeach}\n♻️ | Total Responses = ${res.data.totalResponses}\n💾 | Database Size = ${res.data.dataSize}\n👑 | Author = ${res.data.author}`;
    }
  } catch {}
  return `⚠️ Database connection error!`;
};

module.exports.config = {
   name: "baby", 
   aliases: ["aliya", "bby", "bbu", "jan", "janu", "wifey", "bot"],
   version: "24.0",
   author: "Roni",
   role: 0,
   category: "chat",
   guide: {
     en: "{pn} [message]"
   }
};

const isAuthorValid = () => {
  return module.exports.config.author === REQUIRED_AUTHOR;
};

// Main Response Handler (Prevents Duplicate Messages)
const processBotReply = async ({ api, event, userText }) => {
  const fullText = userText ? userText.toLowerCase().trim() : "";

  if (fullText === "list" || fullText === "datacheck" || fullText === "baby list" || fullText === "bby list") {
    const stats = await getDatabaseStats();
    return api.sendMessage(makeBold(stats), event.threadID, event.messageID);
  }

  const mediaReply = handleMediaCheck(event.attachments);
  if (mediaReply) {
    return api.sendMessage(makeBold(mediaReply), event.threadID, event.messageID);
  }

  if (!userText || userText.trim() === "") {
    const ranPrompt = [
      "babu khuda lagse🥺",
      "Bolo কি বলবা? 🤭🤏",
      "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
      "আসসালামু আলাইকুম",
      "কেমন আছো_🥹",
      "আমি Aliya-র বট, বলো কি সেবা করতে পারি? 😎"
    ];
    const chosenText = ranPrompt[Math.floor(Math.random() * ranPrompt.length)];
    return api.sendMessage(makeBold(chosenText), event.threadID, event.messageID);
  }

  const botResponse = await fetchApiResponse(userText);
  return api.sendMessage(makeBold(botResponse), event.threadID, event.messageID);
};

module.exports.onStart = async ({ api, event, args }) => {
  if (!isAuthorValid()) {
    return api.sendMessage("❌ Command corrupted! Author name modified.", event.threadID, event.messageID);
  }
  if (event.senderID == api.getCurrentUserID()) return;

  const userMsg = args ? args.join(" ") : "";
  return await processBotReply({ api, event, userText: userMsg });
};

module.exports.onReply = async ({ api, event }) => {
  if (!isAuthorValid()) return;
  if (event.senderID == api.getCurrentUserID()) return;

  const userMsg = event.body || "";
  return await processBotReply({ api, event, userText: userMsg });
};

module.exports.onChat = async ({ api, event }) => {
  if (!isAuthorValid()) return;
  if (event.senderID == api.getCurrentUserID()) return;

  // Ignore if it's a direct reply to prevent double trigger execution
  if (event.type === "message_reply") return;

  const message = event.body || "";
  const lowerMessage = message.toLowerCase();

  if (roniBotTriggers.some(word => lowerMessage.startsWith(word))) {
      api.setMessageReaction("🪽", event.messageID, () => {}, true);

      let userText = message; 
      for (const prefix of roniBotTriggers) {
          if (lowerMessage.startsWith(prefix)) { 
              userText = message.substring(prefix.length).trim();
              break;
          }
      }

      return await processBotReply({ api, event, userText: userText });
  }
};
    
