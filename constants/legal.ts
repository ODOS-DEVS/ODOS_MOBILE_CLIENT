import { API_BASE_URL } from "@/constants/auth";

/**
 * Legal and support content shown in-app.
 *
 * The authoritative versions are the hosted pages the App Store listing points
 * at — `/privacy`, `/terms` and `/support`, served by
 * `app/routes/public_pages.py` in the backend. A reviewer reads both, so the
 * two must agree: wording here is a faithful condensation of those pages, not
 * a second draft. **If you change one, change the other.**
 *
 * Every screen links out to the canonical page so there is always one place
 * that wins.
 */

/**
 * Both must match the backend's addresses in `app/routes/public_pages.py`, so
 * the in-app route and the hosted page reach the same monitored inbox.
 *
 * Split by purpose rather than pointed at one address: a question about an
 * order and a question about the privacy policy want different people, and a
 * reviewer checking the Support URL should not land in a legal inbox.
 */
export const SUPPORT_EMAIL = "odos.support@gmail.com";
export const LEGAL_EMAIL = "odos.infos@gmail.com";

/** The hosted pages sit next to the API, one host and one certificate. */
export const WEB_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const PRIVACY_URL = `${WEB_BASE_URL}/privacy`;
export const TERMS_URL = `${WEB_BASE_URL}/terms`;
export const SUPPORT_URL = `${WEB_BASE_URL}/support`;

/** Bump whenever the policy text changes, here and on the hosted pages. */
export const POLICY_LAST_UPDATED = "October 22, 2026";

export type PolicySection = {
  heading: string;
  /** Prose paragraphs. */
  body?: string[];
  /** Bulleted points, rendered after any prose. */
  points?: string[];
};

export type PolicyDoc = {
  key: "terms" | "privacy";
  tabLabel: string;
  title: string;
  lede: string;
  canonicalUrl: string;
  sections: PolicySection[];
};

export const POLICY_DOCS: PolicyDoc[] = [
  {
    key: "terms",
    tabLabel: "Terms",
    title: "Terms of Service",
    lede: "The agreement between you, ODOS, and the sellers on it.",
    canonicalUrl: TERMS_URL,
    sections: [
      {
        heading: "What ODOS is",
        body: [
          "ODOS is a marketplace. Independent sellers list and sell their own products, and each one fulfils and delivers the orders they receive.",
          "Your purchase contract for the goods is with the seller. ODOS runs the platform, handles payment, and holds both sides to the rules below.",
        ],
      },
      {
        heading: "Your account",
        body: [
          "Keep your sign-in details to yourself and give accurate information, particularly your delivery address and phone number. You can delete your account from the app at any time.",
        ],
      },
      {
        heading: "Orders and payment",
        body: [
          "An order total is calculated on our servers at checkout and is what you are charged. One order may include items from several sellers; each part is fulfilled and delivered separately by the seller concerned.",
          "You confirm delivery yourself. A seller cannot mark your order delivered on your behalf, and a seller is only paid once delivery is confirmed, automatically released after the stated window, or resolved by us where there is a dispute.",
        ],
      },
      {
        heading: "Returns and refunds",
        body: [
          "Eligible items may be returned within the stated period in the condition described. Refunds are issued to the original payment method or to your ODOS wallet once a return is verified.",
        ],
      },
      {
        // Points became redeemable for wallet credit, which makes them stored
        // value rather than a scoreboard. Terms that said nothing about them
        // left a cash-convertible balance with no rules attached.
        heading: "Loyalty points and your wallet",
        body: [
          "Points are earned on delivered orders, at the rate shown in the app, and are calculated on the goods total rather than on delivery. They have no cash value on their own.",
          "Points can be redeemed for ODOS wallet credit in whole cedis. Wallet credit is spent in the app and cannot be withdrawn. If an order is refunded, the points it earned are reversed in proportion to the refund.",
        ],
      },
      {
        heading: "If you sell on ODOS",
        points: [
          "Describe what you sell accurately, and keep stock and prices current.",
          "Fulfil the orders you accept, and handle returns within the stated terms.",
          "You arrange delivery and keep the delivery fee.",
          "Commission is deducted from your settlement at the rate shown in your seller wallet.",
          "We may suspend a shop that repeatedly fails these.",
        ],
      },
      {
        heading: "Acceptable use",
        points: [
          "Don't list illegal or counterfeit goods.",
          "Don't misrepresent what you are selling.",
          "Don't interfere with the service.",
          "Don't attempt to access accounts that are not yours.",
        ],
      },
      {
        heading: "Changes to these terms",
        body: [
          "These terms may change as the service does. Continuing to use ODOS after a change means you accept the revised terms.",
        ],
      },
    ],
  },
  {
    key: "privacy",
    tabLabel: "Privacy",
    title: "Privacy Policy",
    lede: "What ODOS collects, why, and what you can do about it.",
    canonicalUrl: PRIVACY_URL,
    sections: [
      {
        heading: "What we collect",
        points: [
          "Account details — your name, email and phone number, so you can sign in and so sellers can reach you about an order.",
          "Delivery addresses — so orders can reach you.",
          "Orders and payments — what you bought, from whom, and whether payment succeeded.",
          "How you use the app — products viewed and searched, used to improve what we recommend. You can turn personalisation off.",
          "Location — only if you allow it, to estimate delivery and, for sellers, to place a shop on a map. The app works without it.",
        ],
      },
      {
        heading: "What we don't do",
        body: [
          "We do not sell your personal information, and we do not use it for advertising outside ODOS.",
        ],
      },
      {
        heading: "Who else sees it",
        points: [
          "Sellers you buy from — your name, delivery address and phone number, so they can deliver the order. Nothing else.",
          "Payment providers — to take payment and issue refunds. Card details are handled by the provider and never stored by us.",
          "Messaging and email providers — to send verification codes, receipts and order updates.",
        ],
      },
      {
        // The hosted page has carried this section for a while; the in-app
        // condensation had dropped it, leaving the two out of sync on the one
        // part of a privacy policy a reader can actually act on.
        heading: "Your choices",
        points: [
          "Edit or correct your details in the app at any time.",
          "Turn off personalisation, analytics and each type of notification separately.",
          "Delete your account. Your personal details are removed; past orders are kept without your name, because they are also the seller's record of the sale and are required for tax and accounting.",
        ],
      },
      {
        heading: "Keeping it safe",
        body: [
          "Traffic is encrypted in transit. Passwords are stored hashed, never in a form we can read. Access to production data is limited to what operating the service requires.",
        ],
      },
      {
        heading: "Children",
        body: [
          "ODOS is not intended for children under 13, and we do not knowingly collect their information.",
        ],
      },
    ],
  },
];

/**
 * The controls behind the "Your data" tab. A policy that only describes
 * collection is half a policy — these are the rows that let someone act on it,
 * including the account deletion App Store Guideline 5.1.1(v) requires.
 */
export type DataControl = {
  icon: "person-outline" | "notifications-outline" | "options-outline" | "trash-outline";
  label: string;
  description: string;
  href: string;
  destructive?: boolean;
};

export const DATA_CONTROLS: DataControl[] = [
  {
    icon: "person-outline",
    label: "View and correct your details",
    description: "Name, phone, email and date of birth.",
    href: "/(root)/screens/profileScreens/CustomerProfile",
  },
  {
    icon: "notifications-outline",
    label: "Choose what you're notified about",
    description: "Order updates, deals and account alerts, each separately.",
    href: "/(root)/screens/profileScreens/personalization/Notification",
  },
  {
    icon: "options-outline",
    label: "Turn off personalisation",
    description: "Stop using your browsing to shape recommendations.",
    href: "/(root)/screens/profileScreens/personalization/Preferences",
  },
  {
    icon: "trash-outline",
    label: "Delete your account",
    description: "Permanent. The screen shows what is removed before you confirm.",
    href: "/(root)/screens/profileScreens/Account/DeleteAccount",
    destructive: true,
  },
];

export const DELETION_NOTE = {
  title: "What deletion keeps",
  body: "Your personal details are removed. Past orders are kept without your name, because they are also the seller's record of the sale and are required for tax and accounting. Deletion is not possible while an order is still in progress or while money remains in your wallet — the app will tell you which applies.",
};
