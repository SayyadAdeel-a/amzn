const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc } = require("firebase/firestore");
const matter = require("gray-matter");

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateProducts() {
  const productsDir = path.join(process.cwd(), "content/products");
  if (!fs.existsSync(productsDir)) {
    console.log("No products directory found.");
    return;
  }

  const files = fs.readdirSync(productsDir).filter((file) => file.endsWith(".json"));

  for (const file of files) {
    const slug = file.replace(/\.json$/, "");
    const content = fs.readFileSync(path.join(productsDir, file), "utf-8");
    try {
      const data = JSON.parse(content);
      await setDoc(doc(db, "products", slug), data);
      console.log(`✅ Migrated product: ${slug}`);
    } catch (e) {
      console.error(`❌ Failed to parse/migrate product ${file}:`, e);
    }
  }
}

async function migrateBlogs() {
  const blogsDir = path.join(process.cwd(), "content/blogs");
  if (!fs.existsSync(blogsDir)) {
    console.log("No blogs directory found.");
    return;
  }

  const files = fs.readdirSync(blogsDir).filter((file) => file.endsWith(".md"));

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const content = fs.readFileSync(path.join(blogsDir, file), "utf-8");
    try {
      const { data, content: body } = matter(content);
      const postData = {
        ...data,
        body,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      };
      await setDoc(doc(db, "blogs", slug), postData);
      console.log(`✅ Migrated blog: ${slug}`);
    } catch (e) {
      console.error(`❌ Failed to parse/migrate blog ${file}:`, e);
    }
  }
}

async function run() {
  console.log("Starting Firebase Migration...");
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error("❌ Firebase config missing in .env.local!");
    process.exit(1);
  }

  await migrateProducts();
  await migrateBlogs();
  console.log("Migration Complete! 🎉");
  process.exit(0);
}

run();
