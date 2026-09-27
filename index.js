/**
 * Aliya Official - Main Launcher
 * Starts Sakura.js and automatically restarts it when it exits with code 2.
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");

const PORT = process.env.PORT || 1000;

let child = null;
let isRestarting = false;

function startProject() {
    if (child) {
        return;
    }

    log.info("INDEX", `Starting Sakura.js on PORT ${PORT}...`);

    child = spawn("node", ["Sakura.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true,
        env: {
            ...process.env,
            PORT: String(PORT)
        }
    });

    child.on("error", (err) => {
        log.err("INDEX", "Failed to start Sakura.js", err);

        child = null;

        if (!isRestarting) {
            isRestarting = true;

            setTimeout(() => {
                isRestarting = false;
                startProject();
            }, 5000);
        }
    });

    child.on("close", (code, signal) => {
        child = null;

        log.info(
            "INDEX",
            `Sakura.js stopped. Code: ${code ?? "null"}, Signal: ${signal ?? "none"}`
        );

        // GoatBot's normal restart signal
        if (code === 2) {
            log.info("INDEX", "Restart requested. Restarting in 3 seconds...");

            if (!isRestarting) {
                isRestarting = true;

                setTimeout(() => {
                    isRestarting = false;
                    startProject();
                }, 3000);
            }

            return;
        }

        // Unexpected crash/exit
        if (code !== 0 && !isRestarting) {
            log.info("INDEX", "Unexpected exit. Restarting in 5 seconds...");

            isRestarting = true;

            setTimeout(() => {
                isRestarting = false;
                startProject();
            }, 5000);
        }
    });
}

// Graceful shutdown
function shutdown(signal) {
    log.info("INDEX", `${signal} received. Stopping Aliya...`);

    if (child)
