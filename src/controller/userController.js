const express = require('express');
const userController = express.Router();
const userService = require('../service/userService');
const userValidation = require('../util/userValidation');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const secretKey = "my-secret-key";

userController.use(userValidation.validateUserMiddleware);

userController.post("/register", async (req, res) => 
{
    const data = await userService.postUser(req.body);
    if(data === 'User Already Exists'){
      res.status(409).json({message: "User already exists", data: req.body});  
    }
    else if(data){
        res.status(201).json({message: "User Registered Successfully", data: data});
    }else{
        res.status(400).json({message: "User Registration Failed", data: req.body});
    }

} );

userController.post("/login", async (req, res) => {
    const {userName, password} = req.body;
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
        res.status(401).json({message: "Invalid login"});
    }

});

module.exports = userController;