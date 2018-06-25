function isAdmin(req, res, next) {
    if (req.user.isAdmin == true){
        next();
    }
    else{
        return res.json({ message: "unathorized" }, 401);
    }
}

module.exports = {
    isAdmin
};
