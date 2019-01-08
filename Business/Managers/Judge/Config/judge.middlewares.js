function isJudge(req, res, next) {
    if (req.user.isJudge == true){
        next();
    }
    else{
        return res.json({ message: "unathorized" }, 401);
    }
}

module.exports = {
    isJudge
};
