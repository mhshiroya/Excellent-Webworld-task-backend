import { Schema, model, Document } from "mongoose";

export interface IBrands extends Document {
  title: string;
  description: string;
  image?: string;
  thumbnail?: string;
  deleted: boolean;
}

const brandSchema: Schema<IBrands> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: null },
  thumbnail: { type: String, default: null },
  deleted: { type: Boolean, required: true },
});

const Brands = model<IBrands>("brands", brandSchema);

export default Brands;
