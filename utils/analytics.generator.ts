import cron from "node-cron";

cron.schedule("*/5 * * * * *", async () => {
  console.log("after every 5 sec love del read notifications");
});
