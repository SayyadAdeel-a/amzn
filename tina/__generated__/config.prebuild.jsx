// tina/config.ts
import { defineConfig } from "tinacms";
var config_default = defineConfig({
  branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main",
  // clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "***",
  // token: process.env.TINA_TOKEN || "***",
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "product",
        label: "Products",
        path: "content/products",
        format: "json",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: { component: "textarea" }
          },
          {
            type: "string",
            name: "price",
            label: "Price"
          },
          {
            type: "string",
            name: "originalPrice",
            label: "Original Price"
          },
          {
            type: "string",
            name: "affiliateLink",
            label: "Affiliate Link",
            required: true
          },
          {
            type: "image",
            name: "image",
            label: "Image"
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: ["jerseys", "balls", "footwear", "accessories", "gaming", "collectibles"]
          },
          {
            type: "string",
            name: "badge",
            label: "Badge",
            options: ["none", "hot", "new", "limited"]
          },
          {
            type: "number",
            name: "rating",
            label: "Rating"
          },
          {
            type: "number",
            name: "reviewCount",
            label: "Review Count"
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured"
          },
          {
            type: "datetime",
            name: "publishedAt",
            label: "Published At"
          }
        ]
      },
      {
        name: "blog",
        label: "Blog Posts",
        path: "content/blogs",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true
          },
          {
            type: "datetime",
            name: "date",
            label: "Date",
            required: true
          },
          {
            type: "image",
            name: "coverImage",
            label: "Cover Image"
          },
          {
            type: "string",
            name: "excerpt",
            label: "Excerpt",
            ui: {
              component: "textarea"
            }
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
