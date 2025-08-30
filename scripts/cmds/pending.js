const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pending",
    aliases: ["p"],
    version: "1.2",
    author: "Xemon",
    countDown: 5,
    role: 2,
    shortDescription: "accept pending message",
    longDescription: "Approve or refuse pending threads/users",
    category: "utility",
  },

  onReply: async function ({ message, api, event, usersData, Reply }) {
    const { author, pending } = Reply;
    if (String(event.senderID) !== String(author)) return;

    const { body, threadID, messageID } = event;
    let count = 0;

    // Cancel/refuse
    if (!isNaN(body) === false && (body.startsWith("c") || body.startsWith("cancel"))) {
      return api.sendMessage(`[ OK ] Refusal complete.`, threadID, messageID);
    }

    // Approve
    const indexes = body.split(/\s+/);
    for (const idx of indexes) {
      const singleIndex = parseInt(idx);
      if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > pending.length) {
        return api.sendMessage(`❯ ${idx} is not a valid number`, threadID, messageID);
      }

      const target = pending[singleIndex - 1];

      // Change nickname + send welcome message
      api.changeNickname(
        `[ ${global.GoatBot.config.prefix} ] • ${global.GoatBot.config.nickNameBot || "Bot"}`,
        target.threadID,
        api.getCurrentUserID()
      );

      api.sendMessage(
        {
          body: `${global.GoatBot.config.nickNameBot} 𝐈𝐒 𝐍𝐎𝐖 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃!\nUse [ ${global.GoatBot.config.prefix}help ] 𝐓𝐎 𝐒𝐄𝐄 𝐀𝐋𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 🎀💖.`
        },
        target.threadID
      );

      count++;
    }

    return api.sendMessage(`[ ✅ ] 𝐀𝐏𝐏𝐑𝐎𝐕𝐄 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋 🎀 ${count} thread(s)!`, threadID, messageID);
  },

  onStart: async function ({ message, api, event, args, usersData }) {
    if (args.length === 0) {
      return api.sendMessage(
        "❯ Usage:\n" +
        "• 𝐏𝐄𝐍𝐃𝐈𝐍𝐆 𝐀𝐋𝐋→𝐒𝐇𝐎𝐖 𝐀𝐋𝐋 𝐆𝐑𝐎𝐔𝐏 \n" +
        "• 𝐏𝐄𝐍𝐃𝐈𝐍𝐆 𝐓𝐇𝐑𝐄𝐀𝐃→𝐒𝐇𝐎𝐖 𝐓𝐇𝐑𝐄𝐀𝐃 \n" +
        "• 𝐏𝐄𝐍𝐃𝐈𝐍𝐆 𝐔𝐒𝐄𝐑→𝐒𝐇𝐎𝐖 𝐈𝐍𝐁𝐎𝐗",
        event.threadID,
        event.messageID
      );
    }

    const { threadID, messageID } = event;
    const commandName = this.config.name;

    let spam, pending;
    try {
      spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      pending = await api.getThreadList(100, null, ["PENDING"]) || [];
    } catch (e) {
      return api.sendMessage("[ ERR ] Failed to get pending list", threadID, messageID);
    }

    let list = [];
    let msg = "";
    let index = 1;

    switch (args[0]) {
      case "user":
      case "u":
      case "-u": {
        list = [...spam, ...pending].filter(gr => !gr.isGroup);
        for (const single of list) {
          let name;
          try {
            name = await usersData.getName(single.threadID);
          } catch {
            name = "Unknown";
          }
          msg += `${index++}/ ${name} (${single.threadID})\n`;
        }
        break;
      }

      case "thread":
      case "t":
      case "-t": {
        list = [...spam, ...pending].filter(gr => gr.isGroup && gr.isSubscribed);
        for (const single of list) {
          msg += `${index++}/ ${single.name || "Unknown"} (${single.threadID})\n`;
        }
        break;
      }

      case "all":
      case "a":
      case "-a": {
        list = [...spam, ...pending].filter(gr => gr.isSubscribed || !gr.isGroup);
        for (const single of list) {
          let displayName;
          if (single.isGroup) {
            displayName = single.name || "Unknown";
          } else {
            try {
              displayName = await usersData.getName(single.threadID);
            } catch {
              displayName = "Unknown";
            }
          }
          msg += `${index++}/ ${displayName} (${single.threadID})\n`;
        }
        break;
      }

      default:
        return api.sendMessage("❌ Invalid option. Use `pending user | thread | all`", threadID, messageID);
    }

    if (list.length === 0) {
      return api.sendMessage("[ - ] 𝐍𝐎 𝐏𝐄𝐍𝐃𝐈𝐍𝐆 𝐅𝐎𝐔𝐍𝐃 ❌.", threadID, messageID);
    }

    return api.sendMessage(
      `❯ Total: ${list.length}\n❯ Reply with number(s) to approve/cancel:\n\n${msg}`,
      threadID,
      (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
            pending: list
          });
        }
      },
      messageID
    );
  }
};
