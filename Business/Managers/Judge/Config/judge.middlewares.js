function isJudge(req, res, next) {
    if (req.user.isJudge == true){
        next();
    }
    else{
        return res.json({ message: "unathorized" }, 401);
    }
}

function isJudgeOrAdmin(req, res, next) {
    if((req.user.isJudge == true) || req.user.isAdmin == true)
        next()
    else
        return res.json({ message: "unauthorized" }, 401)
}

module.exports = {
    isJudge,
    isJudgeOrAdmin
};
