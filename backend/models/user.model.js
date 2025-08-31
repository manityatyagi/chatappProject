import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
     name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
     },
     email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        match:' ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' ,
        minlength: 8
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["online","offline"],
        default: "offline"
    },
    profilePic: {
        type: String,
        default: ''
    },
    isUserCreated: {
        type: Boolean,
        default: "true"
    }

} ,{timestamps: true})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")){
        return next();
    }
    const saltRounds = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    next();
});

export const User = mongoose.model("User", userSchema);