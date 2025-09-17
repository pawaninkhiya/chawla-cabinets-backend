import mongoose, { Schema, Document } from "mongoose";

export interface Category extends Document {
    categoryName: string;
    description?: string;
}
// type: "Traditional" | "Modern";x
const CategorySchema = new Schema<Category>(
    {
        categoryName: { type: String, required: true, trim: true },
        description: { type: String },
    },
    { timestamps: true }
);

const CategoryModel = mongoose.model<Category>("Category", CategorySchema);
export default CategoryModel;
