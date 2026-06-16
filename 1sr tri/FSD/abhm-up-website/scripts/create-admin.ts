import dotenv from "dotenv";
import { resolve } from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Load .env.local from the parent directory
dotenv.config({ path: resolve(__dirname, "../.env.local") });

// AdminUser Schema
const adminUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["superadmin", "admin", "editor", "viewer"],
      default: "admin",
    },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);

async function main() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI is not set in .env.local");
      process.exit(1);
      return;
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Default admin credentials
    const email = "admin@abhm.org";
    const password = "Admin@123"; // Change after first login!
    const name = "Super Admin";

    // Check if admin already exists
    const existing = await AdminUser.findOne({ email }).lean();
    if (existing) {
      console.log(`⚠️  Admin already exists: ${email}`);
      console.log("   To create a new admin, delete this user from MongoDB first.\n");
      await mongoose.connection.close();
      return;
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    console.log("👤 Creating admin user...");
    await AdminUser.create({
      email,
      name,
      role: "admin",
      passwordHash,
      isActive: true,
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    ", email);
    console.log("🔑 Password: ", password);
    console.log("👤 Name:     ", name);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🌐 Login at: http://localhost:3000/admin/login");
    console.log("\n⚠️  IMPORTANT: Change this password after first login!\n");

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Error:", message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

main();
