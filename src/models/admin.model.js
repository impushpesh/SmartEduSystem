import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const adminSchema = new mongoose.Schema(
    {
        adminId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name:{
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String
        }
    }
)

// Password hashing
adminSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    this.password = await  bcrypt.hash(this.password, 10)
    next()    
})

// Password validation
adminSchema.methods.isValidPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

// JWT token generation
adminSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            adminId: this.adminId,
            name: this.name,
            email: this.email
        }, 

        process.env.ACCESS_TOKEN_SECRET,

        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

adminSchema.methods.generateRefreshToken = function (){
    return jwt.sign( 
        { 
            _id: this._id,
            adminId: this.adminId,
            name: this.name,
            email: this.email
        }, 

        process.env.REFRESH_TOKEN_SECRET, 

        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Admin = mongoose.model("Admin", adminSchema)