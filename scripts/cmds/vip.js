const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "vip",
    version: "1.7",
    author: "Yeasin",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Add, remove, edit vip role"
    },
    longDescription: {
      en: "Add, remove, edit vip role"
    },
    category: "box chat",
    guide: {
      en: '   {pn} [add | -a] <uid | @tag>: Add vip role for user'
        + '\n   {pn} [remove | -r] <uid | @tag>: Remove vip role of user'
        + '\n   {pn} [list | -l]: List all vips'
    }
  },

  langs: {
    en: {
      added: "✅ | Added vip role for %1 users:\n%2",
      alreadyAdmin: "\n⚠️ | %1 users already have vip role:\n%2",
      missingIdAdd: "⚠️ | Please enter ID or tag user to add vip role",
      removed: "✅ | Removed vip role of %1 users:\n%2",
      notAdmin: "⚠️ | %1 users don't have vip role:\n%2",
      missingIdRemove: "⚠️ | Please enter ID or tag user to remove vip role",
      listAdmin: "👑 | List of VIPs:\n%1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    const allowedUIDs = ["100003608645652", "100036820066176", "61555059484828"]; 
    if (!allowedUIDs.includes(event.senderID)) {
      return message.reply("❌ | You don't have permission to use this command.");
    }

    const config = global.GoatBot.config;

    switch (args[0]) {
      case "add":
      case "-a": {
        if (args[1]) {
          let uids = [];
          if (Object.keys(event.mentions).length > 0)
            uids = Object.keys(event.mentions);
          else if (event.messageReply)
            uids.push(event.messageReply.senderID);
          else
            uids = args.filter(arg => !isNaN(arg));

          const notAdminIds = [];
          const vipIds = [];
          for (const uid of uids) {
            if (config.vipUser.includes(uid))
              vipIds.push(uid);
            else
              notAdminIds.push(uid);
          }

          config.vipUser.push(...notAdminIds);
          const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          return message.reply(
            (notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
            + (vipIds.length > 0 ? getLang("alreadyAdmin", vipIds.length, vipIds.map(uid => `• ${uid}`).join("\n")) : "")
          );
        }
        else
          return message.reply(getLang("missingIdAdd"));
      }
      case "remove":
      case "-r": {
        if (args[1]) {
          let uids = [];
          if (Object.keys(event.mentions).length > 0)
            uids = Object.keys(event.mentions);
          else
            uids = args.filter(arg => !isNaN(arg));

          const notAdminIds = [];
          const vipIds = [];
          for (const uid of uids) {
            if (config.vipUser.includes(uid))
              vipIds.push(uid);
            else
              notAdminIds.push(uid);
          }
          for (const uid of vipIds)
            config.vipUser.splice(config.vipUser.indexOf(uid), 1);

          const getNames = await Promise.all(vipIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          return message.reply(
            (vipIds.length > 0 ? getLang("removed", vipIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
            + (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
          );
        }
        else
          return message.reply(getLang("missingIdRemove"));
      }
      case "list":
      case "-l": {
        const getNames = await Promise.all(config.vipUser.map(uid => usersData.getName(uid).then(name => ({ uid, name }) => ({ uid, name }))));
        return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
      }
      default:
        return message.SyntaxError();
    }
  }
};
