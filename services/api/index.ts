import { app } from "./app.js";
import { config } from "./constants/config.js";
import { startNewsletterScheduler } from "./modules/newsletter/scheduler.js";
import { attachMarketDataWebSocket } from "./modules/fundakamental/marketStream.js";
import { startStockRefreshScheduler } from "./modules/fundakamental/stockPriceRefresh.js";
import { startPriceAlertScheduler } from "./modules/fundakamental/priceAlertChecker.js";
const PORT = config.PORT || 5000;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

const server = app.listen(PORT, HOST, () => {
	console.log(`server is running on ${HOST}:${PORT}`);
	// Schedule the daily 8 AM / 5 PM IST newsletter runs in-process.
	startNewsletterScheduler();
	// Keep saved stock prices fresh (India/US after close + catch-up after a sleep).
	startStockRefreshScheduler();
	// Turn hit price targets into in-app notifications.
	startPriceAlertScheduler();
});

attachMarketDataWebSocket(server);
