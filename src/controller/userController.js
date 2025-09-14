const express = require('express');
const userController = express.Router();
const userService = require("../service/userService");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const secretKey = "my-secret-key";


const { authenticateToken } = require("../util/jwt");
userController.use(validateUser);

userController.post("/register", async (req, res) => 
{
    
    try{
    const data = await userService.postUser(req.body);
    if(data === 'User Already Exists'){
      res.status(409).json({message: "User already exists", data: req.body});  
    }
    else if(data){
        res.status(201).json({message: "User Registered Successfully", data: data});
    }else{
        res.status(400).json({message: "User Registration Failed", data: req.body});
    }
}catch(error)
{
     res.status(500).json({ message: 'Internal server error', error: error.message });
}
} )


userController.post("/login", async (req, res) => {
    const {userName, password} = req.body;
    try{
    const data = await userService.validateLogin(userName, password);
    if(data){
        const token = jwt.sign(
            {
                userName: userName,
                role : data.role
            },
            secretKey,
            {
                expiresIn: "60m"
            }
        );
        res.status(200).json({message: "You have successfully logged in", token});
    }else{
        res.status(401).json({message: "invalid login"});
    }
}catch(error)
{
    res.status(500).json({ message: 'Internal server error', error: error.message });

}
})


function validateUser(req, res, next){
    const user = req.body;
    if(user.userName && user.password){
        if(user.userName.length>0 && user.password.length>0){
            next();
        }
    }else{
        res.status(400).json({message: "Invalid username or password", data: user});
    }
}
    

module.exports = userController;