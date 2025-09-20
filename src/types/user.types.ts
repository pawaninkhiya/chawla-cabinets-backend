import { Document } from "mongoose";


export interface IUserBase {
    name: string;
    email: string;
    password: string;
    role: "admin" | "user";
}

export interface IUser extends IUserBase, Document {
    comparePassword: (password: string) => Promise<boolean>;
}
