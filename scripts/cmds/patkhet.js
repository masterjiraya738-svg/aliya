const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");

module.exports = {
  config: {
    name: "patkhet",
    aliases: ["patkhete", "handel"],
    version: "1.0.1",
    author: "Mr. King",
    role: 0,
    cooldown: 5,
    shortDescription: "Overlay user face on patkhet doge image with funny caption",
    longDescription: "Crops target profile picture onto the doge face inside jute field (patkhet) and overlays custom funny text.",
    category: "fun",
    guide: { en: "{pn} or {pn} @mention or reply to message" }
  },

  onStart: async function ({ api, event, messageID }) {
    const { threadID, senderID, mentions, messageReply } = event;
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `patkhet_${Date.now()}.png`);
    await fs.ensureDir(cacheDir);

    let targetID = senderID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    }

    try {
      // 1. Updated Base Patkhet Image URL
      const baseImgUrl = "https://imgur.com/a/46Sn47k";
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

      // Target face position inside doge face area
      const faceX = 165;
      const faceY = 150;
      const faceRadius = 38;

      // Crop Avatar into Circle
      const faceBuffer = await sharp(Buffer.from(avtResponse.data, "binary"))
        .resize(faceRadius * 2, faceRadius * 2)
        .composite([{
          input: Buffer.from(`<svg><circle cx="${faceRadius}" cy="${faceRadius}" r="${faceRadius}" fill="black"/></svg>`),
          blend: 'dest-in'
        }])
        .png()
        .toBuffer();

      const userFaceImg = await loadImage(faceBuffer);

      // Draw User Face on Doge
      ctx.drawImage(userFaceImg, faceX - faceRadius, faceY - faceRadius, faceRadius * 2, faceRadius * 2);

      // 3. Draw Funny Caption Text on Image
      const textLine1 = "Akon vor bela patkhete k aibo";
      const textLine2 = "Jai aro vitore dukhe Handel Mari🦆💨";

      ctx.textAlign = "center";
      ctx.font = "bold 13px Arial";

      // Text Background Banner
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.fillRect(5, height - 45, width - 10, 40);

      // Text Stroke & Fill
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;

      ctx.strokeText(textLine1, width / 2, height - 28);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(textLine1, width / 2, height - 28);

      ctx.strokeText(textLine2, width / 2, height - 12);
      ctx.fillStyle = "#fffa65";
      ctx.fillText(textLine2, width / 2, height - 12);

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
