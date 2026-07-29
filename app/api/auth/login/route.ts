import { NextResponse } from "next/server";
import { checkDashboardPassword, createDashboardSessionToken, DASHBOARD_SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (typeof password !== "string" || !checkDashboardPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(DASHBOARD_SESSION_COOKIE, await createDashboardSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
