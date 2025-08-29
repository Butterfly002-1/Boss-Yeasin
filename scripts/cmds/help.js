const fs = require("fs");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "3.2",
    author: "𝗕𝘂𝘁𝘁𝗲𝗿𝗳𝗹𝘆",
    countDown: 5,
    role: 0,
    description: "View command information with enhanced interface",
    category: "info",
    guide: {
      en: "{pn} [command] - View command details\n{pn} all - View all commands\n{pn} c [category] - View commands in category"
    }
  },

  langs: {
    en: {
      helpHeader: "╭━━━ 👑𝗕𝗨𝗧𝗧𝗘𝗥𝗙𝗟𝗬👑🪽  ━━╮\n"
                + "┃ 🔰 Total Commands: {total}\n"
                + "┃ 📥 Use: {prefix}help [command]\n"
                + "╰━━━━━━━━━━━━━━━━━━━━╯\n",
      categoryHeader: "\n🗃 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗬: {category}\n"
                    + "➪▭▭▭▭▭▭▭▭▭✰\n",
      commandItem: "🔸 {name}\n",
      categoryFooter: "➪▭▭▭▭▭▭▭▭▭▭▭✰\n",
      helpFooter: "\n💡 Tip: Type '{prefix}help [command]' for detailed info.",
      commandInfo: "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n"
                 + "┃         📜 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 📜        ┃\n"
                 + "┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫\n"
                 + "┃ Name       : {name}\n"
                 + "┃ Description: {description}\n"
                 + "┃ Category   : {category}\n"
                 + "┃ Aliases    : {aliases}\n"
                 + "┃ Version    : {version}\n"
                 + "┃ Permission : {role}\n"
                 + "┃ Cooldown   : {countDown}s\n"
                 + "┃ Use Prefix : {usePrefix}\n"
                 + "┃ Author     : {author}\n"
                 + "┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫",
      usageHeader: "┃ 🛠️ USAGE GUIDE\n",
      usageBody: "┃ {usage}\n",
      usageFooter: "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯",
      commandNotFound: "❌ Command '{command}' not found! Please check again.",
      doNotHave: "None",
      roleText0: "👥 Everyone",
      roleText1: "👑 Group Admins",
      roleText2: "⚡ Bot Admins"
    }
  },

  onStart: async function({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);
    const commandName = args[0]?.toLowerCase();

    const replyWithAutoUnsend = async (msg) => {
      await message.reply(msg); // Auto unsend removed
    };

    if (commandName === 'c' && args[1]) {
      const categoryArg = args[1].toUpperCase();
      const commandsInCategory = [];

      for (const [name, cmd] of commands) {
        if (cmd.config.role > 1 && role < cmd.config.role) continue;
        const category = cmd.config.category?.toUpperCase() || "GENERAL";
        if (category === categoryArg) {
          commandsInCategory.push({ name });
        }
      }

      if (commandsInCategory.length === 0) {
        return replyWithAutoUnsend(`❌ No commands found in category: ${categoryArg}`);
      }

      let replyMsg = this.langs.en.helpHeader.replace(/{total}/g, commandsInCategory.length)
                                           .replace(/{prefix}/g, prefix);
      replyMsg += this.langs.en.categoryHeader.replace(/{category}/g, categoryArg);

      commandsInCategory.sort((a, b) => a.name.localeCompare(b.name)).forEach(cmd => {
        replyMsg += this.langs.en.commandItem.replace(/{name}/g, cmd.name);
      });

      replyMsg += this.langs.en.categoryFooter;
      replyMsg += this.langs.en.helpFooter.replace(/{prefix}/g, prefix);

      return replyWithAutoUnsend(replyMsg);
    }

    if (!commandName || commandName === 'all') {
      const categories = new Map();

      for (const [name, cmd] of commands) {
        if (cmd.config.role > 1 && role < cmd.config.role) continue;

        const category = cmd.config.category?.toUpperCase() || "GENERAL";
        if (!categories.has(category)) {
          categories.set(category, []);
        }
        categories.get(category).push({ name });
      }

      const sortedCategories = [...categories.keys()].sort();
      let totalCommands = 0;
      let replyMsg = this.langs.en.helpHeader
                        .replace(/{total}/g, [...commands].filter(([_, cmd]) => (cmd.config.role <= role)).length)
                        .replace(/{prefix}/g, prefix);

      for (const category of sortedCategories) {
        const commandsInCategory = categories.get(category).sort((a, b) => a.name.localeCompare(b.name));
        totalCommands += commandsInCategory.length;

        replyMsg += this.langs.en.categoryHeader.replace(/{category}/g, category);

        commandsInCategory.forEach(cmd => {
          replyMsg += this.langs.en.commandItem.replace(/{name}/g, cmd.name);
        });

        replyMsg += this.langs.en.categoryFooter;
      }

      replyMsg += this.langs.en.helpFooter.replace(/{prefix}/g, prefix);

      return replyWithAutoUnsend(replyMsg);
    }

    // Show detailed info for a specific command
    let cmd = commands.get(commandName) || commands.get(aliases.get(commandName));
    if (!cmd) {
      return replyWithAutoUnsend(this.langs.en.commandNotFound.replace(/{command}/g, commandName));
    }

    const config = cmd.config;
    const description = config.description?.en || config.description || "No description";
    const aliasesList = config.aliases?.join(", ") || this.langs.en.doNotHave;
    const category = config.category?.toUpperCase() || "GENERAL";

    let roleText;
    switch(config.role) {
      case 1: roleText = this.langs.en.roleText1; break;
      case 2: roleText = this.langs.en.roleText2; break;
      default: roleText = this.langs.en.roleText0;
    }

    let guide = config.guide?.en || config.usage || config.guide || "No usage guide available";
    if (typeof guide === "object") guide = guide.body;
    guide = guide.replace(/\{prefix\}/g, prefix).replace(/\{name\}/g, config.name).replace(/\{pn\}/g, prefix + config.name);

    let replyMsg = this.langs.en.commandInfo
      .replace(/{name}/g, config.name)
      .replace(/{description}/g, description)
      .replace(/{category}/g, category)
      .replace(/{aliases}/g, aliasesList)
      .replace(/{version}/g, config.version)
      .replace(/{role}/g, roleText)
      .replace(/{countDown}/g, config.countDown || 1)
      .replace(/{usePrefix}/g, typeof config.usePrefix === "boolean" ? (config.usePrefix ? "✅ Yes" : "❌ No") : "❓ Unknown")
      .replace(/{author}/g, config.author || "Unknown");

    replyMsg += "\n" + this.langs.en.usageHeader +
                this.langs.en.usageBody.replace(/{usage}/g, guide.split("\n").join("\n┃ ")) +
                this.langs.en.usageFooter;

    return replyWithAutoUnsend(replyMsg);
  }
};
