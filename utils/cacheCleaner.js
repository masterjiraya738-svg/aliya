const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// শুধু এই folder/file type clean হবে
const CLEAN_DIRS = [
    path.join(ROOT, "cache"),
    path.join(ROOT, "tmp"),
    path.join(ROOT, "temp"),
    path.join(ROOT, "temp_files")
];

// 6 ঘণ্টার বেশি পুরোনো file delete করবে
const MAX_AGE = 6 * 60 * 60 * 1000;

function cleanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    for (const file of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, file);

        try {
            const stat = fs.statSync(fullPath);

            // Folder হলে ভিতরের ফাইল clean করবে
            if (stat.isDirectory()) {
                cleanDirectory(fullPath);

                // Empty folder হলে remove
                if (fs.readdirSync(fullPath).length === 0) {
                    fs.rmdirSync(fullPath);
                }

                continue;
            }

            const age = Date.now() - stat.mtimeMs;

            if (age > MAX_AGE) {
                fs.unlinkSync(fullPath);
                console.log(`[CACHE] Deleted: ${path.relative(ROOT, fullPath)}`);
            }
        } catch (err) {
            console.log(`[CACHE] Skip: ${fullPath}`);
        }
    }
}

function cleanCache() {
    for (const dir of CLEAN_DIRS) {
        cleanDirectory(dir);
    }
}

// Bot start হওয়ার সময় একবার
cleanCache();

// প্রতি 30 মিনিটে check
setInterval(cleanCache, 30 * 60 * 1000);

module.exports = {
    cleanCache
};
