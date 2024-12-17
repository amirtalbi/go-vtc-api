"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = require("bcrypt");
const userSchema = new mongoose_1.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
});
userSchema.pre("save", async function (next) {
    if (this.isModified("password") || this.isNew) {
        this.password = await (0, bcrypt_1.hash)(this.password, 10);
    }
    next();
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.User = User;
//# sourceMappingURL=user.entity.js.map