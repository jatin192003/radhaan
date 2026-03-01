import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signJWT, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import { successResponse, errorResponse, serverError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 422, parsed.error.flatten().fieldErrors);
        }

        const { name, email, password, phone } = parsed.data;

        const existing = await db.user.findUnique({ where: { email } });
        if (existing) {
            return errorResponse("Email already registered", 409);
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await db.user.create({
            data: { name, email, passwordHash, phone, role: "USER" },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        const token = await signJWT({ sub: user.id, email: user.email, role: user.role });
        await setAuthCookie(token);

        return successResponse(user, "Account created successfully", 201);
    } catch (e) {
        return serverError(e);
    }
}
