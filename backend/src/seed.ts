import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/User";
import Categories from "./models/Categories";
import Brand from "./models/Brand";
import Product from "./models/Product";
import Inventory from "./models/Inventory";
import StoreSettings from "./models/StoreSettings";
import Coupon from "./models/Coupon";
import Tax from "./models/Tax";
import Charge from "./models/Charge";
import NotificationPreferences from "./models/NotificationPreferences";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL || "YOUR_MONGO_URI";

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // ===== USERS =====
        const existingAdmin = await User.findOne({ email: "admin@mern-ekart.com" });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            await User.create({
                name: "Admin",
                email: "admin@mern-ekart.com",
                password: hashedPassword,
                role: "admin",
                isVerified: true,
            });
            console.log("Admin user created (admin@mern-ekart.com / admin123)");
        } else {
            console.log("Admin user already exists");
        }

        const existingUser = await User.findOne({ email: "user@mern-ekart.com" });
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash("user1234", 10);
            await User.create({
                name: "John Doe",
                email: "user@mern-ekart.com",
                password: hashedPassword,
                role: "user",
                isVerified: true,
            });
            console.log("Test user created (user@mern-ekart.com / user1234)");
        } else {
            console.log("Test user already exists");
        }

        // ===== CATEGORIES =====
        const categoryData = [
            { name: "Electronics", slug: "electronics", description: "Gadgets, phones, laptops and more", isActive: true },
            { name: "Clothing", slug: "clothing", description: "Men and women fashion", isActive: true },
            { name: "Home & Kitchen", slug: "home-kitchen", description: "Appliances and home essentials", isActive: true },
            { name: "Sports & Outdoors", slug: "sports-outdoors", description: "Fitness and outdoor gear", isActive: true },
            { name: "Books", slug: "books", description: "Fiction, non-fiction, and educational", isActive: true },
            { name: "Beauty & Personal Care", slug: "beauty-personal-care", description: "Skincare, makeup, grooming", isActive: true },
        ];

        const categories: any[] = [];
        for (const cat of categoryData) {
            const existing = await Categories.findOne({ slug: cat.slug });
            if (!existing) {
                const created = await Categories.create(cat);
                categories.push(created);
            } else {
                categories.push(existing);
            }
        }
        console.log(`${categories.length} categories ready`);

        // ===== BRANDS =====
        const brandData = [
            { name: "Apple", slug: "apple", isActive: true },
            { name: "Samsung", slug: "samsung", isActive: true },
            { name: "Nike", slug: "nike", isActive: true },
            { name: "Sony", slug: "sony", isActive: true },
            { name: "Adidas", slug: "adidas", isActive: true },
            { name: "LG", slug: "lg", isActive: true },
            { name: "Puma", slug: "puma", isActive: true },
            { name: "Boat", slug: "boat", isActive: true },
        ];

        const brands: any[] = [];
        for (const b of brandData) {
            const existing = await Brand.findOne({ slug: b.slug });
            if (!existing) {
                const created = await Brand.create(b);
                brands.push(created);
            } else {
                brands.push(existing);
            }
        }
        console.log(`${brands.length} brands ready`);

        // ===== PRODUCTS =====
        const electronics = categories.find((c) => c.slug === "electronics");
        const clothing = categories.find((c) => c.slug === "clothing");
        const homeKitchen = categories.find((c) => c.slug === "home-kitchen");
        const sports = categories.find((c) => c.slug === "sports-outdoors");

        const apple = brands.find((b) => b.slug === "apple");
        const samsung = brands.find((b) => b.slug === "samsung");
        const nike = brands.find((b) => b.slug === "nike");
        const sony = brands.find((b) => b.slug === "sony");
        const adidas = brands.find((b) => b.slug === "adidas");
        const lg = brands.find((b) => b.slug === "lg");
        const puma = brands.find((b) => b.slug === "puma");
        const boat = brands.find((b) => b.slug === "boat");

        const productData = [
            {
                name: "iPhone 15 Pro Max",
                description: "The most powerful iPhone ever with A17 Pro chip, titanium design, and 48MP camera system.",
                price: 1199,
                salesPrice: 1099,
                discountPercentage: 8,
                category: electronics._id,
                brand: apple._id,
                images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
                stock: 50,
                isFeatured: true,
            },
            {
                name: "Samsung Galaxy S24 Ultra",
                description: "Galaxy AI powered smartphone with S Pen, 200MP camera, and titanium frame.",
                price: 1299,
                salesPrice: 1199,
                discountPercentage: 7,
                category: electronics._id,
                brand: samsung._id,
                images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500",
                stock: 35,
                isFeatured: true,
            },
            {
                name: "MacBook Air M3",
                description: "Supercharged by M3 chip. Up to 18 hours battery life. Fanless design.",
                price: 1099,
                category: electronics._id,
                brand: apple._id,
                images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
                stock: 25,
                isFeatured: true,
            },
            {
                name: "Sony WH-1000XM5 Headphones",
                description: "Industry-leading noise cancellation with exceptional sound quality and 30-hour battery.",
                price: 349,
                salesPrice: 299,
                discountPercentage: 14,
                category: electronics._id,
                brand: sony._id,
                images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500",
                stock: 80,
                isFeatured: true,
            },
            {
                name: "Nike Air Max 270",
                description: "Iconic lifestyle shoe with Max Air unit for all-day comfort.",
                price: 150,
                salesPrice: 120,
                discountPercentage: 20,
                category: sports._id,
                brand: nike._id,
                images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
                stock: 100,
                isFeatured: true,
            },
            {
                name: "Adidas Ultraboost 23",
                description: "Premium running shoe with BOOST midsole for incredible energy return.",
                price: 190,
                salesPrice: 160,
                discountPercentage: 15,
                category: sports._id,
                brand: adidas._id,
                images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
                stock: 60,
                isFeatured: true,
            },
            {
                name: "Samsung 55\" 4K Smart TV",
                description: "Crystal UHD display with smart TV features and Alexa built-in.",
                price: 499,
                salesPrice: 449,
                discountPercentage: 10,
                category: homeKitchen._id,
                brand: samsung._id,
                images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500",
                stock: 20,
                isFeatured: false,
            },
            {
                name: "LG Front Load Washing Machine",
                description: "AI-powered washing machine with steam technology and TurboWash.",
                price: 799,
                category: homeKitchen._id,
                brand: lg._id,
                images: ["https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500",
                stock: 15,
                isFeatured: false,
            },
            {
                name: "Nike Dri-FIT Running T-Shirt",
                description: "Lightweight, breathable running tee with sweat-wicking technology.",
                price: 45,
                salesPrice: 35,
                discountPercentage: 22,
                category: clothing._id,
                brand: nike._id,
                images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
                stock: 200,
                isFeatured: false,
            },
            {
                name: "Boat Airdopes 141",
                description: "True wireless earbuds with 42H playtime, low latency mode, and IPX4 water resistance.",
                price: 29,
                salesPrice: 19,
                discountPercentage: 34,
                category: electronics._id,
                brand: boat._id,
                images: ["https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500",
                stock: 300,
                isFeatured: true,
            },
            {
                name: "Apple Watch Series 9",
                description: "Advanced health features, always-on display, and carbon neutral options.",
                price: 399,
                salesPrice: 369,
                discountPercentage: 7,
                category: electronics._id,
                brand: apple._id,
                images: ["https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500",
                stock: 40,
                isFeatured: true,
            },
            {
                name: "Sony PlayStation 5",
                description: "Next-gen gaming console with ultra-high speed SSD and ray tracing.",
                price: 499,
                category: electronics._id,
                brand: sony._id,
                images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500",
                stock: 10,
                isFeatured: false,
            },
            {
                name: "Samsung Galaxy Buds2 Pro",
                description: "Premium wireless earbuds with intelligent ANC and 360 Audio.",
                price: 229,
                salesPrice: 179,
                discountPercentage: 22,
                category: electronics._id,
                brand: samsung._id,
                images: ["https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500",
                stock: 90,
                isFeatured: false,
            },
            {
                name: "Nike Air Force 1",
                description: "Classic basketball shoe turned streetwear icon. Timeless design with Air cushioning.",
                price: 110,
                category: clothing._id,
                brand: nike._id,
                images: ["https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500",
                stock: 150,
                isFeatured: false,
            },
            {
                name: "Adidas Originals Hoodie",
                description: "Soft fleece hoodie with iconic trefoil logo. Perfect for casual wear.",
                price: 75,
                salesPrice: 59,
                discountPercentage: 21,
                category: clothing._id,
                brand: adidas._id,
                images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
                stock: 120,
                isFeatured: false,
            },
            {
                name: "Puma RS-X Sneakers",
                description: "Retro-inspired running shoes with chunky sole and bold colorway.",
                price: 120,
                salesPrice: 95,
                discountPercentage: 20,
                category: sports._id,
                brand: puma._id,
                images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
                stock: 70,
                isFeatured: false,
            },
            {
                name: "Apple iPad Air M2",
                description: "Powerful and versatile tablet with M2 chip, Liquid Retina display, and Apple Pencil support.",
                price: 599,
                category: electronics._id,
                brand: apple._id,
                images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
                stock: 30,
                isFeatured: true,
            },
            {
                name: "Samsung Galaxy Tab S9",
                description: "Premium Android tablet with AMOLED display and S Pen included.",
                price: 849,
                salesPrice: 749,
                discountPercentage: 12,
                category: electronics._id,
                brand: samsung._id,
                images: ["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500",
                stock: 20,
                isFeatured: false,
            },
            {
                name: "LG 27\" 4K Monitor",
                description: "Ultra-sharp 4K IPS monitor with HDR10 and USB-C connectivity for professionals.",
                price: 449,
                salesPrice: 399,
                discountPercentage: 11,
                category: electronics._id,
                brand: lg._id,
                images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500",
                stock: 25,
                isFeatured: false,
            },
            {
                name: "Nike Yoga Mat Premium",
                description: "Extra thick 6mm yoga mat with non-slip surface and carrying strap.",
                price: 68,
                salesPrice: 52,
                discountPercentage: 23,
                category: sports._id,
                brand: nike._id,
                images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
                stock: 200,
                isFeatured: false,
            },
            {
                name: "Sony SRS-XB100 Speaker",
                description: "Compact portable Bluetooth speaker with extra bass and IP67 waterproof rating.",
                price: 59,
                salesPrice: 45,
                discountPercentage: 24,
                category: electronics._id,
                brand: sony._id,
                images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
                stock: 150,
                isFeatured: false,
            },
            {
                name: "Adidas Running Shorts",
                description: "Lightweight running shorts with moisture-wicking AEROREADY technology.",
                price: 40,
                salesPrice: 32,
                discountPercentage: 20,
                category: clothing._id,
                brand: adidas._id,
                images: ["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500",
                stock: 180,
                isFeatured: false,
            },
            {
                name: "Boat Rockerz 450 Headphones",
                description: "Over-ear wireless headphones with 40mm drivers and 15-hour battery life.",
                price: 39,
                salesPrice: 29,
                discountPercentage: 25,
                category: electronics._id,
                brand: boat._id,
                images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                stock: 250,
                isFeatured: false,
            },
            {
                name: "LG Air Purifier",
                description: "Smart air purifier with HEPA filter, covers up to 500 sq ft. App controlled.",
                price: 299,
                salesPrice: 249,
                discountPercentage: 17,
                category: homeKitchen._id,
                brand: lg._id,
                images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500",
                stock: 30,
                isFeatured: false,
            },
            {
                name: "Puma Training Backpack",
                description: "Durable gym backpack with shoe compartment and water bottle pocket.",
                price: 55,
                salesPrice: 42,
                discountPercentage: 24,
                category: sports._id,
                brand: puma._id,
                images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
                stock: 100,
                isFeatured: false,
            },
            {
                name: "Apple AirPods Pro 2",
                description: "Active noise cancellation, adaptive transparency, and personalized spatial audio.",
                price: 249,
                salesPrice: 199,
                discountPercentage: 20,
                category: electronics._id,
                brand: apple._id,
                images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500",
                stock: 75,
                isFeatured: true,
            },
            {
                name: "Samsung Galaxy Watch 6",
                description: "Advanced health monitoring with BIA sensor, sleep coaching, and sapphire crystal.",
                price: 329,
                salesPrice: 279,
                discountPercentage: 15,
                category: electronics._id,
                brand: samsung._id,
                images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
                stock: 45,
                isFeatured: false,
            },
            {
                name: "Nike Windrunner Jacket",
                description: "Iconic running jacket with chevron design and water-repellent finish.",
                price: 100,
                salesPrice: 79,
                discountPercentage: 21,
                category: clothing._id,
                brand: nike._id,
                images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500",
                stock: 85,
                isFeatured: false,
            },
            {
                name: "Sony Alpha A7 IV Camera",
                description: "Full-frame mirrorless camera with 33MP sensor, 4K 60p video, and real-time AF.",
                price: 2499,
                salesPrice: 2199,
                discountPercentage: 12,
                category: electronics._id,
                brand: sony._id,
                images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500"],
                thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
                stock: 8,
                isFeatured: false,
            },
        ];

        let productsCreated = 0;
        const createdProducts: any[] = [];
        for (const p of productData) {
            const existing = await Product.findOne({ name: p.name });
            if (!existing) {
                const created = await Product.create({ ...p, inStock: true });
                createdProducts.push(created);
                productsCreated++;
            } else {
                createdProducts.push(existing);
            }
        }
        console.log(`${productsCreated} new products created (${createdProducts.length} total)`);

        // ===== INVENTORY =====
        // Create inventory for ALL products that don't have one (including manually added ones)
        const allProducts = await Product.find({ isDeleted: false });
        let inventoryCreated = 0;
        for (const product of allProducts) {
            const existing = await Inventory.findOne({ productId: product._id });
            if (!existing) {
                await Inventory.create({
                    productId: product._id,
                    availableStock: product.stock || 0,
                    reservedStock: 0,
                    totalStock: product.stock || 0,
                    lowStockThreshold: 10,
                });
                inventoryCreated++;
            }
        }
        console.log(`${inventoryCreated} inventory records created (${allProducts.length} products total)`);

        // ===== STORE SETTINGS =====
        const existingSettings = await StoreSettings.findOne();
        if (!existingSettings) {
            await StoreSettings.create({
                storeName: "MERN-eKART",
                currency: "INR",
                currencySymbol: "₹",
                lowStockThreshold: 10,
                contactEmail: "support@mern-ekart.com",
                contactPhone: "+91 98765 43210",
            });
            console.log("Store settings created");
        } else {
            console.log("Store settings already exist");
        }

        // ===== NOTIFICATION PREFERENCES (for admin) =====
        const admin = await User.findOne({ email: "admin@mern-ekart.com" });
        if (admin) {
            const existingPrefs = await NotificationPreferences.findOne({ userId: admin._id });
            if (!existingPrefs) {
                await NotificationPreferences.create({
                    userId: admin._id,
                    lowStockAlerts: true,
                    newOrders: true,
                    paymentFailures: true,
                    dailySummary: true,
                });
                console.log("Admin notification preferences created");
            } else {
                console.log("Admin notification preferences already exist");
            }
        }

        // ===== COUPONS =====
        const couponData = [
            {
                code: "WELCOME10",
                type: "cart",
                discountType: "percentage",
                discountValue: 10,
                description: "10% off on your first order",
                minPurchaseAmount: 500,
                maxDiscount: 200,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                isActive: true,
                usageLimit: 100,
                userLimit: 1,
            },
            {
                code: "FLAT200",
                type: "cart",
                discountType: "fixed",
                discountValue: 200,
                description: "Flat ₹200 off on orders above ₹1500",
                minPurchaseAmount: 1500,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                isActive: true,
                usageLimit: 50,
                userLimit: 2,
            },
            {
                code: "SAVE25",
                type: "cart",
                discountType: "percentage",
                discountValue: 25,
                description: "25% off up to ₹500",
                minPurchaseAmount: 1000,
                maxDiscount: 500,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
                usageLimit: 200,
                userLimit: 1,
            },
        ];

        let couponsCreated = 0;
        for (const c of couponData) {
            const existing = await Coupon.findOne({ code: c.code });
            if (!existing) {
                await Coupon.create(c);
                couponsCreated++;
            }
        }
        console.log(`${couponsCreated} coupons created`);

        // ===== TAX =====
        const taxData = [
            {
                name: "GST",
                rate: 18,
                applicableTo: "all",
                isActive: true,
            },
            {
                name: "CGST",
                rate: 9,
                applicableTo: "all",
                isActive: false,
            },
            {
                name: "SGST",
                rate: 9,
                applicableTo: "all",
                isActive: false,
            },
        ];

        let taxesCreated = 0;
        for (const t of taxData) {
            const existing = await Tax.findOne({ name: t.name });
            if (!existing) {
                await Tax.create(t);
                taxesCreated++;
            }
        }
        console.log(`${taxesCreated} taxes created`);

        // ===== CHARGES =====
        const chargeData = [
            {
                name: "Delivery Charges",
                type: "fixed",
                amount: 49,
                applicableTo: "all",
                minOrderAmount: null,
                maxOrderAmount: 499,
                isActive: true,
            },
            {
                name: "Packaging Fee",
                type: "fixed",
                amount: 20,
                applicableTo: "all",
                minOrderAmount: null,
                maxOrderAmount: null,
                isActive: true,
            },
            {
                name: "Express Delivery",
                type: "fixed",
                amount: 99,
                applicableTo: "all",
                minOrderAmount: null,
                maxOrderAmount: null,
                isActive: false,
            },
        ];

        let chargesCreated = 0;
        for (const ch of chargeData) {
            const existing = await Charge.findOne({ name: ch.name });
            if (!existing) {
                await Charge.create(ch);
                chargesCreated++;
            }
        }
        console.log(`${chargesCreated} charges created`);

        console.log("\n Seed completed successfully!");
        console.log("\n Login credentials:");
        console.log("   Admin: admin@mern-ekart.com / admin123");
        console.log("   User:  user@mern-ekart.com / user1234");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
};

seed();
