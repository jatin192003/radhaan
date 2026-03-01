const { z } = require("zod");

const createProductSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    categoryId: z.string().min(1),
    rentalPricePerDay: z.number().positive().optional().nullable(),
    purchasePrice: z.number().positive().optional().nullable(),
    deposit: z.number().min(0).optional().default(0),
    stock: z.number().int().min(0).optional().default(0),
    rentalEnabled: z.boolean().optional().default(false),
    purchaseEnabled: z.boolean().optional().default(true),
    sizeVariants: z.array(z.object({ size: z.string().min(1), stock: z.number().int().min(0) })).optional().default([]),
});

const payload = {
    title: "Test Lehenga",
    description: "A detailed description of this beautiful lehenga for testing",
    categoryId: "cm9abc123xyz456def",
    rentalEnabled: true,
    purchaseEnabled: false,
    rentalPricePerDay: 2500,
    purchasePrice: null,
    deposit: 5000,
    stock: 3,
    sizeVariants: [],
};

const result = createProductSchema.safeParse(payload);
if (result.success) {
    console.log("✅ Validation PASSES");
    console.log(JSON.stringify(result.data, null, 2));
} else {
    console.log("❌ Validation FAILS");
    console.log(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
}
