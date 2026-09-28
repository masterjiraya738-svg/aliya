const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");

module.exports = {
  config: {
    name: "takla",
    aliases: ["bald", "murad"],
    version: "1.0.0",
    author: "Mr. King",
    role: 0,
    cooldown: 5,
    shortDescription: "Crop profile picture onto Takla face",
    longDescription: "Overlays target profile picture or sender's avatar onto Takla Murad's face.",
    category: "fun",
    guide: { en: "{pn} or {pn} @mention or reply to message" }
  },

  onStart: async function ({ api, event, messageID }) {
    const { threadID, senderID, mentions, messageReply } = event;
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `takla_${Date.now()}.png`);
    await fs.ensureDir(cacheDir);

    let targetID = senderID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    }

    try {
      // 1. Load Base Takla Image
      const baseImgUrl = "https://i.imgur.com/ehBaVPd.jpg";
      const baseResponse = await axios.get(baseImgUrl, { responseType: "arraybuffer" });
      const baseImg = await loadImage(Buffer.from(baseResponse.data, "binary"));

      const width = baseImg.width;
      const height = baseImg.height;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Draw Base Image
      ctx.drawImage(baseImg, 0, 0, width, height);

      // 2. Fetch Target Avatar
      const avtUrl = `https://graph.facebook.com/${targetID}/picture?width=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avtResponse = await axios.get(avtUrl, { responseType: "arraybuffer", timeout: 8000 });

      // Precise Face Area Coordinates based on Takla Image
      const faceX = 330;
      const faceY = 230;
      const faceRadiusX = 110;
      const faceRadiusY = 125;

      // Crop Avatar into Ellipse Shape matching Face
      const faceBuffer = await sharp(Buffer.from(avtResponse.data, "binary"))
        .resize(faceRadiusX * 2, faceRadiusY * 2)
        .composite([{
          input: Buffer.from(`<svg><ellipse cx="${faceRadiusX}" cy="${faceRadiusY}" rx="${faceRadiusX}" ry="${faceRadiusY}" fill="black"/></svg>`),
          blend: 'dest-in'
        }])
        .png()
        .toBuffer();

      const userFaceImg = await loadImage(faceBuffer);

      // 3. Draw User Face on Takla
      ctx.drawImage(userFaceImg, faceX - faceRadiusX, faceY - faceRadiusY, faceRadiusX * 2, faceRadiusY * 2);

      // 4. Save and Send
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, buffer);

      return api.sendMessage({
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (global.gc) global.gc();
      }, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage(`❌ | Error: ${error.message}`, threadID, messageID);
    }
  }
};

