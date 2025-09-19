function validateUserMiddleware(req, res, next){
    const user = req.body;
    console.log(user);
    if(user && user.userName && user.password){
        if(user.userName.length>0 && user.password.length>0){
            next();
        }
        else{
           res.status(400).json({message: "Invalid username or password", data: user}); 
        }
    }else{
        res.status(400).json({message: "Invalid username or password", data: user});
    }
}

module.exports = {validateUserMiddleware};