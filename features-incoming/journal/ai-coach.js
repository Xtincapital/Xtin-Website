// AI Coach Integration for Trading Journal - V2 with Deep Personalization
// Backend URL configured for local or Render deployment

// For local development, use http://127.0.0.1:8001
// For production (Render), set your Render URL here
const AI_COACH_RENDER_BACKEND_URL = 'https://xtin-backend.onrender.com';
const AI_COACH_LOCAL_BACKEND_URL = 'http://127.0.0.1:8001';

function getAICoachBackendURL() {
    // Priority 1: explicit runtime config injected via window.BACKEND_URL
    if (window.BACKEND_URL && typeof window.BACKEND_URL === 'string') {
        return window.BACKEND_URL.trim();
    }

    // Priority 2: local development
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    return AI_COACH_LOCAL_BACKEND_URL;
  }

    // Priority 3: backend URL from HTML meta tag
    const backendMeta = document.querySelector('meta[name="backend-url"]')?.content;
    if (backendMeta && typeof backendMeta === 'string') {
        return backendMeta.trim();
    }

    // Production fallback (Vercel -> Render)
  return AI_COACH_RENDER_BACKEND_URL;
}

let AI_API_BASE = getAICoachBackendURL();
const API_VERSION = "v2"; // Use V2 endpoints for personalized intelligence

// Get API base URL - use configured Render URL or relative paths
async function getAPIBase() {
    const backendUrl = getAICoachBackendURL();
    
    if (backendUrl) {
        console.log(`✓ Using backend: ${backendUrl}`);
        AI_API_BASE = backendUrl;
        return AI_API_BASE;
    }
    
    // No explicit backend URL configured - use relative paths
    // This assumes backend and frontend are on same domain via reverse proxy
    AI_API_BASE = '';
    console.log("✓ Using relative API paths (same-domain deployment)");
    return AI_API_BASE;
}

// Initialize API connection
async function initializeAPI() {
    await getAPIBase();
}

class AICoach {
    // Usage tracking constants
    static FREE_TIER_LIMIT = 0;
    static TOKEN_PACKAGES = [
        { id: 'ai_500', amountInr: 500, tokens: 300000, label: 'Starter AI Pack' },
        { id: 'ai_1000', amountInr: 1000, tokens: 700000, label: 'Growth AI Pack' },
        { id: 'ai_2000', amountInr: 2000, tokens: 1600000, label: 'Power AI Pack' }
    ];
    static USAGE_STORAGE_KEY = 'XtinJournalAIUsage';
    static PAYMENT_METHOD_KEY = 'XtinJournalPaymentMethod';
    static USAGE_RESET_DATE_KEY = 'XtinJournalUsageResetDate';
    static SUBSCRIPTION_STORAGE_KEY = 'XtinJournalSubscription';

    constructor() {
        this.isOpen = false;
        this.currentTab = 'insights';
        this.chatHistory = [];
        this.analysisCache = null;
        this.userProfile = null;
        this.userId = this.getUserId();
        this.behavioralAlerts = [];
        this.currentUsage = this.getOrInitializeUsage();
        this.paymentMethod = this.getPaymentMethod();
        this.subscription = this.getSubscription();
        this.wallet = { token_balance: 0, tokens_used: 0, tokens_purchased: 0 };
    }

    getUserId() {
        const supabaseUser = window.journalSupabase?.getUser?.();
        if (supabaseUser?.id) {
            localStorage.setItem('XtinJournalUserId', supabaseUser.id);
            return supabaseUser.id;
        }
        // Get or create persistent user ID for profile tracking
        let userId = localStorage.getItem('XtinJournalUserId') || localStorage.getItem('XtinUserId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('XtinJournalUserId', userId);
        }
        return userId;
    }

    getOrInitializeUsage() {
        try {
            const savedUsage = localStorage.getItem(AICoach.USAGE_STORAGE_KEY);
            const data = JSON.parse(savedUsage || '{}');
            const today = new Date().toISOString().split('T')[0];
            const resetDate = localStorage.getItem(AICoach.USAGE_RESET_DATE_KEY);
            
            // Reset usage if it's a new day
            if (resetDate !== today) {
                localStorage.setItem(AICoach.USAGE_RESET_DATE_KEY, today);
                const newData = { count: 0, lastReset: today };
                localStorage.setItem(AICoach.USAGE_STORAGE_KEY, JSON.stringify(newData));
                return newData;
            }
            return data || { count: 0, lastReset: today };
        } catch (error) {
            console.error('Error loading usage data:', error);
            return { count: 0, lastReset: new Date().toISOString().split('T')[0] };
        }
    }

    incrementUsage() {
        this.currentUsage.count += 1;
        localStorage.setItem(AICoach.USAGE_STORAGE_KEY, JSON.stringify(this.currentUsage));
        window.journalSupabase?.saveState?.('ai_usage', {
            usage: this.currentUsage,
            resetDate: localStorage.getItem(AICoach.USAGE_RESET_DATE_KEY),
            paymentMethod: this.paymentMethod,
            subscription: this.subscription
        });
        return this.currentUsage.count;
    }

    getPaymentMethod() {
        return localStorage.getItem(AICoach.PAYMENT_METHOD_KEY) || null;
    }

    setPaymentMethod(method) {
        this.paymentMethod = method;
        localStorage.setItem(AICoach.PAYMENT_METHOD_KEY, method);
        window.journalSupabase?.saveState?.('ai_usage', {
            usage: this.currentUsage,
            resetDate: localStorage.getItem(AICoach.USAGE_RESET_DATE_KEY),
            paymentMethod: this.paymentMethod,
            subscription: this.subscription
        });
    }

    canUseAI() {
        return (this.wallet?.token_balance || 0) > 0;
    }

    getTradesForAPI() {
        const sourceTrades = typeof getAllTrades === 'function' ? getAllTrades() : [];
        return (sourceTrades || []).map(trade => ({
            id: trade.id || Date.now(),
            symbol: trade.asset || trade.symbol || 'UNKNOWN',
            entry_price: parseFloat(trade.entryPrice || trade.entry_price || 0),
            exit_price: parseFloat(trade.exitPrice || trade.exit_price || 0),
            quantity: parseInt(trade.quantity || 1),
            profit_loss: parseFloat(trade.pnl || trade.profit_loss || 0),
            trading_type: trade.type || trade.trading_type || 'Unknown',
            market: trade.market || 'Equity',
            strategy: trade.strategy || 'Unknown',
            date: trade.date || new Date().toISOString().split('T')[0],
            exit_date: trade.exitDate || trade.exit_date || trade.date || new Date().toISOString().split('T')[0],
            time_in_trade: trade.timeInTrade || null,
            win_loss: (parseFloat(trade.pnl || trade.profit_loss || 0) > 0) ? 'Win' : ((parseFloat(trade.pnl || trade.profit_loss || 0) < 0) ? 'Loss' : 'Neutral'),
            // Emotion + notes power the coach's psychology insights — a
            // coach who can't see how you felt can't coach the feeling.
            emotion: trade.emotion || null,
            notes: (trade.notes || '').slice(0, 120) || null,
            tags: Array.isArray(trade.tags) ? trade.tags.slice(0, 5) : []
        }));
    }

    async askClaude(message, trades = this.getTradesForAPI()) {
        // Personal context: name, conversation memory, goals and plan tier
        // make the difference between a chatbot and a coach.
        const displayName = window.journalSupabase?.getDisplayName?.() || '';
        const goalsList = (typeof goals !== 'undefined' && Array.isArray(goals))
            ? goals.map(g => ({ title: g.title, metric: g.metric, timeframe: g.timeframe, target: g.targetValue }))
            : [];
        const clientTier = window.JournalPlan?.getTier?.() || 'free';
        const currency = (typeof currentCurrency !== 'undefined' && currentCurrency)
            ? currentCurrency
            : (localStorage.getItem('selectedCurrency') || 'INR');

        const response = await fetch(`${AI_API_BASE}/api/v2/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                trades: trades || [],
                user_id: this.userId,
                display_name: displayName,
                history: (this.chatHistory || []).slice(-10),
                goals: goalsList,
                client_tier: clientTier,
                currency: currency
            })
        });

        if (!response.ok) {
            throw new Error(await this.parseAIError(response, 'Claude coach request failed'));
        }

        const result = await response.json();
        this.updateWalletFromResponse(result);
        return result.reply || '';
    }

    async refreshWallet() {
        try {
            const response = await fetch(`${AI_API_BASE}/api/v2/ai/wallet?user_id=${encodeURIComponent(this.userId)}`);
            if (response.ok) {
                const payload = await response.json();
                this.wallet = payload.wallet || this.wallet;
                console.log('AI wallet refreshed:', {
                    backend: AI_API_BASE,
                    userId: this.userId,
                    tokenBalance: this.wallet?.token_balance,
                    freeTokensGranted: this.wallet?.free_tokens_granted,
                    freeTokensRuntime: this.wallet?.free_tokens_runtime
                });
            } else {
                console.warn('AI wallet refresh failed:', response.status, AI_API_BASE, this.userId);
            }
        } catch (error) {
            console.warn('AI wallet unavailable:', error.message);
        }
        this.updateUsageBadge();
        return this.wallet;
    }

    updateWalletFromResponse(payload) {
        if (payload && typeof payload.token_balance === 'number') {
            this.wallet = { ...this.wallet, token_balance: payload.token_balance };
        }
        if (payload?.wallet) this.wallet = payload.wallet;
        this.updateUsageBadge();
    }

    async parseAIError(response, fallbackMessage) {
        let payload = null;
        try {
            payload = await response.json();
        } catch (_) {
            return fallbackMessage;
        }
        const detail = payload?.detail;
        if (response.status === 402) {
            this.updateWalletFromResponse(detail);
            this.showPricingGate();
            return detail?.message || 'AI token balance is low. Please recharge to continue.';
        }
        return typeof detail === 'string' ? detail : (detail?.message || fallbackMessage);
    }

    getSubscription() {
        try {
            const raw = localStorage.getItem(AICoach.SUBSCRIPTION_STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error('Error loading subscription:', error);
            return null;
        }
    }

    saveSubscription(subscription) {
        this.subscription = subscription;
        localStorage.setItem(AICoach.SUBSCRIPTION_STORAGE_KEY, JSON.stringify(subscription));
    }

    hasActiveSubscription() {
        return !!(this.subscription && this.subscription.status === 'active');
    }

    async createSubscription(plan, paymentMethod) {
        const now = new Date();
        const renewalDate = new Date(now);
        renewalDate.setMonth(renewalDate.getMonth() + 1);
        
        const subscription = {
            plan,
            paymentMethod,
            status: 'active',
            startedAt: now.toISOString(),
            renewalAt: renewalDate.toISOString(),
            amountInr: plan === 'pro' ? 999 : 299
        };

        try {
            const response = await fetch(`${AI_API_BASE}/api/v2/subscription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: this.userId,
                    plan,
                    payment_method: paymentMethod
                })
            });

            if (response.ok) {
                const payload = await response.json();
                const apiSub = payload.subscription;
                this.saveSubscription({
                    plan: apiSub.plan,
                    paymentMethod: apiSub.payment_method,
                    status: apiSub.status,
                    startedAt: apiSub.started_at,
                    renewalAt: apiSub.renewal_at,
                    amountInr: apiSub.amount_inr
                });
            } else {
                this.saveSubscription(subscription);
            }
        } catch (error) {
            console.warn('Subscription API unavailable, using local fallback:', error.message);
            this.saveSubscription(subscription);
        }

        this.setPaymentMethod(paymentMethod);
        this.updateUsageBadge();
        if (typeof window.renderSubscriptionTab === 'function') {
            window.renderSubscriptionTab();
        }
    }

    async cancelSubscription() {
        if (!this.subscription) return;

        try {
            const response = await fetch(`${AI_API_BASE}/api/v2/subscription/cancel`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: this.userId })
            });

            if (response.ok) {
                const payload = await response.json();
                const apiSub = payload.subscription;
                this.saveSubscription({
                    plan: apiSub.plan,
                    paymentMethod: apiSub.payment_method,
                    status: apiSub.status,
                    startedAt: apiSub.started_at,
                    renewalAt: apiSub.renewal_at,
                    amountInr: apiSub.amount_inr
                });
            } else {
                const cancelled = { ...this.subscription, status: 'cancelled' };
                this.saveSubscription(cancelled);
            }
        } catch (error) {
            console.warn('Cancel subscription API unavailable, using local fallback:', error.message);
            const cancelled = { ...this.subscription, status: 'cancelled' };
            this.saveSubscription(cancelled);
        }

        this.updateUsageBadge();
        this.renderSubscriptionManager();
        if (typeof window.renderSubscriptionTab === 'function') {
            window.renderSubscriptionTab();
        }
    }

    showPricingGate() {
        const modal = document.getElementById('aiPricingModal');
        if (!modal) {
            this.injectPricingModal();
        }
        document.getElementById('aiPricingModal').style.display = 'flex';
    }

    closePricingGate() {
        const modal = document.getElementById('aiPricingModal');
        if (modal) modal.style.display = 'none';
    }

    injectPricingModal() {
        const packageCards = AICoach.TOKEN_PACKAGES.map(pkg => `
            <label style="display:block; border:1px solid #d1d5db; border-radius:8px; padding:12px; margin-bottom:10px; cursor:pointer;">
                <input type="radio" name="aiTokenPackage" value="${pkg.id}" ${pkg.id === 'ai_1000' ? 'checked' : ''} style="margin-right:10px;">
                <strong>₹${pkg.amountInr}</strong> ${pkg.label}
                <span style="float:right; color:#059669; font-weight:700;">${pkg.tokens.toLocaleString()} tokens</span>
            </label>
        `).join('');
        const modalHTML = `
            <div id="aiPricingModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); z-index: 1000005; justify-content: center; align-items: center;">
                <div style="background: white; border-radius: 12px; padding: 40px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                    <h2 style="margin: 0 0 10px; color: #059669; font-size: 24px;">Recharge AI Tokens</h2>
                    <p style="color: #6b7280; margin: 0 0 20px; font-size: 16px;">Claude AI uses tokens for each personalized response. Recharge once and use tokens until the balance reaches zero.</p>
                    
                    <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
                        ${packageCards}
                    </div>

                    <div style="display: flex; gap: 12px;">
                        <button type="button" id="aiPayWithRazorpayButton" onclick="aiCoach.proceedWithPayment(event)" style="flex: 1; padding: 12px; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">Pay with Razorpay</button>
                        <button type="button" onclick="aiCoach.closePricingGate()" style="flex: 1; padding: 12px; background: #e5e7eb; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">Cancel</button>
                    </div>
                    <p id="aiPaymentStatus" style="display:none; margin: 12px 0 0; color: #6b7280; font-size: 13px;"></p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;
    }

    async proceedWithPayment(e) {
        if (e) e.preventDefault();
        const packageId = document.querySelector('input[name="aiTokenPackage"]:checked')?.value || 'ai_1000';
        const button = document.getElementById('aiPayWithRazorpayButton');
        const status = document.getElementById('aiPaymentStatus');
        if (button) {
            button.disabled = true;
            button.textContent = 'Opening Razorpay...';
            button.style.opacity = '0.7';
        }
        if (status) {
            status.style.display = 'block';
            status.textContent = 'Creating secure Razorpay order...';
            status.style.color = '#6b7280';
        }
        try {
            await this.openRazorpayCheckout(packageId);
        } catch (error) {
            console.error('Razorpay checkout error:', error);
            if (status) {
                status.style.display = 'block';
                status.textContent = error.message || 'Could not open Razorpay checkout.';
                status.style.color = '#dc2626';
            } else {
                alert(error.message || 'Could not open Razorpay checkout.');
            }
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = 'Pay with Razorpay';
                button.style.opacity = '1';
            }
        }
    }

    loadRazorpayScript() {
        return new Promise((resolve, reject) => {
            if (window.Razorpay) return resolve();
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Could not load Razorpay checkout'));
            document.head.appendChild(script);
        });
    }

    async openRazorpayCheckout(packageId) {
        await this.loadRazorpayScript();
        const response = await fetch(`${AI_API_BASE}/api/v2/ai/razorpay/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: this.userId, package_id: packageId })
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            const message = typeof err.detail === 'string' ? err.detail : (err.detail?.message || 'Could not create Razorpay order.');
            throw new Error(message);
        }
        const payload = await response.json();
        const options = {
            key: payload.key_id,
            amount: payload.order.amount,
            currency: payload.order.currency,
            name: 'Xtin Journal AI',
            description: payload.package.label,
            order_id: payload.order.id,
            handler: async (payment) => {
                const status = document.getElementById('aiPaymentStatus');
                if (status) {
                    status.style.display = 'block';
                    status.textContent = 'Verifying payment and crediting tokens...';
                    status.style.color = '#6b7280';
                }
                const verify = await fetch(`${AI_API_BASE}/api/v2/ai/razorpay/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: this.userId,
                        package_id: packageId,
                        razorpay_order_id: payment.razorpay_order_id,
                        razorpay_payment_id: payment.razorpay_payment_id,
                        razorpay_signature: payment.razorpay_signature
                    })
                });
                if (!verify.ok) {
                    if (status) {
                        status.style.display = 'block';
                        status.textContent = 'Payment verification failed. Please contact support.';
                        status.style.color = '#dc2626';
                    } else {
                        alert('Payment verification failed. Please contact support.');
                    }
                    return;
                }
                const verified = await verify.json();
                this.updateWalletFromResponse(verified);
                this.closePricingGate();
                alert(`AI recharge successful. Balance: ${this.wallet.token_balance.toLocaleString()} tokens.`);
            },
            theme: { color: '#059669' }
        };
        new window.Razorpay(options).open();
    }

    showSubscriptionManager() {
        const modal = document.getElementById('aiSubscriptionModal');
        if (!modal) {
            this.injectSubscriptionManagerModal();
        }
        this.renderSubscriptionManager();
        document.getElementById('aiSubscriptionModal').style.display = 'flex';
    }

    closeSubscriptionManager() {
        const modal = document.getElementById('aiSubscriptionModal');
        if (modal) modal.style.display = 'none';
    }

    injectSubscriptionManagerModal() {
        const modalHTML = `
            <div id="aiSubscriptionModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); z-index: 1000004; justify-content: center; align-items: center;">
                <div style="background: white; border-radius: 12px; padding: 28px; max-width: 560px; width: 92%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
                    <h3 style="margin: 0 0 16px; color: #0f172a;">AI Token Wallet</h3>
                    <div id="subscriptionManagerContent"></div>
                    <div style="display: flex; gap: 10px; margin-top: 18px;">
                        <button onclick="aiCoach.closeSubscriptionManager()" style="flex: 1; padding: 10px 12px; border: none; border-radius: 8px; background: #e5e7eb; color: #111827; cursor: pointer; font-weight: 600;">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    renderSubscriptionManager() {
        const content = document.getElementById('subscriptionManagerContent');
        if (!content) return;

        const balance = this.wallet?.token_balance || 0;
        const used = this.wallet?.tokens_used || 0;
        const purchased = this.wallet?.tokens_purchased || 0;
        content.innerHTML = `
            <div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px;">
                <p style="margin: 0 0 8px;"><strong>Available:</strong> ${balance.toLocaleString()} tokens</p>
                <p style="margin: 0 0 8px;"><strong>Purchased:</strong> ${purchased.toLocaleString()} tokens</p>
                <p style="margin: 0;"><strong>Used:</strong> ${used.toLocaleString()} tokens</p>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 14px;">
                <button type="button" onclick="aiCoach.closeSubscriptionManager(); aiCoach.showPricingGate();" style="padding: 10px 12px; border: none; border-radius: 8px; background: #059669; color: white; cursor: pointer; font-weight: 600;">Recharge</button>
                <button type="button" onclick="aiCoach.refreshWallet()" style="padding: 10px 12px; border: none; border-radius: 8px; background: #e5e7eb; color: #111827; cursor: pointer; font-weight: 600;">Refresh</button>
            </div>
        `;
    }

    updateUsageBadge() {
        const badge = document.getElementById('aiUsageBadge');
        if (!badge) return;
        const remaining = Math.max(0, this.wallet?.token_balance || 0);
        badge.textContent = `${remaining.toLocaleString()} TOKENS`;
        badge.style.background = remaining === 0 ? 'rgba(153, 27, 27, 0.28)' : 'rgba(6, 95, 70, 0.34)';
        badge.style.color = '#ffffff';
        badge.style.border = remaining === 0 ? '1px solid rgba(254, 202, 202, 0.6)' : '1px solid rgba(167, 243, 208, 0.55)';
        badge.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.18)';
    }

    init() {
        initializeAPI(); // Initialize and detect correct server URL
        this.injectHTML();
        this.setupEventListeners();
        this.checkBehavioralAlerts(); // Check alerts on init
        this.refreshWallet(); // Display initial wallet count
    }

    injectHTML() {
        if (document.getElementById('aiCoachPanel')) {
            return;
        }
        const coachHTML = `
            <!-- AI Coach FAB -->
            <button class="ai-coach-fab" onclick="aiCoach.toggle()" title="Xtin Journal AI - Advanced Trading Intelligence">
                <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.8" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    
                    <!-- Outer rotating ring -->
                    <circle cx="50" cy="50" r="35" stroke="url(#mainGradient)" stroke-width="2" fill="none" opacity="0.6">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="20s" repeatCount="indefinite"/>
                    </circle>
                    
                    <!-- Inner rotating ring -->
                    <circle cx="50" cy="50" r="28" stroke="white" stroke-width="1.5" fill="none" opacity="0.4" stroke-dasharray="5 5">
                        <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="15s" repeatCount="indefinite"/>
                    </circle>
                    
                    <!-- Triangle with pulsing animation -->
                    <path d="M 50 25 L 70 65 L 30 65 Z" stroke="white" stroke-width="2.5" fill="none" filter="url(#glow)" opacity="0.9">
                        <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
                    </path>
                    
                    <!-- Eye outer circle -->
                    <circle cx="50" cy="50" r="12" fill="white" opacity="0.95"/>
                    
                    <!-- Iris with gradient -->
                    <circle cx="50" cy="50" r="8" fill="#10b981" opacity="0.9">
                        <animate attributeName="r" values="8;8.5;8" dur="4s" repeatCount="indefinite"/>
                    </circle>
                    
                    <!-- Pupil -->
                    <circle cx="50" cy="50" r="4" fill="#1a1a1a"/>
                    
                    <!-- Eye shine -->
                    <circle cx="52" cy="48" r="1.5" fill="white" opacity="0.9"/>
                    
                    <!-- Orbiting particles -->
                    <circle cx="50" cy="20" r="1.5" fill="white" opacity="0.8">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="8s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="75" cy="50" r="1.5" fill="white" opacity="0.8">
                        <animateTransform attributeName="transform" type="rotate" from="120 50 50" to="480 50 50" dur="8s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2.5s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="25" cy="50" r="1.5" fill="white" opacity="0.8">
                        <animateTransform attributeName="transform" type="rotate" from="240 50 50" to="600 50 50" dur="8s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite"/>
                    </circle>
                </svg>
            </button>

            <!-- AI Coach Panel -->
            <div class="ai-coach-panel" id="aiCoachPanel">
                <div class="ai-coach-header">
                    <div style="display: flex; align-items: center; gap: 14px;">
                        <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.18); border-radius: 12px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                                        <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.85" />
                                    </linearGradient>
                                </defs>
                                
                                <!-- Outer ring -->
                                <circle cx="50" cy="50" r="35" stroke="url(#headerGradient)" stroke-width="2" fill="none" opacity="0.6">
                                    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="20s" repeatCount="indefinite"/>
                                </circle>
                                
                                <!-- Triangle -->
                                <path d="M 50 25 L 70 65 L 30 65 Z" stroke="white" stroke-width="2.5" fill="none" opacity="0.9">
                                    <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
                                </path>
                                
                                <!-- Eye -->
                                <circle cx="50" cy="50" r="12" fill="white" opacity="0.95"/>
                                <circle cx="50" cy="50" r="8" fill="#10b981" opacity="0.9"/>
                                <circle cx="50" cy="50" r="4" fill="#1a1a1a"/>
                                <circle cx="52" cy="48" r="1.5" fill="white" opacity="0.9"/>
                            </svg>
                        </div>
                        <div>
                            <h3 style="margin: 0; font-weight: 700; letter-spacing: -0.5px;">Xtin Journal AI</h3>
                            <small style="opacity: 0.9; font-weight: 400;">Advanced Trading Intelligence</small>
                        </div>
                        <div id="aiUsageBadge" style="margin-left: auto; background: rgba(6, 95, 70, 0.34); color: #ffffff; border: 1px solid rgba(167, 243, 208, 0.55); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap;"></div>
                        <button onclick="aiCoach.showSubscriptionManager()" style="margin-left: 8px; padding: 6px 10px; border: 1px solid rgba(255,255,255,0.4); border-radius: 999px; background: rgba(255,255,255,0.15); color: white; font-size: 11px; cursor: pointer;">Manage</button>
                    </div>
                    <button class="ai-coach-close" onclick="aiCoach.close()">&times;</button>
                </div>

                <div class="ai-tabs">
                    <button class="ai-tab active" data-tab="insights" onclick="aiCoach.switchTab('insights')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        Insights
                    </button>
                    <button class="ai-tab" data-tab="profile" onclick="aiCoach.switchTab('profile')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        DNA
                    </button>
                    <button class="ai-tab" data-tab="chat" onclick="aiCoach.switchTab('chat')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        Coach
                    </button>
                    <button onclick="aiCoach.clearChatHistory()" 
                            style="margin-left: auto; padding: 8px 12px; background: transparent; border: 1px solid #e5e7eb; border-radius: 6px; cursor: pointer; font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px;"
                            title="Start new conversation">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="1 4 1 10 7 10"/>
                            <polyline points="23 20 23 14 17 14"/>
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                        </svg>
                        New
                    </button>
                </div>

                <div class="ai-coach-body">
                    <!-- Behavioral Alerts Banner -->
                    <div id="behavioralAlerts" style="display: none;"></div>
                    
                    <!-- Insights Tab -->
                    <div id="aiInsightsTab" class="ai-tab-content">
                        <div id="aiInsightsContent">
                            <p style="text-align: center; opacity: 0.6;">
                                Analyze your journal to get metrics plus a Claude coach read.
                            </p>
                            <button onclick="aiCoach.analyzeAllTrades()" 
                                    style="width: 100%; padding: 12px; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                                Analyze with Claude
                            </button>
                        </div>
                    </div>

                    <!-- Trading DNA Profile Tab -->
                    <div id="aiProfileTab" class="ai-tab-content" style="display: none;">
                        <div id="aiProfileContent">
                            <p style="text-align: center; opacity: 0.6;">
                                Your Trading DNA uses saved trades plus Claude's coach summary.
                            </p>
                            <button onclick="aiCoach.loadProfile()" 
                                    style="width: 100%; padding: 12px; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                Load Trading DNA
                            </button>
                        </div>
                    </div>

                    <!-- Chat Tab -->
                    <div id="aiChatTab" class="ai-tab-content" style="display: none;">
                        <div class="ai-chat-container">
                            <div class="ai-messages" id="aiMessages"></div>
                            <div class="ai-chat-input">
                                <input type="text" id="aiChatInput" placeholder="Ask your coach anything..." 
                                       onkeypress="if(event.key==='Enter') aiCoach.sendMessage()">
                                <button onclick="aiCoach.sendMessage()">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                    </svg>
                                </button>
                            </div>
                            <div style="padding: 10px 20px; font-size: 12px; color: #9ca3af; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; gap: 6px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="16" x2="12" y2="12"/>
                                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                Educational coaching only • Not financial advice
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', coachHTML);
    }

    setupEventListeners() {
        // No additional setup needed
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('aiCoachPanel');
        panel.classList.toggle('open', this.isOpen);
            if (this.isOpen) {
                this.updateUsageBadge();
            }
    }

    open() {
        this.isOpen = true;
        const panel = document.getElementById('aiCoachPanel');
        if (panel) panel.classList.add('open');
        this.updateUsageBadge();
    }

    close() {
        this.isOpen = false;
        document.getElementById('aiCoachPanel').classList.remove('open');
    }

    switchTab(tab) {
        this.currentTab = tab;
        this.updateUsageBadge();
        
        // Update tab buttons
        document.querySelectorAll('.ai-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update tab content
        document.getElementById('aiInsightsTab').style.display = tab === 'insights' ? 'block' : 'none';
        document.getElementById('aiProfileTab').style.display = tab === 'profile' ? 'block' : 'none';
        document.getElementById('aiChatTab').style.display = tab === 'chat' ? 'flex' : 'none';
        
        // Initialize welcome message if chat is empty
        if (tab === 'chat' && document.getElementById('aiMessages').children.length === 0) {
            this.showWelcomeMessage();
        }
        
        // Load profile when switching to DNA tab
        if (tab === 'profile' && !this.userProfile) {
            this.loadProfile();
        }
    }
    
    async checkBehavioralAlerts() {
        try {
            const response = await fetch(`${AI_API_BASE}/api/v2/behavioral-alerts?user_id=${this.userId}`);
            if (response.ok) {
                const data = await response.json();
                this.behavioralAlerts = data.alerts || [];
                this.displayBehavioralAlerts();
            }
        } catch (error) {
            console.log('Behavioral alerts not available (V2 server may not be running)');
        }
    }
    
    displayBehavioralAlerts() {
        const alertsDiv = document.getElementById('behavioralAlerts');
        if (!alertsDiv) return;
        
        if (this.behavioralAlerts.length === 0) {
            alertsDiv.style.display = 'none';
            return;
        }
        
        const alertColors = {
            'danger': { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
            'warning': { bg: '#fffbeb', border: '#fde68a', text: '#d97706' },
            'success': { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' }
        };
        
        let html = '';
        this.behavioralAlerts.forEach(alert => {
            const colors = alertColors[alert.type] || alertColors.warning;
            html += `
                <div style="padding: 12px 16px; margin: 0 16px 12px; background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 16px;">${alert.message}</span>
                </div>
            `;
        });
        
        alertsDiv.innerHTML = html;
        alertsDiv.style.display = 'block';
    }
    
    async loadProfile() {
        this.updateUsageBadge();

        const content = document.getElementById('aiProfileContent');

        // If we already have analysis data cached, build the profile from it directly
        if (this.analysisCache) {
            this.buildProfileFromAnalysis(this.analysisCache);
            return;
        }

        // Otherwise run the analysis first
        content.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="ai-loading"></div><p>Analysing your trades to build your DNA profile...</p></div>';

        const trades = getAllTrades();
        if (!trades || trades.length === 0) {
            content.innerHTML = '<div class="ai-insight-card"><p>No trades found. Add trades to your journal first, then come back to see your Trading DNA.</p></div>';
            return;
        }

        try {
            const transformedTrades = this.getTradesForAPI();

            const response = await fetch(`${AI_API_BASE}/api/v2/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: this.userId, trades: transformedTrades })
            });

            if (!response.ok) throw new Error('Analysis failed');

            const result = await response.json();
            this.analysisCache = result;
            this.buildProfileFromAnalysis(result);
        } catch (error) {
            console.error('Profile error:', error);
            content.innerHTML = `
                <div class="ai-insight-card error">
                    <h4>Profile Unavailable</h4>
                    <p>Could not load profile. Make sure the AI server is running.</p>
                    <button onclick="aiCoach.loadProfile()" style="margin-top: 10px; padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">Retry</button>
                </div>
            `;
        }
    }

    buildProfileFromAnalysis(result) {
        const analysis = result.analysis || {};
        const core = analysis.core_metrics || analysis;
        const stratPerf = analysis.strategy_performance || {};

        const totalTrades = core.total_trades || 0;
        const winRate = ((core.win_rate || 0) * 100).toFixed(1);
        const totalPnl = core.total_pnl || 0;
        const profitFactor = (core.profit_factor || 0).toFixed(2);
        const avgWin = core.average_win || 0;
        const avgLoss = Math.abs(core.average_loss || 0);
        const markets = [...new Set(getAllTrades().map(t => t.market || 'Equity'))];
        const strategies = Object.keys(stratPerf);

        // Determine trader type from strategy breakdown
        let traderType = 'Mixed';
        if (stratPerf) {
            const best = Object.entries(stratPerf).sort((a, b) => b[1].profit - a[1].profit)[0];
            if (best) traderType = best[0];
        }

        // Risk profile from profit factor
        let riskProfile = 'Moderate';
        let riskColor = '#d97706';
        if (profitFactor > 2.5) { riskProfile = 'Conservative'; riskColor = '#16a34a'; }
        else if (profitFactor < 1.2) { riskProfile = 'Aggressive'; riskColor = '#dc2626'; }

        const content = document.getElementById('aiProfileContent');
        content.innerHTML = `
            <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 20px;">Your Trading DNA</h3>
                <p style="margin: 4px 0 0; opacity: 0.7; color: ${riskColor};">${riskProfile} Risk Profile</p>
            </div>

            <h4 style="margin-bottom: 12px;">Real-Time Stats</h4>
            <div class="ai-insight-card">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div><small style="opacity:0.7;">Total Trades</small><div style="font-size:20px;font-weight:600;">${totalTrades}</div></div>
                    <div><small style="opacity:0.7;">Win Rate</small><div style="font-size:20px;font-weight:600;">${winRate}%</div></div>
                    <div><small style="opacity:0.7;">Total P&L</small><div style="font-size:20px;font-weight:600;color:${totalPnl >= 0 ? '#16a34a' : '#dc2626'};">₹${totalPnl.toLocaleString()}</div></div>
                    <div><small style="opacity:0.7;">Profit Factor</small><div style="font-size:20px;font-weight:600;">${profitFactor}</div></div>
                    <div><small style="opacity:0.7;">Avg Winner</small><div style="font-size:20px;font-weight:600;color:#16a34a;">₹${avgWin.toLocaleString()}</div></div>
                    <div><small style="opacity:0.7;">Avg Loser</small><div style="font-size:20px;font-weight:600;color:#dc2626;">₹${avgLoss.toLocaleString()}</div></div>
                </div>
            </div>

            <h4 style="margin: 20px 0 12px;">Top Strategy: ${traderType}</h4>
            <div class="ai-insight-card">
                <p><strong>Markets:</strong> ${markets.join(', ') || 'N/A'}</p>
                <p><strong>Strategies Used:</strong> ${strategies.join(', ') || 'N/A'}</p>
            </div>

            <div class="ai-claude-card" id="aiClaudeDnaCard">
                <h4>Claude Trading DNA</h4>
                <div class="ai-loading"><span></span></div>
            </div>

            <button onclick="aiCoach.generateWeeklyReview()"
                    style="width:100%;padding:12px;background:white;color:#059669;border:2px solid #059669;border-radius:8px;cursor:pointer;font-weight:600;margin-top:16px;">
                Generate Weekly Review
            </button>
        `;

        this.userProfile = { computed: true };
        this.loadClaudeDna(result);
    }

    async loadClaudeDna(result = this.analysisCache) {
        const card = document.getElementById('aiClaudeDnaCard');
        if (!card) return;
        const trades = this.getTradesForAPI();
        if (!trades.length) {
            card.innerHTML = '<h4>Claude Trading DNA</h4><p>Add trades to build a Claude-powered DNA profile.</p>';
            return;
        }

        try {
            const reply = await this.askClaude(
                `Build my Trading DNA from the attached trades. Include:
1. trader type
2. risk profile
3. strongest strategy or market
4. weakest behavior to fix
5. one concrete rule I should follow next session
Use actual numbers from my journal. Keep it concise.`,
                trades
            );
            card.innerHTML = `<h4>Claude Trading DNA</h4>${this.formatMessage(reply)}`;
        } catch (error) {
            card.innerHTML = `<h4>Claude Trading DNA</h4><p>${error.message || 'Claude DNA is not available right now.'}</p>`;
        }
    }
    
    displayProfile(profile, summary) {
        const content = document.getElementById('aiProfileContent');
        
        // Professional SVG icons for each trader type
        const traderTypeIcons = {
            'scalper': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="16" fill="#f0fdf4"/>
                <path d="M16 44L24 36L32 40L40 28L48 20" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="48" cy="20" r="4" fill="#059669"/>
                <path d="M44 20H48V24" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            'intraday': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="16" fill="#f0fdf4"/>
                <rect x="18" y="28" width="8" height="20" rx="2" fill="#10b981"/>
                <rect x="28" y="20" width="8" height="28" rx="2" fill="#059669"/>
                <rect x="38" y="32" width="8" height="16" rx="2" fill="#34d399"/>
            </svg>`,
            'swing': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="16" fill="#f0fdf4"/>
                <path d="M16 40C20 40 22 24 28 24C34 24 36 40 42 40C48 40 50 28 52 28" stroke="#059669" stroke-width="3" stroke-linecap="round"/>
                <circle cx="28" cy="24" r="3" fill="#10b981"/>
                <circle cx="42" cy="40" r="3" fill="#10b981"/>
            </svg>`,
            'positional': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="16" fill="#f0fdf4"/>
                <circle cx="32" cy="32" r="16" stroke="#059669" stroke-width="3" fill="none"/>
                <circle cx="32" cy="32" r="6" fill="#059669"/>
                <path d="M32 12V16M32 48V52M12 32H16M48 32H52" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
            </svg>`,
            'mixed': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="16" fill="#f0fdf4"/>
                <path d="M20 44L28 32L36 38L44 22" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="18" y="40" width="4" height="8" rx="1" fill="#10b981"/>
                <rect x="30" y="36" width="4" height="12" rx="1" fill="#34d399"/>
                <rect x="42" y="28" width="4" height="20" rx="1" fill="#059669"/>
            </svg>`,
            'default': `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" rx="16" fill="#f0fdf4"/>
                <path d="M16 44L24 36L32 28L40 32L48 20" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="24" cy="36" r="3" fill="#10b981"/>
                <circle cx="32" cy="28" r="3" fill="#10b981"/>
                <circle cx="40" cy="32" r="3" fill="#10b981"/>
            </svg>`
        };
        
        const riskColors = {
            'conservative': '#16a34a',
            'moderate': '#d97706',
            'aggressive': '#dc2626'
        };
        
        const stats = profile.statistics || {};
        
        let html = `
            <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 20px; text-transform: capitalize;">${profile.trader_type || 'Unknown'} Trader</h3>
                <p style="margin: 4px 0 0; opacity: 0.7; text-transform: capitalize; color: ${riskColors[profile.risk_profile] || '#6b7280'}">
                    ${profile.risk_profile || 'Moderate'} Risk Profile
                </p>
            </div>
            
            <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Current Stats
            </h4>
            <div class="ai-insight-card">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <small style="opacity: 0.7;">Total Trades</small>
                        <div style="font-size: 20px; font-weight: 600;">${stats.total_trades || 0}</div>
                    </div>
                    <div>
                        <small style="opacity: 0.7;">Win Rate</small>
                        <div style="font-size: 20px; font-weight: 600;">${stats.win_rate || 0}%</div>
                    </div>
                    <div>
                        <small style="opacity: 0.7;">Avg Win</small>
                        <div style="font-size: 20px; font-weight: 600; color: #16a34a;">
                            ₹${(stats.average_win || 0).toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <small style="opacity: 0.7;">Profit Factor</small>
                        <div style="font-size: 20px; font-weight: 600;">${(stats.profit_factor || 0).toFixed(2)}</div>
                    </div>
                </div>
            </div>
            
            <h4 style="margin: 20px 0 12px; display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 4h-8"/><path d="M12 12h8"/><path d="M12 16h6"/></svg>
                Preferences
            </h4>
            <div class="ai-insight-card">
                <p><strong>Markets:</strong> ${(profile.preferences?.favorite_markets || []).join(', ')}</p>
                <p><strong>Strategies:</strong> ${(profile.preferences?.favorite_strategies || []).join(', ')}</p>
                <p><strong>Risk Per Trade:</strong> ${profile.preferences?.risk_per_trade || 'Not set'}</p>
            </div>
            
            <button onclick="aiCoach.showPreTradeReminder()" 
                    style="width: 100%; padding: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                Pre-Trade Checklist
            </button>
            
            <button onclick="aiCoach.generateWeeklyReview()" 
                    style="width: 100%; padding: 12px; background: white; color: #059669; border: 2px solid #059669; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Generate Weekly Review
            </button>
        `;
        
        content.innerHTML = html;
    }
    
    renderBehavioralGauge(label, score) {
        const color = score > 60 ? '#dc2626' : score > 40 ? '#d97706' : '#16a34a';
        return `
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="font-size: 13px;">${label}</span>
                    <span style="font-size: 13px; font-weight: 600; color: ${color}">${score}%</span>
                </div>
                <div style="height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; width: ${score}%; background: ${color}; border-radius: 3px; transition: width 0.3s;"></div>
                </div>
            </div>
        `;
    }
    
    async showPreTradeReminder() {
        try {
            const response = await fetch(`${AI_API_BASE}/api/v2/pre-trade-check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: this.userId })
            });
            
            if (!response.ok) {
                throw new Error(await this.parseAIError(response, 'Failed to get reminder'));
            }
            
            const data = await response.json();
            this.updateWalletFromResponse(data);
            
            // Show as modal/popup
            alert(data.reminder.replace(/\*\*/g, '').replace(/•/g, '✓'));
        } catch (error) {
            alert(error.message || 'Pre-trade reminder is not available right now.');
        }
    }
    
    async generateWeeklyReview() {
        const rawTrades = getAllTrades();
        if (!rawTrades || rawTrades.length === 0) {
            alert('No trades to review. Add some trades first!');
            return;
        }

        const trades = this.getTradesForAPI();

        // Switch to chat tab and show loading
        this.switchTab('chat');
        this.addMessage('Generate my weekly review', 'user');

        const loadingId = 'loading-' + Date.now();
        const messagesDiv = document.getElementById('aiMessages');
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'ai-message coach';
        loadingMsg.id = loadingId;
        loadingMsg.innerHTML = '<div class="message-avatar">X</div><div class="ai-loading"><span></span></div>';
        messagesDiv.appendChild(loadingMsg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        try {
            const response = await fetch(`${AI_API_BASE}/api/v2/weekly-review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trades, user_id: this.userId })
            });

            if (!response.ok) {
                throw new Error(await this.parseAIError(response, 'Failed to generate review'));
            }

            const data = await response.json();
            this.updateWalletFromResponse(data);
            document.getElementById(loadingId)?.remove();
            this.addMessage(data.review, 'coach');
        } catch (error) {
            document.getElementById(loadingId)?.remove();
            this.addMessage(error.message || 'Could not generate weekly review right now.', 'coach');
        }
    }
    
    clearChatHistory() {
        // Clear chat history (useful for starting fresh)
        document.getElementById('aiMessages').innerHTML = '';
        this.chatHistory = [];
        this.showWelcomeMessage();
    }
    
    showWelcomeMessage() {
        const welcomeMsg = `Hey! I'm Xtin Journal AI, your personal trading coach. I analyze your complete trading history to understand your unique patterns, strengths, and areas for growth.

I remember your Trading DNA profile between sessions - your trader type, risk profile, and behavioral patterns. Ask me anything about your performance!`;
        this.addMessage(welcomeMsg, 'coach');
    }

    async analyzeAllTrades() {
        this.updateUsageBadge();

        const content = document.getElementById('aiInsightsContent');
        content.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="ai-loading"></div><p>Performing deep analysis with V2 AI...</p></div>';

        try {
            const trades = getAllTrades();
            
            console.log('=== TRADE ANALYSIS DEBUG ===');
            console.log('Total trades found:', trades?.length || 0);
            console.log('Raw trades data:', trades);
            
            if (!trades || trades.length === 0) {
                content.innerHTML = `
                    <div style="text-align: center; padding: 40px; opacity: 0.6;">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px; color: #9ca3af;">
                            <line x1="12" y1="20" x2="12" y2="10"/>
                            <line x1="18" y1="20" x2="18" y2="4"/>
                            <line x1="6" y1="20" x2="6" y2="16"/>
                        </svg>
                        <p style="font-size: 16px; margin-bottom: 10px;"><strong>No trades found</strong></p>
                        <p style="font-size: 14px;">Add some trades to your journal first, then come back here for AI-powered insights!</p>
                    </div>
                `;
                return;
            }

            // Transform trades from frontend format to backend format
            const transformedTrades = this.getTradesForAPI();

            console.log('Transformed trades:', transformedTrades);
            console.log('Total P&L (sum):', transformedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0));
            console.log('Wins:', transformedTrades.filter(t => t.profit_loss > 0).length);
            console.log('Losses:', transformedTrades.filter(t => t.profit_loss < 0).length);

            // Try V2 API first
            let response;
            let isV2 = true;
            try {
                console.log(`Attempting to fetch from: ${AI_API_BASE}/api/v2/analyze`);
                response = await fetch(`${AI_API_BASE}/api/v2/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: this.userId, trades: transformedTrades })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('V2 API error:', response.status, errorText);
                    throw new Error(`V2 API returned ${response.status}: ${errorText}`);
                }
            } catch (e) {
                console.log('V2 API not available, attempting V1 fallback:', e.message);
                isV2 = false;
                try {
                    response = await fetch(`${AI_API_BASE}/api/analyze`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ trades: transformedTrades })
                    });
                    if (!response.ok) {
                        throw new Error(`V1 API failed: ${response.status}`);
                    }
                } catch (v1Error) {
                    console.error('Both V2 and V1 APIs failed:', v1Error);
                    throw new Error(`Unable to connect to AI server at ${AI_API_BASE}. Ensure the backend is running.`);
                }
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Analysis failed:', response.status, errorText);
                throw new Error(`Analysis failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('=== BACKEND RESPONSE ===');
            console.log('Full response:', result);
            console.log('Analysis object:', result.analysis);
            console.log('Insights object:', result.insights);
            console.log('Issues:', result.insights?.issues);
            console.log('Strengths:', result.insights?.strengths);
            this.analysisCache = result;
            
            if (isV2) {
                this.displayAnalysisV2(result);
            } else {
                this.displayAnalysis(result);
            }
            this.loadClaudeInsights(result);
            
            // Also update behavioral alerts
            this.checkBehavioralAlerts();

        } catch (error) {
            console.error('=== ANALYSIS ERROR ===');
            console.error('Error details:', error);
            content.innerHTML = `
                <div class="ai-insight-card error">
                    <h4 style="display: flex; align-items: center; gap: 8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        AI Server Connection Error
                    </h4>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p style="margin-top: 12px; font-size: 13px; color: #666;">
                        <strong>Solution:</strong> 
                        <ul style="margin: 8px 0; padding-left: 20px;">
                            <li>Verify backend server is running and accessible</li>
                            <li>Check that the API endpoint is responding to requests</li>
                            <li>Ensure CORS is properly configured on the backend</li>
                        </ul>
                    </p>
                    <button onclick="aiCoach.analyzeAllTrades()" style="margin-top: 10px; padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
    }
    
    displayAnalysisV2(result) {
        const analysis = result.analysis || {};
        const insights = result.insights || {};
        const issues = insights.issues || [];
        const strengths = insights.strengths || [];
        
        console.log('=== DISPLAY ANALYSIS V2 ===');
        console.log('Analysis:', analysis);
        console.log('Issues count:', issues.length, 'Issues:', issues);
        console.log('Strengths count:', strengths.length, 'Strengths:', strengths);
        
        let html = `
            <h3 style="color: #059669; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Deep Performance Analysis <span style="font-size: 12px; background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; margin-left: 8px;">V2</span>
            </h3>
            
            <div class="ai-insight-card">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <small style="opacity: 0.7;">Win Rate</small>
                        <div class="metric-highlight">${((analysis.win_rate || 0) * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                        <small style="opacity: 0.7;">Total P&L</small>
                        <div class="metric-highlight ${(analysis.total_pnl || 0) >= 0 ? 'positive' : 'negative'}">
                            ₹${(analysis.total_pnl || 0).toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <small style="opacity: 0.7;">Profit Factor</small>
                        <div class="metric-highlight">${(analysis.profit_factor || 0).toFixed(2)}</div>
                    </div>
                    <div>
                        <small style="opacity: 0.7;">Expectancy</small>
                        <div class="metric-highlight">₹${(analysis.expectancy || 0).toFixed(0)}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Strengths section
        if (strengths && strengths.length > 0) {
            html += `
                <h4 style="margin-top: 25px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Your Strengths
                </h4>
            `;
            strengths.forEach((strength, idx) => {
                console.log(`Strength ${idx}:`, strength);
                html += `
                    <div class="ai-insight-card" style="background: #f0fdf4; border-color: #bbf7d0;">
                        <strong style="color: #16a34a;">${strength?.title || 'Strength'}</strong>
                        <p style="margin: 8px 0 0; opacity: 0.9;">${strength?.insight || 'Details not available'}</p>
                        <small style="opacity: 0.7;">${strength?.metric || ''}</small>
                    </div>
                `;
            });
        } else {
            html += `
                <h4 style="margin-top: 25px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Your Strengths
                </h4>
                <div class="ai-insight-card" style="background: #f0fdf4; border-color: #bbf7d0; opacity: 0.7;">
                    <p>No notable strengths detected yet. Keep trading to build a track record.</p>
                </div>
            `;
        }
        
        // Issues section
        html += `
            <h4 style="margin-top: 25px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                </svg>
                Areas to Improve (${issues.length})
            </h4>
        `;
        
        if (issues.length === 0) {
            html += '<div class="ai-insight-card" style="background: #f0fdf4;"><p style="display: flex; align-items: center; gap: 8px; color: #16a34a;">✓ Excellent! No critical issues detected in your trading.</p></div>';
        } else {
            issues.forEach(issue => {
                html += `
                    <div class="ai-insight-card ${issue.severity === 'high' ? 'error' : 'warning'}">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <strong>${issue.title}</strong>
                            <span class="severity-badge ${issue.severity}">${issue.severity}</span>
                        </div>
                        <p style="margin: 8px 0; opacity: 0.8;"><strong>Metric:</strong> ${issue.metric}</p>
                        <p style="margin: 8px 0; font-size: 14px;">${issue.insight}</p>
                        <p style="margin: 10px 0; background: white; padding: 10px; border-radius: 6px; display: flex; gap: 8px;">
                            <span style="color: #059669;">→</span>
                            <span><strong>Action:</strong> ${issue.action}</span>
                        </p>
                        ${issue.learning?.length ? `
                            <details style="margin-top: 10px;">
                                <summary style="cursor: pointer; opacity: 0.8; font-size: 13px;">Topics to study...</summary>
                                <ul style="margin-top: 8px; padding-left: 20px; font-size: 13px;">
                                    ${issue.learning.map(l => `<li>${l}</li>`).join('')}
                                </ul>
                            </details>
                        ` : ''}
                    </div>
                `;
            });
        }
        
        // Profile summary teaser
        if (result.profile_summary) {
            html += `
                <div class="ai-insight-card" style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-color: #10b981; margin-top: 20px;">
                    <h4 style="margin: 0 0 10px; display: flex; align-items: center; gap: 8px;">
                        🧬 Your Trading DNA Updated
                    </h4>
                    <p style="font-size: 14px; opacity: 0.9; margin: 0;">Your profile has been updated with this analysis. Check the DNA tab to see your trader type, behavioral patterns, and personalized strengths/weaknesses.</p>
                </div>
            `;
        }

        html += `
            <div class="ai-claude-card" id="aiClaudeInsightsCard">
                <h4>Claude Coach Read</h4>
                <div class="ai-loading"><span></span></div>
            </div>
        `;

        html += `
            <button onclick="aiCoach.analyzeAllTrades()" 
                    style="width: 100%; padding: 12px; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <polyline points="23 20 23 14 17 14"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
                Refresh Analysis
            </button>
        `;

        document.getElementById('aiInsightsContent').innerHTML = html;
    }

    async loadClaudeInsights(result = this.analysisCache) {
        const card = document.getElementById('aiClaudeInsightsCard');
        if (!card) return;
        const trades = this.getTradesForAPI();
        if (!trades.length) {
            card.innerHTML = '<h4>Claude Coach Read</h4><p>Add trades to get a Claude-powered insight summary.</p>';
            return;
        }

        try {
            const reply = await this.askClaude(
                `Analyze my trading journal and give me:
1. the most important performance insight
2. the biggest risk or behavioral issue
3. the best strategy or market from the data
4. one practical next action
Use actual numbers from my trades. Keep it concise and specific.`,
                trades
            );
            card.innerHTML = `<h4>Claude Coach Read</h4>${this.formatMessage(reply)}`;
        } catch (error) {
            card.innerHTML = `<h4>Claude Coach Read</h4><p>${error.message || 'Claude insights are not available right now.'}</p>`;
        }
    }

    displayAnalysis(result) {
        const { analysis, issues, improvement_plan } = result;
        
        let html = `
            <h3 style="color: #059669; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Performance Analysis
            </h3>
            
            <div class="ai-insight-card">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <small style="opacity: 0.7;">Win Rate</small>
                        <div class="metric-highlight">${(analysis.win_rate * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                        <small style="opacity: 0.7;">Total P&L</small>
                        <div class="metric-highlight ${analysis.total_pnl >= 0 ? 'positive' : 'negative'}">
                            ₹${analysis.total_pnl.toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <small style="opacity: 0.7;">Profit Factor</small>
                        <div class="metric-highlight">${analysis.profit_factor.toFixed(2)}</div>
                    </div>
                    <div>
                        <small style="opacity: 0.7;">Expectancy</small>
                        <div class="metric-highlight">₹${analysis.expectancy.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <h4 style="margin-top: 25px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Issues Found (${issues.length})
            </h4>
        `;

        if (issues.length === 0) {
            html += '<div class="ai-insight-card"><p style="display: flex; align-items: center; gap: 8px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Great! No major issues detected. Keep up the good work!</p></div>';
        } else {
            issues.forEach(issue => {
                html += `
                    <div class="ai-insight-card ${issue.severity === 'high' ? 'error' : 'warning'}">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <strong>${issue.issue}</strong>
                            <span class="severity-badge ${issue.severity}">${issue.severity}</span>
                        </div>
                        <p style="margin: 8px 0; opacity: 0.8;"><strong>Metric:</strong> ${issue.metric}</p>
                        <p style="margin: 8px 0; background: white; padding: 10px; border-radius: 6px; display: flex; gap: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="16" x2="12" y2="12"/>
                                <line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                            <span><strong>Fix:</strong> ${issue.fix}</span>
                        </p>
                        <details style="margin-top: 10px;">
                            <summary style="cursor: pointer; opacity: 0.8;">Learn more...</summary>
                            <ul style="margin-top: 8px; padding-left: 20px;">
                                ${issue.learning.map(l => `<li>${l}</li>`).join('')}
                            </ul>
                        </details>
                    </div>
                `;
            });
        }

        html += `
            <h4 style="margin-top: 25px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                Immediate Actions
            </h4>
            ${improvement_plan.immediate_actions.map(action => `
                <div class="ai-insight-card">
                    <p style="margin-bottom: 8px;"><strong>${action.issue}</strong></p>
                    <p style="opacity: 0.9;">→ ${action.action}</p>
                </div>
            `).join('')}

            <div class="learning-path">
                <h4 style="display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    Your Learning Path
                </h4>
                ${improvement_plan.skill_development.map(skill => `
                    <div class="learning-item">
                        <strong>${skill}</strong>
                        <p style="font-size: 13px; opacity: 0.8; margin-top: 4px;">
                            ${improvement_plan.learning_resources[skill]}
                        </p>
                    </div>
                `).join('')}
            </div>

            <button onclick="aiCoach.analyzeAllTrades()" 
                    style="width: 100%; padding: 12px; background: #059669; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 4 1 10 7 10"/>
                    <polyline points="23 20 23 14 17 14"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
                Refresh Analysis
            </button>
        `;

        document.getElementById('aiInsightsContent').innerHTML = html;
    }

    async sendMessage() {
        const input = document.getElementById('aiChatInput');
        const message = input.value.trim();
        
        if (!message) return;

        this.updateUsageBadge();

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show loading with typing indicator
        const loadingId = 'loading-' + Date.now();
        const messagesDiv = document.getElementById('aiMessages');
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'ai-message coach';
        loadingMsg.id = loadingId;
        loadingMsg.innerHTML = `
            <div class="message-avatar">X</div>
            <div class="ai-loading"><span></span></div>
        `;
        messagesDiv.appendChild(loadingMsg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        try {
            const transformedTrades = this.getTradesForAPI();
            
            console.log('Chat: Sending', transformedTrades.length, 'transformed trades');
            
            const reply = await this.askClaude(message, transformedTrades);
            
            // Remove loading and add response
            document.getElementById(loadingId)?.remove();
            this.addMessage(reply, 'coach');

        } catch (error) {
            console.error('Chat error:', error);
            document.getElementById(loadingId)?.remove();
            this.addMessage(error.message || 'Sorry, I encountered an error while using the AI service.', 'coach');
        }
    }

    addMessage(text, type, id = null) {
        // Keep a rolling transcript so the coach remembers the conversation
        // (chatHistory was previously declared but never filled — every
        // message used to be a blank-slate exchange).
        if (type === 'user' || type === 'coach') {
            this.chatHistory = this.chatHistory || [];
            this.chatHistory.push({
                role: type === 'user' ? 'user' : 'assistant',
                content: String(text || '').slice(0, 800)
            });
            if (this.chatHistory.length > 24) {
                this.chatHistory = this.chatHistory.slice(-20);
            }
        }

        const messagesDiv = document.getElementById('aiMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${type}`;
        if (id) messageDiv.id = id;
        
        // Format text with advanced styling
        const formattedText = this.formatMessage(text);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = formattedText;
        
        // Add avatar
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = type === 'coach' ? 'X' : 'You';
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    formatMessage(text) {
        if (!text) return '';
        
        let formatted = text;
        
        // Debug: log the incoming text to see what we're working with
        console.log('formatMessage input:', text.substring(0, 200));
        
        // First, handle numbered sections like "1. **Title** content" - these are section headers
        // The pattern: number, dot, space, **title**, optional content after
        formatted = formatted.replace(/^(\d+)\.\s*\*\*([^*]+)\*\*\s*/gm, (match, num, title) => {
            return `<h4 class="msg-section-title"><span class="section-number">${num}.</span> ${title}</h4><p class="msg-para">`;
        });
        
        // Handle standalone **bold** headings at start of line (whole line is bold)
        formatted = formatted.replace(/^##?\s*\*\*([^*]+)\*\*\s*$/gm, '<h4 class="msg-section-title">$1</h4>');
        formatted = formatted.replace(/^\*\*([^*]+)\*\*\s*$/gm, '<h4 class="msg-section-title">$1</h4>');
        
        // Handle markdown headers
        formatted = formatted.replace(/^###\s+(.+)$/gm, '<h5 class="msg-subheading">$1</h5>');
        formatted = formatted.replace(/^##\s+(.+)$/gm, '<h4 class="msg-section-title">$1</h4>');
        formatted = formatted.replace(/^#\s+(.+)$/gm, '<h3 class="msg-heading">$1</h3>');
        
        // Format remaining inline bold and italic
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Handle bullet points
        formatted = formatted.replace(/^[•\-]\s+(.+)$/gm, '<li class="msg-bullet">$1</li>');
        
        // Wrap consecutive <li> elements in <ul>
        formatted = formatted.replace(/(<li class="msg-bullet">.*?<\/li>\n?)+/gs, (match) => {
            return `<ul class="msg-list">${match}</ul>`;
        });
        
        // Handle line breaks - convert single newlines to <br>, but not after block elements
        formatted = formatted.replace(/(<\/h[345]>)\n/g, '$1');
        formatted = formatted.replace(/(<\/ul>)\n/g, '$1');
        formatted = formatted.replace(/(<\/li>)\n(?=<li)/g, '$1');
        
        // Convert remaining newlines
        formatted = formatted.replace(/\n\n+/g, '</p><p class="msg-para">');
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Wrap in paragraph if not already wrapped in block elements
        if (!formatted.startsWith('<h') && !formatted.startsWith('<ul') && !formatted.startsWith('<p')) {
            formatted = `<p class="msg-para">${formatted}</p>`;
        }
        
        // Clean up empty paragraphs and fix paragraph wrapping around block elements
        formatted = formatted.replace(/<p class="msg-para"><\/p>/g, '');
        formatted = formatted.replace(/<p class="msg-para">\s*(<h[345])/g, '$1');
        formatted = formatted.replace(/(<\/h[345]>)\s*<\/p>/g, '$1');
        formatted = formatted.replace(/<p class="msg-para">\s*(<ul)/g, '$1');
        formatted = formatted.replace(/(<\/ul>)\s*<\/p>/g, '$1');
        formatted = formatted.replace(/<p class="msg-para"><p class="msg-para">/g, '<p class="msg-para">');
        formatted = formatted.replace(/<\/p><\/p>/g, '</p>');
        
        // Format currency values to stand out (₹ and $ with numbers)
        formatted = formatted.replace(/(₹[\d,]+(?:\.\d{2})?)/g, '<span class="msg-currency">$1</span>');
        formatted = formatted.replace(/(\$[\d,]+(?:\.\d{2})?)/g, '<span class="msg-currency">$1</span>');
        
        // Format percentages to stand out
        formatted = formatted.replace(/(\d+\.?\d*%)/g, '<span class="msg-metric">$1</span>');
        
        console.log('formatMessage output:', formatted.substring(0, 300));
        
        return formatted;
    }
}

// Initialize AI Coach
window.AICoach = AICoach;
window.aiCoach = window.aiCoach || new AICoach();
var aiCoach = window.aiCoach;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => aiCoach.init());
} else {
    aiCoach.init();
}

// Helper function to get all trades from the journal
function getAllTrades() {
    // Read trades from localStorage using the same key as app.js
    try {
        const stored = localStorage.getItem('trading_journal_data');
        if (stored) {
            const data = JSON.parse(stored);
            console.log('Trades loaded from localStorage (trading_journal_data):', data);
            return data || [];
        }
    } catch (error) {
        console.error('Error reading trades from localStorage:', error);
    }
    
    // Fallback to global trades variable if it exists
    if (typeof trades !== 'undefined' && Array.isArray(trades)) {
        console.log('Fallback to global trades array:', trades);
        return trades;
    }
    
    console.log('No trades found in localStorage or global variable');
    return [];
}
