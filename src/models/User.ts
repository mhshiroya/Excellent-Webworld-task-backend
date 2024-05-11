import mongoose, { Model, Schema } from 'mongoose';

interface User {
    email: string;
    password: string;
    fullName: string;
    _id: any
}

const userSchema = new Schema<User, Model<User>>(
    {
        fullName: { type: String, required: false },
        email: { type: String, required: false },
        password: { type: String, required: false },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

const User = mongoose.model<User>('user', userSchema);

export default User;