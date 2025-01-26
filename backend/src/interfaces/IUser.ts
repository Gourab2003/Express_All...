import { promises } from 'dns'
import { z } from 'zod'

export const UserSchema = z.object({
    userName: z.string()
        .min(3, {message: 'Username must be atleast 3 character'})
        .max(15, {message: 'Username cannot exceed 30 characters'})
        .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),

    email: z.string()
        .email({message: "Invalid email address"}),

    password: z.string()
        .min(8, {message: "Password must be atleast 8 characters"})
        .max(20, {message: "Password cannot exceed 20 characters"})
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            { message: "Password must include uppercase, lowercase, number, and special character" }),
    
    role: z.enum(['user', 'admin']).default('user'),

    profilePicture: z.string().optional()
})

export interface IUser extends z.infer<typeof UserSchema>, Document {
    comparePassword(candidatePassword: string): Promise<boolean>
}