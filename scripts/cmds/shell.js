const { exec } = require("child_process");

const PRESETS = {
  help: "echo 'shell status | ffmpeg | ram | disk | uptime | node | process | ports | git | <command>'",

  status:
    "uname -a; echo '=== UPTIME ==='; uptime; echo '=== MEMORY ==='; free -h 2>/dev/null || true; echo '=== DISK ==='; df -h .",

  ffmpeg:
    "echo '=== FFMPEG ==='; (ffmpeg -version 2>/dev/null | head -1 || echo 'FFmpeg not installed'); echo '=== FFPROBE ==='; (ffprobe -version 2>/dev/null | head -1 || echo 'FFprobe not installed'); command -v ffmpeg || true",

  ram:
    "free -h 2>/dev/null || cat /proc/meminfo | head -10",

  disk:
    "df -h .; echo '--- Project ---'; du -sh . 2>/dev/null",

  uptime:
    "uptime",

  node:
    "node -v; npm -v; echo '--- npm packages ---'; npm list --depth=0 2>/dev/null | head -80",

  process:
    "echo '=== NODE PROCESSES ==='; pgrep -af node 2>/dev/null || ps aux | grep '[n]ode'",

  ports:
    "ss -lnt 2>/dev/null || netstat -lnt 2>/dev/null || echo 'No port tool available'",

  git:
    "git status --short; echo '---'; git log -1 --oneline; echo '---'; git branch --show-current"
};

function isDangerous(command) {
  return (
    /(^|[;&|])\s*(rm\s+-rf\s+\/|mkfs(?:\.|\s)|shutdown|reboot|poweroff)\b/i.test(command) ||
    /:\s*\{\s*:\|:\s*&\s*\}/.test(command)
  );
}

module.exports = {
  config: {
    name: "shell",
    version: "3.0",
    author: "Mr.king",
    countDown: 5,
    role: 2,
    shortDescription: "Run shell diagnostics",
    longDescription:
      "Owner/admin shell with system, Node.js, FFmpeg, process, port and Git presets.",
    category: "owner",

    guide: {
      vi: "{p}{n} help",
      en: "{p}{n} help | status | ffmpeg | ram | disk | uptime | node | process | ports | git | <command>"
    }
  },

  onStart: async function ({ args, message }) {
    const input = args.join(" ").trim();

    if (!input) {
      return message.reply(
        "🛠️ Shell\n\n" +
        "shell help\n" +
        "shell status\n" +
        "shell ffmpeg\n" +
        "shell ram\n" +
        "shell disk\n" +
        "shell uptime\n" +
        "shell node\n" +
        "shell process\n" +
        "shell ports\n" +
        "shell git\n\n" +
        "Or: shell <command>"
      );
    }

    const first = input.split(/\s+/)[0].toLowerCase();

    const command =
      PRESETS[first] && input.toLowerCase() === first
        ? PRESETS[first]
        : input;

    if (isDangerous(command)) {
      return message.reply("❌ Dangerous shell command blocked.");
    }

    exec(
      command,
      {
        cwd: process.cwd(),
        shell: true,
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024
      },
      async (error, stdout, stderr) => {
        let output = "";

        if (error) {
          output +=
            "❌ Error (
