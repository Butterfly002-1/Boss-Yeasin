module.exports = {
  config: {
    name: "supportgc",
    version: "1.2",
    author: "Yeasin",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Join the support group chat"
    },
    longDescription: {
      en: "Join the official support group chat"
    },
    category: "admin",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, threadsData, message }) {
    const supportGroupThreadID = "1275740650297460"; // replace with your support group thread ID

    try {
      const threadInfo = await threadsData.get(supportGroupThreadID);
      const members = threadInfo.members || [];

      // get sender name
      const userInfo = await api.getUserInfo(event.senderID);
      const senderName = userInfo[event.senderID]?.name || "User";

      // check if already in group
      const userAlreadyInGroup = members.some(member => member.userID === event.senderID);

      if (userAlreadyInGroup) {
        return message.reply(
          `🚫 ${senderName}, you are already a member of the Support Group 🚫`
        );
      }

      // try to add user
      await api.addUserToGroup(event.senderID, supportGroupThreadID);

      return message.reply(
        `🎉 ${senderName}, you have been successfully added to the Support Group 🎉`
      );

    } catch (error) {
      console.error("Error adding user to support group:", error);

      return message.reply(
        `❌ Failed to add you to the Support Group. Please send me a friend request or unlock your profile and try again ❌`
      );
    }
  }
};
