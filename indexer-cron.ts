require('dotenv').config();

const cron = require("node-cron");
// IndexerApp
const indexerApp = require("./src/app");

// Schedule indexer execution. The job will run every five minutes but it can be configured by modifying the 
// Cron expression see https://www.npmjs.com/package/node-cron for details on cron configuration
// Using a default config to run every 15 minutes in case the configuration is not set
const cronExpression = process.env.JOB_EXECUTION_CRON || "*/4 * * * *";
console.log("this is the configured expression", cronExpression);
const task = cron.schedule(cronExpression, indexerApp);

task.start();