import { Schema, model, Document } from "mongoose";

export interface IBrands extends Document {
  title: string;
  description: string;
  images: string[];
  deleted: boolean;
}

const brandSchema: Schema<IBrands> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  deleted: { type: Boolean, required: true },
});

const Brands = model<IBrands>("brands", brandSchema);

export default Brands;
