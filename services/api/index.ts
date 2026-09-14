import { app } from "./app.js";
import { config } from "./constants/config.js";
import { startNewsletterScheduler } from "./modules/newsletter/scheduler.js";
import { attachMarketDataWebSocket } from "./modules/fundakamental/marketStream.js";
const PORT = config.PORT || 5000;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

const server = app.listen(PORT, HOST, () => {
	console.log(`server is running on ${HOST}:${PORT}`);
	// Schedule the daily 8 AM / 5 PM IST newsletter runs in-process.
	startNewsletterScheduler();
});

attachMarketDataWebSocket(server);
