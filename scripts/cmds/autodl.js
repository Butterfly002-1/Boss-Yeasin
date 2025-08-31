const axios = require("axios");
const fs = require("fs");
const { shortenURL } = global.utils;

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "autodl",
    version: "1.0.3",
    author: "Modified by Yeasin",
    countDown: 0,
    role: 0,
    description: {
      en: "Auto download video from tiktok, facebook, Instagram, YouTube, and more",
    },
    category: "media",
    guide: {
      en: "[video_link]",
    },
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    let dipto = event.body ? event.body : "";

    try {
      if (
        dipto.startsWith("https://vt.tiktok.com") ||
        dipto.startsWith("https://www.tiktok.com/") ||
        dipto.startsWith("https://www.facebook.com") ||
        dipto.startsWith("https://www.instagram.com/") ||
        dipto.startsWith("https://youtu.be/") ||
        dipto.startsWith("https://youtube.com/") ||
        dipto.startsWith("https://x.com/") ||
        dipto.startsWith("https://twitter.com/") ||
        dipto.startsWith("https://vm.tiktok.com") ||
        dipto.startsWith("https://fb.watch")
      ) {
        // Start reaction
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        // Send "𝔻𝔸ℝ𝔸𝕎 𝔹𝔸𝔹𝕐 𝔻𝕀ℂℂℍ𝕀" and store messageID
        const waitMsg = await api.sendMessage(
          "𝔻𝔸ℝ𝔸𝕎 𝔹𝔸𝔹𝕐 𝔻𝕀ℂℂℍ𝕀 😘",
          event.threadID,
          undefined,
          event.messageID
        );

        const path = __dirname + `/cache/diptoo.mp4`;

        const { data } = await axios.get(
          `${await baseApiUrl()}/alldl?url=${encodeURIComponent(dipto)}`
        );

        const vid = (
          await axios.get(data.result, { responseType: "arraybuffer" })
        ).data;

        fs.writeFileSync(path, Buffer.from(vid, "utf-8"));
        const url = await shortenURL(data.result);

        // Success reaction
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        const videoName =
          data.title || data.caption || data.desc || "🎥 ভিডিওর কেপশন দেয়া হয়নাই";

        // Unsend the wait message before sending video
        if (waitMsg && waitMsg.messageID) {
          api.unsendMessage(waitMsg.messageID);
        }

        api.sendMessage(
          {
            body: `🎬 ভিডিওর কেপশন: ${videoName}\n✅ ডাউনলোড লিংক: ${url}`,
            attachment: fs.createReadStream(path),
          },
          event.threadID,
          () => fs.unlinkSync(path),
          event.messageID
        );
      }
    } catch (e) {
      api.setMessageReaction("❎", event.messageID, () => {}, true);
      api.sendMessage("𝕊𝕆ℝℝ𝕐 𝕁𝔸ℕ 𝔸ℙ𝕀 ℙℝ𝕆𝔹𝕃𝔼𝕄 💔", event.threadID, event.messageID);
    }
  },
};
