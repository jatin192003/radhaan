# Radhaan — Designer Wedding Wear Rental & Purchase Platform

A full-stack e-commerce platform for renting and purchasing designer Indian bridal and wedding wear, built with **Next.js 16**, **Prisma 7**, **PostgreSQL**, and **Cloudinary**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (via Prisma 7 + pg adapter) |
| ORM | Prisma |
| Auth | JWT (via `jose`) + HTTP-only cookies |
| Image Storage | Cloudinary |
| UI Animations | Framer Motion |
| State Management | TanStack Query (React Query v5) |

---

## Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** database (local or hosted, e.g. Neon, Supabase, Railway)
- **Cloudinary** account (free tier works)

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd radhaan
npm install
```

---

## 2. Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# JWT Secret — change this in production!
JWT_SECRET="your-super-secret-jwt-key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

> **Tip:** Copy `.env.example` if present, or create the file manually.

---

## 3. Database Setup

### Run Prisma Migrations

This will create all database tables:

```bash
npx prisma migrate dev --name init
```

Or if pushing to an existing DB without migration history:

```bash
npx prisma db push
```

### Generate Prisma Client

```bash
npx prisma generate
```

---

## 4. Seed the Database

The seed script creates 4 sample categories and 4 sample products, uploading images to Cloudinary automatically.

```bash
npx tsx scripts/seed.ts
```

**What it creates:**
- 🏷️ **4 Categories:** Bridal Lehengas, Sherwanis, Party Wear, Jewellery
- 👗 **4 Products:** Sabyasachi Velvet Lehenga, Ivory Silk Sherwani, Pastel Pink Anarkali, Kundan Choker Set
- 📸 Images are uploaded to your Cloudinary account under `radhaan/products/`

> The seed script is idempotent — running it multiple times won't duplicate data.

---

## 5. Create an Admin User

Run the admin creation script to set up an admin account:

```bash
npx tsx scripts/create-admin.ts
```

This creates (or promotes an existing user to):
- **Email:** `admin@radhaan.com`
- **Password:** `Admin@12345`

> ⚠️ **Change the password** after first login in a production environment.

To promote an existing user instead, just update the email in `scripts/create-admin.ts` before running.

---

## 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Running Commands Summary

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma db push` | Push schema to DB (no migration) |
| `npx prisma studio` | Open Prisma Studio (DB GUI) |
| `npx tsx scripts/seed.ts` | Seed sample categories & products |
| `npx tsx scripts/create-admin.ts` | Create/promote an admin user |

---

## Project Structure

```
radhaan/
├── app/
│   ├── api/             # API routes (REST endpoints)
│   │   ├── admin/       # Admin-only endpoints
│   │   ├── auth/        # Login, register, logout, me
│   │   ├── categories/  # Category listing
│   │   ├── products/    # Public product listing
│   │   └── orders/      # Order management
│   ├── admin/           # Admin panel pages
│   │   ├── products/    # Product list, add, edit
│   │   ├── orders/      # Order management
│   │   └── categories/  # Category management
│   ├── auth/            # Login & signup pages
│   └── shop/            # Public shop page
├── components/
│   ├── admin/           # Admin panel components
│   ├── home/            # Homepage section components
│   ├── layout/          # Navbar, Footer
│   ├── shop/            # Shop page components
│   └── ui/              # Reusable UI components
├── lib/
│   ├── api-client.ts    # Axios client with interceptors
│   ├── auth.ts          # JWT utilities
│   ├── db.ts            # Prisma client singleton
│   └── validations/     # Zod schemas
├── prisma/
│   └── schema.prisma    # Database schema
└── scripts/
    ├── seed.ts          # Database seeder
    └── create-admin.ts  # Admin user creator
```

---

## Admin Panel

Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin) after logging in with admin credentials.

**Features:**
- 📊 **Dashboard** — Revenue stats, order counts, analytics
- 📦 **Products** — Create, edit, delete products with image upload (Cloudinary)
- 🛒 **Orders** — View and update order statuses
- 🏷️ **Categories** — Manage product categories

---

## Notes

- Images are stored in Cloudinary. Without valid Cloudinary credentials, image uploads will fail.
- All admin API routes are protected by both JWT cookie auth and role checking.
- Products support both **rental** (per day pricing + deposit) and **purchase** modes.
