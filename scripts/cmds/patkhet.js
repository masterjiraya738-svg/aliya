const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");
const { GoatWrapper } = require("fca-saim-x69x");

// Utility: Short format for money/numbers
function formatMoney(amount) {
  const units = ["", "K", "M", "B", "T"];
  let unitIndex = 0;
  while (amount >= 1000 && unitIndex < units.length - 1) {
    amount /= 1000;
    unitIndex++;
  }
  return amount.toFixed(1).replace(/\.0$/, "") + units[unitIndex];
}

// Utility: Japanese/Unicode font selector
function getFontFamily(text) {
  if (/[\u3040-\u30FF\u31F0-\u31FF\uFF65-\uFF9F\u4E00-\u9FFF]/.test(text)) {
    return "JapaneseFont";
  }
  return "JapaneseFont";
}

// Download & Register required fonts automatically
async function loadFonts(cacheDir) {
  const fontFolder = path.join(cacheDir, "fonts");
  if (!fs.existsSync(fontFolder)) fs.mkdirSync(fontFolder, { recursive: true });

  const fontsToLoad = [
    {
      url: "https://github.com/Saim12678/Saim/blob/154232a4ea1ea849f1374d00800f6817416a31f8/fonts/Gen%20Jyuu%20Gothic%20Monospace%20Bold.ttf?raw=true",
      file: "Japanese.ttf",
      family: "JapaneseFont"
    }
  ];

  for (const fontItem of fontsToLoad) {
    const fontPath = path.join(fontFolder, fontItem.file);
    if (!fs.existsSync(fontPath)) {
      try {
        const response = await axios.get(fontItem.url, { responseType: "arraybuffer" });
        fs.writeFileSync(fontPath, response.data);
      } catch (error) {
        console.error(`Failed to download font ${fontItem.file}:`, error.message);
      }
    }
    if (fs.existsSync(fontPath)) {
      registerFont(fontPath, { family: fontItem.family });
    }
  }
}

// Draw formatted text
function drawText(ctx, text, x, y, size, color = "#fff", align = "left", strokeColor = null) {
  const family = getFontFamily(text);
  ctx.font = `${size}px ${family}`;
  ctx.textAlign = align;
  ctx.fillStyle = color;
  if (strokeColor) {
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 12;
  } else {
    ctx.shadowColor = "transparent";
  }
  ctx.fillText(text, x, y);
}

// Draw Hexagon for Profile Frame
function drawHex(ctx, x, y, radius) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// Draw Outer Neon Frame
function drawFrame(ctx, x, y, width, height, radius, strokeColor) {
  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 4;
  ctx.shadowColor = strokeColor;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// Safe Profile Picture Buffer Fetcher (Prevents FB Graph API Error 100)
async function getProfileBuffer(targetID, usersData) {
  // 1. Try GoatBot usersData Avatar
  try {
    if (usersData && typeof usersData.getAvatarUrl === "function") {
      const avatarUrl = await usersData.getAvatarUrl(targetID);
      const res = await axios.get(avatarUrl, { responseType: "arraybuffer", timeout: 7000 });
      if (res.data && res.data.length > 500) return Buffer.from(res.data);
    }
  } catch (e) {}

  // 2. Fallback CDN URLs (Without Token Error)
  const fallbacks = [
    `https://www.facebook.com/p/a/${targetID}`,
    `https://unavatar.io/facebook/${targetID}`,
    `https://i.imgur.com/I3VsBEt.png` // Default fallback image
  ];

  for (const url of fallbacks) {
    try {
      const res = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 7000,
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      if (res.data && res.data.length > 500) return Buffer.from(res.data);
    } catch (e) {
      continue;
    }
  }
  return null;
}

// Generate the Card Canvas
async function createSpyCard(userData, cacheDir) {
  await loadFonts(cacheDir);

  const {
    avatarBuffer,
    name,
    uid,
    username,
    gender,
    type,
    birthday,
    nickname,
    location,
    money,
    rank,
    moneyRank
  } = userData;

  const canvasWidth = 490;
  const canvasHeight = 840;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  const avatarRadius = 90;
  const centerX = canvasWidth / 2;
  const centerY = 140;

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  bgGrad.addColorStop(0, "#1a0033");
  bgGrad.addColorStop(0.5, "#2d003f");
  bgGrad.addColorStop(1, "#40004c");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Outer Border
  drawFrame(ctx, 10, 10, canvasWidth - 20, canvasHeight - 20, 30, "#00ffff");

  // Load Avatar
  let userAvatarImg;
  try {
    userAvatarImg = await loadImage(avatarBuffer);
  } catch (e) {
    userAvatarImg = await loadImage("https://i.imgur.com/I3VsBEt.png");
  }

  // Draw Outer Hexagon Glow
  ctx.save();
  ctx.shadowColor = "#ff99ff";
  ctx.shadowBlur = 20;
  drawHex(ctx, centerX, centerY, avatarRadius + 6);
  ctx.fillStyle = "#ff99ff";
  ctx.fill();
  ctx.restore();

  // Clip & Draw Hexagonal Avatar
  ctx.save();
  drawHex(ctx, centerX, centerY, avatarRadius);
  ctx.clip();
  ctx.drawImage(userAvatarImg, centerX - avatarRadius, centerY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
  ctx.restore();

  // Name Title
  drawText(ctx, "👤 " + name, canvasWidth / 2, centerY + avatarRadius + 60, 32, "#ff99ff", "center", "#ff99ff");

  // Info Items Grid
  const startY = centerY + avatarRadius + 100;
  const rowHeight = 36;
  const boxWidth = canvasWidth - 60;
  const infoRows = [
    ["🆔 UID", uid],
    ["🌐 Username", username.startsWith("@") ? username : "@" + username],
    ["🚻 Gender", gender],
    ["🎓 Type", type || "User"],
    ["🎂 Birthday", birthday || "Private"],
    ["💬 Nickname", nickname || name],
    ["🌍 Location", location || "Private"],
    ["💰 Money", "$" + formatMoney(money)],
    ["📈 XP Rank", "#" + rank],
    ["🏦 Money Rank", "#" + moneyRank]
  ];

  let currentY = startY;
  for (let i = 0; i < infoRows.length; i++) {
    const [label, val] = infoRows[i];
    const marginX = 30;

    ctx.fillStyle = "rgba(20,10,40,0.85)";
    ctx.fillRect(marginX, currentY, boxWidth, rowHeight);

    drawText(ctx, label + ": ", marginX + 10, currentY + rowHeight / 2 + 6, 18, "#fff", "left");
    const labelWidth = ctx.measureText(label + ": ").width;
    const valueColor = i % 2 === 0 ? "#00ffff" : "#ff99ff";

    drawText(ctx, val.toString(), marginX + 10 + labelWidth, currentY + rowHeight / 2 + 6, 18, valueColor, "left", valueColor);
    currentY += rowHeight + 12;
  }

  // Footer Credit
  drawText(ctx, "©️ Saimx69x", canvasWidth / 2, currentY + 10, 16, "#AAAAAA", "center");

  return canvas.toBuffer("image/png");
}

module.exports = {
  config: {
    name: "patkhet",
    version: "2.0.0",
    role: 0,
    author: "Saimx69x",
    category: "information",
    description: "Displays a detailed, neon-themed user information card.",
    aliases: ["spy", "userinfo"],
    countDown: 5
  },

  onStart: async ({ api, event, message, usersData, args }) => {
    try {
      let targetID;

      // Target ID Resolution
      if (args[0] && !isNaN(args[0])) {
        targetID = args[0];
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } else if (event.messageReply?.senderID) {
        targetID = event.messageReply.senderID;
      } else {
        targetID = event.senderID;
      }

      if (!targetID || isNaN(targetID)) {
        return message.reply("⚠️ Apni jake spy korte chan tar **UID** din, mention korun (@), ba kono messsage-e reply korun.");
      }

      const waitMsg = await message.reply("⚡ Generating your spy card...");

      // Fetch User & Global Data in Parallel
      const [userInfo, userDataInfo, userAvatarBuffer, allUsers] = await Promise.all([
        api.getUserInfo(targetID),
        usersData.get(targetID),
        getProfileBuffer(targetID, usersData),
        usersData.getAll()
      ]);

      const targetUserInfo = userInfo[targetID] || {};
      const genderMap = { 1: "👧 Girl", 2: "👦 Boy", 0: "🤷 Unknown" };

      // Alternate Name / Nickname Parsing
      const altName = typeof targetUserInfo.alternateName === "string" && targetUserInfo.alternateName.trim().length > 0 
        ? targetUserInfo.alternateName.trim() 
        : targetUserInfo.name;

      const userLocation = targetUserInfo.location?.name || "Private";

      // Calculate Rank & Money Rank
      const rank = allUsers.sort((a, b) => b.exp - a.exp).findIndex(item => item.userID === targetID) + 1;
      const moneyRank = allUsers.sort((a, b) => b.money - a.money).findIndex(item => item.userID === targetID) + 1;

      const userNameHandle = targetUserInfo.vanity || "facebook.com/" + targetID;

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      // Build Spy Card Image Buffer
      const cardBuffer = await createSpyCard({
        avatarBuffer: userAvatarBuffer,
        name: targetUserInfo.name || "Facebook User",
        uid: targetID,
        username: userNameHandle,
        gender: genderMap[targetUserInfo.gender] || "Unknown",
        type: targetUserInfo.type || "User",
        birthday: targetUserInfo.isBirthday !== false ? targetUserInfo.isBirthday : "Private",
        nickname: altName,
        location: userLocation,
        money: userDataInfo.money || 0,
        rank: rank,
        moneyRank: moneyRank
      }, cacheDir);

      const tempFilePath = path.join(cacheDir, `spy_card_${targetID}.png`);
      fs.writeFileSync(tempFilePath, cardBuffer);

      // Unsend loading message
      await message.unsend(waitMsg.messageID);

      // Send output image with cleanup callback
      return message.reply({ attachment: fs.createReadStream(tempFilePath) }, () => {
        try {
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        } catch (err) {
          console.error("Failed to delete temp file:", err);
        }
      });

    } catch (error) {
      console.error(error);
      return message.reply("❌ Failed to generate spy card. Please try again later.");
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
    
