import {z} from 'zod';

const loginSchema = z.object({
    email: z.string().email().optional(),
    password: z.string()
        .min(8, { message: "Password must be atleast 8 characters" })
        .max(20, { message: "Password cannot exceed 20 characters" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            { message: "Password must include uppercase, lowercase, number, and special character" }),
})

export default loginSchema;