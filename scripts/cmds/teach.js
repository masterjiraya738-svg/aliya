const axios = require("axios");

const REQUIRED_AUTHOR = "Roni";
const baseApiUrl = "https://baby-one-zeta.vercel.app";

const adminCredentials = {
  username: process.env.ADMIN_USERNAME || "tawhid009api@gmail.com",
  password: process.env.ADMIN_PASSWORD || "taninisdev@990"
};

const makeBold = (text) => {
  if (!text) return "";
  const fonts = {
    a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺",
    n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
    A: "𝗔", B: "𝗕", C: "Ｃ", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "Ｋ", L: "𝗟", M: "𝗠",
    N: "𝗡", O: "𝗢", P: "𝗣", Q: "Q", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝘫", Y: "𝗬", Z: "𝗭",
    "0": "𝟬", "1": "𝟭", "2": "𝟮", "3": "𝟯", "4": "𝟰", "5": "𝟱", "6": "𝟲", "7": "𝟳", "8": "𝟴", "9": "𝟵"
  };
  return text.split("").map(char => fonts[char] || char).join("");
};

const getDatabaseStats = async () => {
  try {
    const res = await axios.get(`${baseApiUrl}/api/jan/stats`);
    if (res.data && res.data.success) {
      return `🐤 | Total Triggers = ${res.data.totalTeach}\n♻️ | Total Responses = ${res.data.totalResponses}\n💾 | Data Size = ${res.data.dataSize}\n👑 | Author = ${res.data.author}`;
    }
  } catch {}
  return `⚠️ Database connection error!`;
};

module.exports.config = {
   name: "teach", 
   aliases: ["shikho", "addteach"],
   version: "2.0",
   author: "Roni",
   role: 2,
   category: "chat",
   guide: {
     en: "{pn} trigger - response1, response2"
   }
};

const isAuthorValid = () => {
  return module.exports.config.author === REQUIRED_AUTHOR;
};

module.exports.onStart = async ({ api, event, args }) => {
  if (!isAuthorValid()) {
    return api.sendMessage("❌ Command corrupted! Author name modified.", event.threadID, event.messageID);
  }

  const content = args ? args.join(" ") : "";
  const lowerContent = content.toLowerCase().trim();

  if (lowerContent === "list" || lowerContent === "datacheck") {
    const stats = await getDatabaseStats();
    return api.sendMessage(makeBold(stats), event.threadID, event.messageID);
  }

  if (!content || !content.includes("-")) {
    return api.sendMessage(makeBold("❌ Format error! Example:\nteach hi - hello, hey\nteach list"), event.threadID, event.messageID);
  }

  const parts = content.split("-");
  const trigger = parts[0].trim();
  const rawResponses = parts.slice(1).join("-").trim();

  if (!trigger || !rawResponses) {
    return api.sendMessage(makeBold("❌ Trigger or response missing!"), event.threadID, event.messageID);
  }

  const responseArray = rawResponses.split(/,|\n/).map(r => r.trim()).filter(Boolean);

  try {
    const res = await axios.post(`${baseApiUrl}/api/jan/teach`, {
      trigger: trigger,
      responses: responseArray
    }, {
      headers: {
        'x-admin-user': adminCredentials.username,
        'x-admin-pass': adminCredentials.password
      }
    });

    if (res.data && res.data.success) {
      return api.sendMessage(makeBold(`✅ '${trigger}' er jonno ${responseArray.length} ti response successfully save hoyeche!`), event.threadID, event.messageID);
    } else {
      return api.sendMessage(makeBold("❌ Teach save korte somoshya hoyeche!"), event.threadID, event.messageID);
    }
  } catch (err) {
    return api.sendMessage(makeBold("❌ Server connection error!"), event.threadID, event.messageID);
  }
};
    
