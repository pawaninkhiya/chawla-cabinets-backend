import mongoose, { Schema, Document, Types } from "mongoose";

// COLOR OPTION
export interface ColorOption {
    name: string;
    body: string;
    door: string;
    images: string[];
    price?: number;
    mrp?: number;
    available?: boolean
}

const ColorOptionSchema = new Schema<ColorOption>(
    {
        name: { type: String, required: true },
        body: { type: String, required: true },
        door: { type: String, required: true },
        images: [{ type: String, required: true }],
        price: { type: Number, default: 0 },
        mrp: { type: Number, default: 0 },
        available: { type: Boolean, default: true }, // New field
    },
    { _id: false }
);

// PRODUCT
export interface Product extends Document {
    name: string;
    modelId: Types.ObjectId;
    categoryId: Types.ObjectId;
    createdBy: Types.ObjectId;
    description?: string;
    numberOfDoors: number;
    colorOptionsCount: number;
    price: number;
    mrp: number;
    material: string;
    warranty: string;
    paintType: string;
    colors: ColorOption[];
    colorsAvailable: boolean; // New field
    cardImage?: string;
}

const ProductSchema = new Schema<Product>(
    {
        name: { type: String, required: true },
        modelId: { type: Schema.Types.ObjectId, ref: "ModelVerity", required: true },
        categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        description: { type: String },
        numberOfDoors: { type: Number, required: true },
        colorOptionsCount: { type: Number, required: true },
        price: { type: Number, required: true },
        mrp: { type: Number, required: true },
        material: { type: String, default: "Steel" },
        warranty: { type: String, default: "5 Years" },
        paintType: { type: String, default: "Powder Coating" },
        colors: [ColorOptionSchema],
        colorsAvailable: {
            type: Boolean,
            default: function () {
                return (this.colors && this.colors.length > 0);
            },
        },
        cardImage: { type: String },
    },
    { timestamps: true }
);

export const ProductModel = mongoose.model<Product>("Product", ProductSchema);
