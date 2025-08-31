module.exports.config = {
  name: "fork",
  version: "1.0.0",
  hasPermission: 2, // Admin level
  credits: "Hinata",
  description: "Send GitHub repo link",
  commandCategory: "other",
  usages: "fork",
  cooldowns: 3
};

module.exports.run = async function({ api, event }) {
  // Only allow your UID
  if (event.senderID !== "100003608645652") {
    return api.sendMessage("❌ You don’t have permission to use this command.", event.threadID, event.messageID);
  }

  return api.sendMessage(
    "🔗 GitHub Repo Link:\n\nhttps://github.com/Butterfly002-1/Boss-Yeasin.git",
    event.threadID,
    event.messageID
  );
};
