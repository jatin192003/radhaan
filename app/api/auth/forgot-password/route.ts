import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { db } from "@/lib/db";
import { successResponse, errorResponse, serverError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = forgotPasswordSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse("Validation error", 422, parsed.error.flatten().fieldErrors);
        }

        const { email } = parsed.data;

        // Check if user exists
        const user = await db.user.findUnique({ where: { email } });

        // Always return success to avoid email enumeration — even if user doesn't exist
        if (!user) {
            return successResponse(
                null,
                "If that email is registered, a reset link has been sent."
            );
        }

        // TODO: Implement actual email sending with reset token in Phase 2
        // For now, just acknowledge the request.

        return successResponse(
            null,
            "If that email is registered, a reset link has been sent."
        );
    } catch (e) {
        return serverError(e);
    }
}
