import { Document } from "mongoose";

// Base fields
export interface IUserBase {
    name: string;
    email: string;
    password: string;
    role: "admin" | "user";
}

// Full document with Mongoose + methods
export interface IUser extends IUserBase, Document {
    comparePassword: (password: string) => Promise<boolean>;
}
