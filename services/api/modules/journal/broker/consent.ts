// The wording a customer accepts when linking their broker account. The
// version is saved with each link, so a change of wording is a new version and
// existing consents stay traceable to the text they agreed to.
//
// DRAFT: the final wording is to be agreed with the broker (their consent and
// data-protection requirements); bump the version when it is.
export const CONSENT_VERSION = "draft-1";

/**
 * Whether a link was consented to under the wording in force now. When the wording changes,
 * links consented under the old one are paused until the customer confirms the new one.
 */
export const consentIsCurrent = (link: { consent_version: string }) => link.consent_version === CONSENT_VERSION;

export const CONSENT_TEXT =
    "I allow Xtin Capital to read my executed trades, orders and positions from my broker account so they appear in my Xtin Journal. " +
    "This access is read-only: Xtin Capital cannot place, change or cancel orders and never sees my broker password. " +
    "I can disconnect at any time, and I can ask for the data that was synced to be deleted.";
