import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

// --- Cloudinary Config ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Prisma Config for v7 ---
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categoriesData = [
    { name: "Bridal Lehengas", slug: "bridal-lehengas", description: "Designer lehengas for your special day." },
    { name: "Sherwanis", slug: "sherwanis", description: "Royal sherwanis for grooms." },
    { name: "Party Wear", slug: "party-wear", description: "Elegant outfits for wedding guests." },
    { name: "Jewellery", slug: "jewellery", description: "Matching accessories and sets." },
];

const sampleProducts = [
    {
        title: "Sabyasachi Velvet Lehenga",
        description: "Deep red velvet lehenga with heavy zardozi embroidery, perfect for the classic Indian bride. Includes double dupatta.",
        categorySlug: "bridal-lehengas",
        rentalPricePerDay: 5000,
        purchasePrice: 150000,
        deposit: 15000,
        stock: 5,
        rentalEnabled: true,
        purchaseEnabled: true,
        averageRating: 4.8,
        totalReviews: 24,
        imageUrl: "https://placehold.co/1000x1500/f83b62/FFF.png?text=Sabyasachi+Lehenga",
    },
    {
        title: "Ivory Silk Sherwani",
        description: "Hand-crafted ivory raw silk sherwani with subtle gold thread work. Comes with matching churidar and comfortable inner lining.",
        categorySlug: "sherwanis",
        rentalPricePerDay: 3500,
        purchasePrice: 75000,
        deposit: 8000,
        stock: 8,
        rentalEnabled: true,
        purchaseEnabled: true,
        averageRating: 4.5,
        totalReviews: 12,
        imageUrl: "https://placehold.co/1000x1500/dd8e0e/FFF.png?text=Ivory+Sherwani",
    },
    {
        title: "Pastel Pink Anarkali",
        description: "Floor-length pastel pink anarkali suit with mirror work and gota patti detailing. Ideal for sangeet or mehendi ceremonies.",
        categorySlug: "party-wear",
        rentalPricePerDay: 2000,
        purchasePrice: 25000,
        deposit: 5000,
        stock: 12,
        rentalEnabled: true,
        purchaseEnabled: true,
        averageRating: 4.9,
        totalReviews: 38,
        imageUrl: "https://placehold.co/1000x1500/f83b62/FFF.png?text=Pink+Anarkali",
    },
    {
        title: "Kundan Choker Set",
        description: "Traditional Kundan and pearl choker necklace with matching earrings and maang tikka.",
        categorySlug: "jewellery",
        rentalPricePerDay: 1500,
        purchasePrice: null, // Rent only
        deposit: 4000,
        stock: 10,
        rentalEnabled: true,
        purchaseEnabled: false,
        averageRating: 4.6,
        totalReviews: 15,
        imageUrl: "https://placehold.co/1000x1000/dd8e0e/FFF.png?text=Choker+Set",
    },
];

const sizes = ["S", "M", "L", "XL"];

async function uploadToCloudinary(url: string, folder: string) {
    try {
        const result = await cloudinary.uploader.upload(url, {
            folder: `radhaan/${folder}`,
        });
        return { url: result.secure_url, publicId: result.public_id };
    } catch (error) {
        console.error(`Failed to upload image to Cloudinary: ${url}`);
        // If it fails, fallback to the original unsplash URL so the seed doesn't crash
        return { url, publicId: null };
    }
}

async function main() {
    console.log("🌱 Starting database seed...");

    // 1. Create Categories
    console.log("Creating categories...");
    const categoryMap = new Map();
    for (const cat of categoriesData) {
        const createdCat = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
            },
        });
        categoryMap.set(cat.slug, createdCat.id);
    }
    console.log(`✅ Created ${categoryMap.size} categories.`);

    // 2. Create Products
    console.log("Creating products and uploading images...");
    for (const prod of sampleProducts) {
        const categoryId = categoryMap.get(prod.categorySlug);

        if (!categoryId) {
            console.warn(`Category ${prod.categorySlug} not found. Skipping ${prod.title}`);
            continue;
        }

        // Check if product exists
        const existingProduct = await prisma.product.findFirst({
            where: { title: prod.title },
        });

        if (existingProduct) {
            console.log(`⏭️ Product "${prod.title}" already exists. Skipping.`);
            continue;
        }

        console.log(`Uploading image for "${prod.title}"...`);
        const { url: cloudinaryUrl, publicId } = await uploadToCloudinary(prod.imageUrl, "products");

        console.log(`Inserting product "${prod.title}"...`);
        const newProduct = await prisma.product.create({
            data: {
                title: prod.title,
                description: prod.description,
                categoryId: categoryId,
                rentalPricePerDay: prod.rentalPricePerDay,
                purchasePrice: prod.purchasePrice,
                deposit: prod.deposit,
                stock: prod.stock,
                rentalEnabled: prod.rentalEnabled,
                purchaseEnabled: prod.purchaseEnabled,
                averageRating: prod.averageRating,
                totalReviews: prod.totalReviews,
                // Create primary image inline
                images: {
                    create: {
                        url: cloudinaryUrl,
                        publicId: publicId,
                        isPrimary: true,
                    }
                },
                // Create size variants inline
                sizeVariants: {
                    create: sizes.map(size => ({
                        size,
                        stock: Math.floor(prod.stock / sizes.length) + (Math.random() > 0.5 ? 1 : 0),
                    }))
                }
            },
        });
        console.log(`✅ Created product "${newProduct.title}"`);
    }

    console.log("🎉 Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:");
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        pool.end();
    });
