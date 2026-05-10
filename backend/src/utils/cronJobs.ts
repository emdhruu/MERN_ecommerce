import cron from "node-cron";
import { sendDailySummary } from "./notificationMailer";

/**
 * Schedule daily summary email at 11:00 PM every day.
 * Cron expression: "0 23 * * *" = minute 0, hour 23, every day
 */
export const initCronJobs = () => {
    // Daily summary at 11 PM
    cron.schedule("0 23 * * *", async () => {
        console.log("Running daily summary cron job...");
        await sendDailySummary();
    });

    console.log("Cron jobs initialized. Daily summary scheduled at 11:00 PM.");
};
