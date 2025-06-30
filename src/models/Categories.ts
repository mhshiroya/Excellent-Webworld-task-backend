import { Schema, model, Document } from "mongoose";

export interface ICategories extends Document {
  title: string;
  description: string;
  images: string[];
  deleted: boolean;
}

const categorySchema: Schema<ICategories> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  deleted: { type: Boolean, required: true },
});

const Categories = model<ICategories>("categories", categorySchema);

export default Categories;
