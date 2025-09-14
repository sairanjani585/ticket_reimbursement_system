const userDAO = require('../repository/userDAO');
const bcrypt = require('bcrypt');
const {logger} = require("../util/logger");



async function postUser(user){

    const {userName,password} = user;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
        try{
        const data = await userDAO.postUser(userName,hashedPassword);
        if(data === "User Already Exists"){
            logger.info(`User already exists: ${JSON.stringify(user)}`);
        }
        else if(data){
            logger.info(`Created new user: ${JSON.stringify(user)}`);
        }
        else{
            logger.info(`user not created: ${JSON.stringify(user)}`);
        }
        return data;
    }catch(error)
    {
        logger.error(error);
        return null;
    }
    
}

async function validateLogin(userName, password){
    try{
    const user = await userDAO.getUserByName(userName);
    if(user && (await bcrypt.compare(password, user.password))){
        logger.info(`User logged in successfully ${userName}`)
        return user;
    }else{
        logger.info(`User credentials mismatch ${userName}`);
        return null;
    }
}catch(error)
{
    logger.error(error);
    return null; 
}
}


module.exports = {
    postUser, 
    validateLogin, 
};