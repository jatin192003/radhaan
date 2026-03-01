import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse, notFound, serverError } from "@/lib/api-response";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);

        const startDateStr = searchParams.get("startDate");
        const endDateStr = searchParams.get("endDate");
        const sizeVariantId = searchParams.get("sizeVariantId");

        const product = await db.product.findFirst({
            where: { id, isDeleted: false, rentalEnabled: true },
        });

        if (!product) return notFound("Product");

        // Get all booked date ranges that overlap with the queried range
        const rentalBookings = await db.rentalBooking.findMany({
            where: {
                productId: id,
                ...(sizeVariantId ? { sizeVariantId } : {}),
            },
            select: { startDate: true, endDate: true, sizeVariantId: true },
        });

        // Get admin-blocked dates
        const blockedDates = await db.blockedDate.findMany({
            where: { productId: id },
            select: { date: true, reason: true },
        });

        // If specific dates are provided, check availability
        if (startDateStr && endDateStr) {
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return errorResponse("Invalid date format. Use ISO 8601.", 400);
            }

            if (startDate >= endDate) {
                return errorResponse("startDate must be before endDate", 400);
            }

            // Check for overlapping rentals
            const overlapping = rentalBookings.filter((booking) => {
                return startDate < booking.endDate && endDate > booking.startDate;
            });

            // Check for blocked dates
            const blockedInRange = blockedDates.filter((b) => {
                const d = new Date(b.date);
                return d >= startDate && d <= endDate;
            });

            const isAvailable = overlapping.length === 0 && blockedInRange.length === 0;
            const rentalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

            return successResponse({
                isAvailable,
                rentalDays,
                totalRentalCost: isAvailable ? rentalDays * (product.rentalPricePerDay || 0) : null,
                deposit: product.deposit,
                conflictingBookings: overlapping.length,
                blockedDatesInRange: blockedInRange.map((b) => b.date),
            });
        }

        // Without date params, return the full availability data
        return successResponse({
            bookedRanges: rentalBookings.map((b) => ({
                startDate: b.startDate,
                endDate: b.endDate,
                sizeVariantId: b.sizeVariantId,
            })),
            blockedDates: blockedDates.map((b) => ({ date: b.date, reason: b.reason })),
        });
    } catch (e) {
        return serverError(e);
    }
}
