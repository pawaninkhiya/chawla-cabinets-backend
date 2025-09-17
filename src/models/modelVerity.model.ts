import mongoose, { Schema, Document, Types } from "mongoose";

export interface IModelVerity extends Document {
    name: string;
    description?: string;
    categoryId: Types.ObjectId;
}

const ModelVeritySchema = new Schema<IModelVerity>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: "",trim: true },
        categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    },
    { timestamps: true }
);
const ModelVerity = mongoose.model<IModelVerity>("ModelVerity", ModelVeritySchema);

export default ModelVerity;
