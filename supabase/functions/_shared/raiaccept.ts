// Shared RaiAccept (Raiffeisen Bank) payment gateway client.
// NEVER import this in frontend code — it uses merchant credentials.
//
// Flow per RaiAccept docs:
//   1. getAuthToken()        -> Amazon Cognito IdToken
//   2. createOrder()         -> orderIdentification
//   3. createCheckout()      -> paymentRedirectURL
//   4. getOrder()            -> final status verification (webhook)

const COGNITO_CLIENT_ID = "kr2gs4117arvbnaperqff5dml"; // fixed value from RaiAccept docs
const AUTH_URL = "https://authenticate.raiaccept.com";
const API_BASE = "https://trapi.raiaccept.com";

export interface RaiConsumer {
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
  ipAddress?: string;
}

export interface RaiBillingAddress {
  firstName: string;
  lastName: string;
  addressStreet1: string;
  city: string;
  postalCode: string;
  country: string; // ISO-3, e.g. XKX, ALB
}

export interface RaiItem {
  description: string;
  numberOfItems: number;
  price: number;
}

export interface RaiInvoice {
  amount: number;
  currency: string;
  description: string;
  merchantOrderReference: string;
  items: RaiItem[];
}

export interface RaiUrls {
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  notificationUrl: string;
}

export interface RaiOrderPayload {
  consumer: RaiConsumer;
  billingAddress: RaiBillingAddress;
  invoice: RaiInvoice;
  paymentMethodPreference: "CARD";
  recurring: { recurringModel: "NONE" };
  urls: RaiUrls;
}

/** Step 1 — authenticate with Amazon Cognito and return the IdToken. */
export async function getAuthToken(): Promise<string> {
  const username = Deno.env.get("RAIACCEPT_USERNAME");
  const password = Deno.env.get("RAIACCEPT_PASSWORD");
  if (!username || !password) {
    throw new Error("RAIACCEPT_USERNAME / RAIACCEPT_PASSWORD are not configured");
  }

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
    },
    body: JSON.stringify({
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: { USERNAME: username, PASSWORD: password },
      ClientId: COGNITO_CLIENT_ID,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`RaiAccept auth failed (${res.status}): ${data?.message || JSON.stringify(data)}`);
  }
  const token = data?.AuthenticationResult?.IdToken;
  if (!token) throw new Error("RaiAccept auth: missing IdToken in response");
  return token;
}

/** Step 2 — create an order entry, returns the orderIdentification. */
export async function createOrder(idToken: string, payload: RaiOrderPayload): Promise<string> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`RaiAccept createOrder failed (${res.status}): ${JSON.stringify(data)}`);
  }
  const id = data?.orderIdentification;
  if (!id) throw new Error("RaiAccept createOrder: missing orderIdentification");
  return id;
}

/** Step 3 — create a payment/checkout session, returns paymentRedirectURL. */
export async function createCheckout(
  idToken: string,
  orderIdentification: string,
  payload: RaiOrderPayload,
): Promise<string> {
  const res = await fetch(`${API_BASE}/orders/${orderIdentification}/checkout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`RaiAccept checkout failed (${res.status}): ${JSON.stringify(data)}`);
  }
  const url = data?.paymentRedirectURL;
  if (!url) throw new Error("RaiAccept checkout: missing paymentRedirectURL");
  return url;
}

/** Step 5 — fetch order details to verify the final status. */
export async function getOrder(idToken: string, orderIdentification: string): Promise<{ status: string; raw: unknown }> {
  const res = await fetch(`${API_BASE}/orders/${orderIdentification}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`RaiAccept getOrder failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return { status: String(data?.status ?? "").toUpperCase(), raw: data };
}
