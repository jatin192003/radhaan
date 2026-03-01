import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signJWT, setAuthCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { successResponse, errorResponse, serverError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 422, parsed.error.flatten().fieldErrors);
        }

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return errorResponse("Invalid email or password", 401);
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return errorResponse("Invalid email or password", 401);
        }

        const token = await signJWT({ sub: user.id, email: user.email, role: user.role });
        await setAuthCookie(token);

        return successResponse(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            "Login successful"
        );
    } catch (e) {
        return serverError(e);
    }
}
