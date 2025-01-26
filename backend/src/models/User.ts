import mongoose, {Mongoose, Schema} from "mongoose";
import bcrypt from 'bcryptjs';
import { IUser, UserSchema } from "../interfaces/IUser";

const userMongooseSchema = new Schema<IUser>({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    profilePicture: {
        type: String
    }
}, {timestamps: true});


//password hashing middlewere
userMongooseSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as mongoose.CallbackError)
    }
});

//password comparision method
userMongooseSchema.methods.comparePassword = async function(candidatePassword: string){
    return await bcrypt.compare(candidatePassword, this.password)
};

const User = mongoose.model<IUser>('User', userMongooseSchema)

export default User;
