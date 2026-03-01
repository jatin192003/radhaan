import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";

const COOKIE_NAME = "radhaan_token";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Routes that require authentication (but not admin)
    const protectedPaths = ["/api/user", "/api/cart", "/api/orders"];

    // Routes that require ADMIN role
    const adminPaths = ["/api/admin"];

    const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
    const isAdmin = adminPaths.some((p) => pathname.startsWith(p));

    if (!isProtected && !isAdmin) {
        return NextResponse.next();
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload) {
        return NextResponse.json(
            { success: false, error: "Invalid or expired token" },
            { status: 401 }
        );
    }

    if (isAdmin && payload.role !== "ADMIN") {
        return NextResponse.json(
            { success: false, error: "Forbidden — Admin access required" },
            { status: 403 }
        );
    }

    // Attach user info to headers for downstream use
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload.sub);
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-user-email", payload.email);

    return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
    matcher: ["/api/user/:path*", "/api/cart/:path*", "/api/orders/:path*", "/api/admin/:path*"],
};
