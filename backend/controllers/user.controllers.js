import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken';

const registerUser = async(req, res) => {
  try {
     const {name, email, password } = req.body;

     let existingUser = await User.findOne({email});
     if(existingUser){
      return res.status(400).json({message: "User already exists"});
     }

     const newUser = new User({
      name,
      email,
      password
     });
      await newUser.save();

      const payload = { user: {
        id: user.id
      }};
        jwt.sign(payload, process.env.JWT_SECRET, 
             {expiresIn: '5d'}, (err, token) => {
               if(err) throw err;
               res.json({token});
        });
  } catch (error) {
     console.error(error.message);
     res.status(500).send("Server Error");
  }
}

const loginUser = async(req, res) => {
     try {
       const {email, password} = req.body;

       let user = await User.findOne({email});
       if(user){
        return res
        .json({message: "Invalid Credentials"})
        .status(400)
       }
         const isMatched = await bcrypt.compare(password, user.password);
         if(!isMatched){
          return res.
          status(400).
          json({message: "Invalid Credentials"});
         }

         const payload = { user: {
          id: user.id
         }};
           await jwt.sign(payload, process.env.JWT_SECRET, 
            {expiresIn: '6d'}, (err, token) => {
              if(err) throw err;
              res.json({token});
           })       
     } catch (error) {
       console.error(error.message);
       res.status(500).send("Server Error");
     }
}

const getProfile = async(req, res) => {
  try {
       const user = await User.findById(req.user.id).select("-password");
       res.json(user);
  } catch (error) {
    console.error(error.message);
    res.send("Server Error").status(500);
  }
}

const searchUsers = async(req, res) => {
   try { 
      const query = req.query;
      const users = await User.find({
        $or: [
          {
            username: {
              $regex: query,
              $options: 'i'
            }
          }, 
          {
            email: {
              $regex: query,
              $options: 'i'
            }
          },
         ],
          _id: { $ne: req.user.id }
      }).select("-password");

      res.json(users);
   } catch (error) {
     console.error(error.message);
     res.status(500).send("Server Error");
   }
}

export {registerUser, loginUser, getProfile, searchUsers};
