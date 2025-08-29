const { exec } = require('child_process');

module.exports = {
  config: {
    name: "shell",
    version: "1.1",
    author: "BaYjid + Secured by Yeasin",
    countDown: 5,
    role: 2,
    shortDescription: "Execute shell commands (Only owner)",
    longDescription: "Only usable by Yeasin",
    category: "shell",
    guide: {
      vi: "{p}{n} <command>",
      en: "{p}{n} <command>"
    }
  },

  onStart: async function ({ args, message, event }) {
    const allowedUID = "100003608645652";
    const senderID = event.senderID;

    if (senderID !== allowedUID) {
      return message.reply("⚠️ You are not authorized to use this command.");
    }

    const command = args.join(" ");
    if (!command) {
      return message.reply("❗ Please provide a command to execute.");
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error}`);
        return message.reply(`❌ Error: ${error.message}`);
      }

      if (stderr) {
        console.error(`Command execution stderr: ${stderr}`);
        return message.reply(`⚠️ Stderr: ${stderr}`);
      }

      console.log(`Executed:\n${stdout}`);
      message.reply(`✅ Output:\n${stdout}`);
    });
  }
};
