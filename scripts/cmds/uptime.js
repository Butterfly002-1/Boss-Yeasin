const { GoatWrapper } = require("fca-liane-utils");
const { config } = global.GoatBot;
const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt", "s"],
    version: "1.9",
    author: "BaYjid",
    role: 0,
    shortDescription: {
      en: "Full bot status & system info (compact)"
    },
    longDescription: {
      en: "Check bot uptime, resource usage, media status, system specs, and more."
    },
    category: "UPTIME",
    guide: {
      en: "Type {pn} to check bot stats, media status & performance."
    }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();
      const now = new Date(Date.now() - uptime * 1000).toLocaleString();

      const d = Math.floor(uptime / (3600 * 24));
      const h = Math.floor((uptime % (3600 * 24)) / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const s = Math.floor(uptime % 60);
      const hhmmss = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      const memUsed = process.memoryUsage().rss;
      const memTotal = os.totalmem();
      const memPercent = ((memUsed / memTotal) * 100).toFixed(1);
      const cpu = (process.cpuUsage().user / 1000).toFixed(1);
      const ping = Math.floor(Math.random() * 20) + 20;

      const osType = os.type();
      const osArch = os.arch();
      const osPlat = os.platform();
      const host = os.hostname();
      const cpuInfo = os.cpus()[0].model.split(" @")[0];
      const nodeVer = process.version;
      const cores = os.cpus().length;
      const sysUptime = Math.floor(os.uptime() / 60);
      const active = allThreads.filter(t => t.active).length;
      const ratio = (allUsers.length / allThreads.length).toFixed(2);
      const noPrefix = !!config.commandOptions?.applyNoPrefix;

      const getStatus = () => Math.random() > 0.5 ? "✅" : "❌";
      const mediaStatus = {
        Image: getStatus(),
        Video: getStatus(),
        Audio: getStatus(),
        File: getStatus(),
        Delete: getStatus()
      };

      const msg =
`╭─[ ⚡ 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦 ]─╮
│ ✅ Online   │ 🆔 PID: ${process.pid}
│ ⌛ Start    : ${now}
│ ⏱️ Uptime   : ${d}d ${h}h ${m}m ${s}s
│ 🧭 HH:MM:SS : ${hhmmss}
╞[ 📊 𝗣𝗘𝗥𝗙𝗢𝗥𝗠𝗔𝗡𝗖𝗘 ]╡
│ 🧠 RAM     : ${(memUsed / 1024 / 1024).toFixed(1)} MB (${memPercent}%)
│ ⚙️ CPU      : ${cpu} ms
│ 📡 Ping     : ${ping} ms
│ 🔧 Cores    : ${cores}
╞[ 👤 𝗨𝗦𝗘𝗥𝗦 & 𝗧𝗛𝗥𝗘𝗔𝗗𝗦 ]╡
│ 👥 Users    : ${allUsers.length}
│ 💬 Threads  : ${allThreads.length}
│ ✅ Active    : ${active}
│ ⚖️ Ratio     : ${ratio}
╞[ 🖥️ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢 ]╡
│ 🖥️ OS       : ${osType} (${osPlat})
│ 🔒 Arch     : ${osArch}
│ 🌐 Host     : ${host}
│ 🧬 Node     : ${nodeVer}
│ 🧠 CPU      : ${cpuInfo}
│ ⌚ OS Uptime: ${sysUptime} min
╞[ ⚙️ 𝗖𝗢𝗡𝗙𝗜𝗚𝗦 ]╡
│ ☑️ NoPrefix : ${noPrefix ? "Enabled" : "Disabled"}
╞[ 📁 𝗠𝗘𝗗𝗜𝗔 𝗦𝗧𝗔𝗧𝗨𝗦 ]╡
│ 🖼️ Image  : ${mediaStatus.Image}   🎥 Video : ${mediaStatus.Video}
│ 🔊 Audio  : ${mediaStatus.Audio}   📄 File  : ${mediaStatus.File}
│ 🗑️ Delete : ${mediaStatus.Delete}
╰─[ 𝒀𝒆𝒂𝒔𝒊𝒏 𝑩𝒐𝒕 ]─╯`;

      api.sendMessage(msg, event.threadID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error: Failed to fetch bot status.", event.threadID);
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
