import { Schema, model, Document } from "mongoose";
import { hash } from "bcrypt";

interface IUser extends Document {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  verified: boolean;
  verifyToken: string;
  hashPassword(): Promise<void>;
}

const userSchema = new Schema<IUser>({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verifyToken: { type: String },
});

userSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = await hash(this.password, 10);
  }
  next();
});

const User = model<IUser>("User", userSchema);

export { User, IUser };
