import { Schema, model, Document } from "mongoose";

export interface ICategories extends Document {
  title: string;
  description: string;
  image?: string;
  thumbnail?: string;
  deleted: boolean;
}

const categorySchema: Schema<ICategories> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: null },
  thumbnail: { type: String, default: null },
  deleted: { type: Boolean, required: true },
});

const Categories = model<ICategories>("categories", categorySchema);

export default Categories;
