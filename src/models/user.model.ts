import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "../types/user.types";

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "admin" }
    },
    { timestamps: true }
);

UserSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = async function (password: string) {
    return bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model<IUser>("User", UserSchema);
export default UserModel;
