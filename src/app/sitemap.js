import { db } from "../lib/firebase"
import { collection, getDocs } from "firebase/firestore"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap() {
  const baseUrl = "https://fifa26-lake.vercel.app"

  // 1. Fetch all products
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(productsCol);
  const products = productSnapshot.docs.map(doc => ({
    url: `${baseUrl}/product/${doc.id}`,
    lastModified: new Date(doc.data().publishedAt || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 2. Extract unique categories from products
  const categoriesSet = new Set();
  productSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.category) {
      categoriesSet.add(data.category.toLowerCase());
    }
  });
  
  const categories = Array.from(categoriesSet).map(cat => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 3. Fetch all blogs
  const blogsCol = collection(db, "blogs");
  const blogSnapshot = await getDocs(blogsCol);
  const blogs = blogSnapshot.docs.map(doc => ({
    url: `${baseUrl}/blog/${doc.id}`,
    lastModified: new Date(doc.data().date || new Date()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // 4. Core static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }
  ];

  return [...staticPages, ...categories, ...products, ...blogs];
}
