import { NextResponse, type NextRequest } from "next/server";
import { DASHBOARD_SESSION_COOKIE, isValidDashboardSession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get(DASHBOARD_SESSION_COOKIE)?.value;
  if (await isValidDashboardSession(session)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|login).*)"],
};
