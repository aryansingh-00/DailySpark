const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "../.output/public");
const assetsDir = path.join(publicDir, "assets");

if (!fs.existsSync(assetsDir)) {
  console.error("Assets directory not found. Run npm run build first.");
  process.exit(1);
}

// Find CSS and JS entry points
const files = fs.readdirSync(assetsDir);
const jsEntry = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const cssEntry = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

if (!jsEntry || !cssEntry) {
  console.error("Could not find index.js or styles.css bundle. Check build output.");
  process.exit(1);
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <title>DailySpark – Daily Motivation & Quotes</title>
    <link rel="stylesheet" href="assets/${cssEntry}" />
    <link rel="icon" href="favicon.ico" type="image/x-icon" />
    <link rel="manifest" href="manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="assets/${jsEntry}"></script>
  </body>
</html>`;

fs.writeFileSync(path.join(publicDir, "index.html"), htmlContent, "utf8");
console.log(`Successfully generated SPA entry point index.html linking /assets/${jsEntry} and /assets/${cssEntry}`);
