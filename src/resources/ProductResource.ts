import { IProduct } from "../models/Products"; // your user interface
import fs from "fs";
import path from "path";

// ProductResource.ts
export const ProductResource = (product: IProduct | IProduct[]) => {
  if (Array.isArray(product)) {
    return product.map((p) => singleProduct(p));
  }
  return singleProduct(product);
};

const singleProduct = (product: IProduct) => ({
  id: product._id,
  title: product.title,
  price: product.price,
  category_id: product.category_id,
  brand_id: product.brand_id,
  stock: product.stock,
  rating: product.rating,
  images: product.images
    .filter((img) => {
      const filePath = path.resolve(img); // make sure img is a relative/absolute path
      return fs.existsSync(filePath);
    })
    .map((img) => `${process.env.BASE_URL}${img}`.replace(/\\/g, "/")),
});
