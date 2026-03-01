import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "radhaan-super-secret-change-in-production"
);

const COOKIE_NAME = "radhaan_token";
const EXPIRY = "7d";

export interface JWTPayload {
    sub: string;   // user id
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

/**
 * Sign a JWT token and return it as a string.
 */
export async function signJWT(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(EXPIRY)
        .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT string. Returns null if invalid.
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const sub = payload.sub;
        const email = payload["email"];
        const role = payload["role"];
        if (typeof sub !== "string" || typeof email !== "string" || typeof role !== "string") {
            return null;
        }
        return { sub, email, role, iat: payload.iat, exp: payload.exp };
    } catch {
        return null;
    }
}

/**
 * Set the auth cookie in the response.
 */
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: "/",
    });
}

/**
 * Clear the auth cookie.
 */
export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

/**
 * Get the authenticated user from the request.
 * First checks middleware-forwarded headers (x-user-id, x-user-role, x-user-email),
 * then falls back to reading and verifying the cookie directly.
 */
export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
    // Prefer headers set by middleware (already validated)
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    const userEmail = req.headers.get("x-user-email");

    if (userId && userRole && userEmail) {
        return { sub: userId, role: userRole, email: userEmail };
    }

    // Fallback: read cookie directly (for routes not covered by middleware)
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJWT(token);
}

/**
 * Get the authenticated user from the server-side cookie store.
 * Use this in Route Handlers that don't have direct access to NextRequest.
 */
export async function getAuthUserFromCookies(): Promise<JWTPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJWT(token);
}
