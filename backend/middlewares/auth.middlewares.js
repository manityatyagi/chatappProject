import { User } from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const protect = async(req, res, next) => {
    let token;

    try {
        if(req.headers.authorization && 
                  req.headers.authorization.startsWith("Bearer")) {
           token = await req.headers.authorization.split('')[0];
       } 
       else if(req.cookies?.jwt) {
         token = req.cookies.jwt;
       }
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id)
          if(!user) {
             throw new Error("user no longer exists");
          }
          req.user = decoded;
          next();
    }   
     catch (error) {
        throw new Error("Invalid authentication");
    }
}

export default protect;