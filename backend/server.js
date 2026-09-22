const app = require("./src/app");
const env = require("./src/config/env");
const connectDB = require("./src/config/db");
const runAllSeeds = require("./src/utils/seedAdmin");

async function start() {
  await connectDB();
  await runAllSeeds();

  const server = app.listen(env.PORT, () => {
    console.log(`\n🚀 Orinnovative backend running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`   Public site:   http://localhost:${env.PORT}/`);
    console.log(`   Admin panel:   http://localhost:${env.PORT}/admin`);
    console.log(`   API base:      http://localhost:${env.PORT}/api`);
    console.log(`   Sitemap:       http://localhost:${env.PORT}/sitemap.xml`);
    console.log(`   Robots:        http://localhost:${env.PORT}/robots.txt\n`);
  });

  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    server.close(() => process.exit(1));
  });
}

start();
