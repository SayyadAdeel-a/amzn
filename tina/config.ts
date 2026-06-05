import { defineConfig } from "tinacms";

export default defineConfig({
  branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main",
  // clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "***",
  // token: process.env.TINA_TOKEN || "***",
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
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
            name: "name",
            label: "Name",
            isTitle: true,
            required: true,
          },
          {
            type: "number",
            name: "price",
            label: "Price",
          },
          {
            type: "string",
            name: "amazonUrl",
            label: "Amazon URL",
          },
          {
            type: "image",
            name: "image",
            label: "Image",
          },
          {
            type: "boolean",
            name: "isActive",
            label: "Active",
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: ["Jerseys", "Sneakers", "Streetwear", "Accessories"],
          },
        ],
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
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "Date",
            required: true,
          },
          {
            type: "image",
            name: "coverImage",
            label: "Cover Image",
          },
          {
            type: "string",
            name: "excerpt",
            label: "Excerpt",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
