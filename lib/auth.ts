export const DASHBOARD_SESSION_COOKIE = "dashboard_session";

async function hmacHex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export function checkDashboardPassword(candidate: string): boolean {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return false;
  return timingSafeEqualStr(candidate, expected);
}

/** Derived from the shared password so the cookie value never contains the password itself. */
export function createDashboardSessionToken(): Promise<string> {
  return hmacHex(process.env.DASHBOARD_PASSWORD!, "typical-dashboard-session");
}

export async function isValidDashboardSession(token: string | undefined): Promise<boolean> {
  if (!token || !process.env.DASHBOARD_PASSWORD) return false;
  const expected = await hmacHex(process.env.DASHBOARD_PASSWORD, "typical-dashboard-session");
  return timingSafeEqualStr(token, expected);
}
