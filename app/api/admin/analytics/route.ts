import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { unauthorized, forbidden, successResponse, serverError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return unauthorized();
        if (authUser.role !== "ADMIN") return forbidden();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            totalRevenue,
            rentalRevenue,
            purchaseRevenue,
            totalOrders,
            activeRentals,
            pendingReturns,
            topRentedItems,
            topSoldItems,
            monthlyTrends,
        ] = await Promise.all([
            // Total revenue from paid orders
            db.order.aggregate({
                where: { paymentStatus: "PAID" },
                _sum: { totalAmount: true },
            }),

            // Rental revenue
            db.order.aggregate({
                where: { paymentStatus: "PAID", orderType: { in: ["RENT", "MIXED"] } },
                _sum: { totalAmount: true },
            }),

            // Purchase revenue
            db.order.aggregate({
                where: { paymentStatus: "PAID", orderType: { in: ["PURCHASE", "MIXED"] } },
                _sum: { totalAmount: true },
            }),

            // Total order count
            db.order.count(),

            // Active rentals (DISPATCHED or DELIVERED, rental bookings pending return)
            db.rentalBooking.count({
                where: { returnStatus: "PENDING", order: { status: { in: ["DISPATCHED", "DELIVERED"] } } },
            }),

            // Pending returns (rental end date is overdue)
            db.rentalBooking.count({
                where: { returnStatus: "PENDING", endDate: { lt: now } },
            }),

            // Most rented products
            db.orderItem.groupBy({
                by: ["productId"],
                where: { type: "RENTAL" },
                _count: { productId: true },
                orderBy: { _count: { productId: "desc" } },
                take: 5,
            }),

            // Most sold products
            db.orderItem.groupBy({
                by: ["productId"],
                where: { type: "PURCHASE" },
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: "desc" } },
                take: 5,
            }),

            // Monthly trends — last 6 months
            db.order.groupBy({
                by: ["createdAt"],
                where: {
                    createdAt: {
                        gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
                    },
                    paymentStatus: "PAID",
                },
                _sum: { totalAmount: true },
                _count: { id: true },
            }),
        ]);

        // Enrich top rented/sold items with product titles
        const topRentedProductIds = topRentedItems.map((i) => i.productId);
        const topSoldProductIds = topSoldItems.map((i) => i.productId);

        const [topRentedProducts, topSoldProducts] = await Promise.all([
            db.product.findMany({
                where: { id: { in: topRentedProductIds } },
                select: { id: true, title: true },
            }),
            db.product.findMany({
                where: { id: { in: topSoldProductIds } },
                select: { id: true, title: true },
            }),
        ]);

        const topRented = topRentedItems.map((item) => ({
            product: topRentedProducts.find((p) => p.id === item.productId),
            rentalCount: item._count.productId,
        }));

        const topSold = topSoldItems.map((item) => ({
            product: topSoldProducts.find((p) => p.id === item.productId),
            soldCount: item._sum.quantity,
        }));

        return successResponse({
            revenue: {
                total: totalRevenue._sum.totalAmount ?? 0,
                rental: rentalRevenue._sum.totalAmount ?? 0,
                purchase: purchaseRevenue._sum.totalAmount ?? 0,
            },
            orders: {
                total: totalOrders,
                activeRentals,
                pendingReturns,
            },
            topRented,
            topSold,
            monthlyTrends,
        });
    } catch (e) {
        return serverError(e);
    }
}
