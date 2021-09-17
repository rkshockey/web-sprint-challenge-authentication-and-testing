function validateUser (req, res, next) {
    const {username, password} = req.body;
    if(username && password){
        next();
    }else{
        next({ status: 400, message: "username and password required" });
    }
}

module.exports = validateUser;
