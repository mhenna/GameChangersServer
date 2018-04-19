const User = require('../User/Models/user');
const Idea  = require('../Idea/Models/idea');
const Utils = require('../utils');
const Judgment = require('./Models/judgment');
import config from '../../../config/config';

function  getIdeas(req, res, next) {
    var currJudgeId = req.user._id;
    if(!req.user.isJudge) {
        Utils.send400('Unauthorized', res);
        return;
    }
    Judgment.find({judgeId: currJudgeId}, 'ideasId' ,function(err, ideas) {
        if (err) {
            Utils.send400(err, res);
            return;
        }
        var final = []
        var index = 0;
        if(!ideas[0]) {
            res.json({});
            return;
        }
        (ideas[0].ideasId).forEach((idea)=>{
            Idea.find({_id: idea}, 'teamName challenge title judgments', function(err, ret){
                let currScore = -1;
                let innovationComment =""
                let problemSolvingComment = ""
                let financialImpactComment = ""
                let feasibilityComment = ""
                let qualityComment = ""
                let innovationScore =  -1 
                let problemSolvingScore= -1
                let financialImpactScore = -1
                let feasibilityScore = -1
                let qualityScore = -1
                console.log("JUDGE",ret[0]);
                if(!ret[0].judgments) {
                    res.json({});
                    return;
                }
                (ret[0].judgments).forEach((tempRet) =>{
                    console.log(tempRet.judgeId, req.user._id)
                    if(tempRet.judgeId == req.user._id) {
                      currScore = tempRet.score;
                      innovationComment = tempRet.innovationComment;
                      problemSolvingComment = tempRet.problemSolvingComment;
                      financialImpactComment = tempRet.financialImpactComment;
                      feasibilityComment = tempRet.feasibilityComment;
                      qualityComment = tempRet.qualityComment;
                      innovationScore =  tempRet.innovationScore;
                      problemSolvingScore= tempRet.problemSolvingScore;
                      financialImpactScore = tempRet.financialImpactScore;
                      feasibilityScore = tempRet.feasibilityScore;
                      qualityScore = tempRet.qualityScore;
                    }
                });
                if(!err)
                {
                    final.push({
                        score: currScore,
                        teamName: ret[0].teamName, 
                        challenge: ret[0].challenge, 
                        title: ret[0].title,
                        innovationComment,
                        problemSolvingComment,
                        financialImpactComment,
                        feasibilityComment,
                        qualityComment,
                        innovationScore,
                        problemSolvingScore,
                        financialImpactScore,
                        feasibilityScore,
                        qualityScore,
                    });
                 }
                index++;
                if(index == ideas[0].ideasId.length) {
                    res.json(final);
                    return;
                }
            });
        });
    });
}

function getIdea(req,res,next) {
    var currJudgeId = req.user._id;
    if(!req.user.isJudge) {
        Utils.send400('Unauthorized', res);
        return;
    }
    Judgment.find({judgeId: currJudgeId}, 'ideasId' ,function(err, ideas) {
        if (err) {
            Utils.send400(err, res);
            return;
        }
        var final = []
        var index = 0;
            Idea.find({teamName: req.params.id}, '_id teamName challenge title judgments filename', function(err, ret){
                let currScore = -1;
                let innovationComment =""
                let problemSolvingComment = ""
                let financialImpactComment = ""
                let feasibilityComment = ""
                let qualityComment = ""
                let innovationScore =  -1 
                let problemSolvingScore= -1
                let financialImpactScore = -1
                let feasibilityScore = -1
                let qualityScore = -1
                let filename = "";
                console.log("JUDGE",ret[0]);
            
                (ret[0].judgments).forEach((tempRet) =>{
                    console.log(tempRet.judgeId, req.user._id)
                    if(tempRet.judgeId == req.user._id) {
                      currScore = tempRet.score;
                      innovationComment = tempRet.innovationComment;
                      problemSolvingComment = tempRet.problemSolvingComment;
                      financialImpactComment = tempRet.financialImpactComment;
                      feasibilityComment = tempRet.feasibilityComment;
                      qualityComment = tempRet.qualityComment;
                      innovationScore =  tempRet.innovationScore;
                      problemSolvingScore= tempRet.problemSolvingScore;
                      financialImpactScore = tempRet.financialImpactScore;
                      feasibilityScore = tempRet.feasibilityScore;
                      qualityScore = tempRet.qualityScore;
                    }
                });
                if(!err)
                {
                    final.push({
                        score: currScore,
                        teamName: ret[0].teamName, 
                        challenge: ret[0].challenge, 
                        title: ret[0].title,
                        innovationComment,
                        problemSolvingComment,
                        financialImpactComment,
                        feasibilityComment,
                        qualityComment,
                        innovationScore,
                        problemSolvingScore,
                        financialImpactScore,
                        feasibilityScore,
                        qualityScore,
                        filename: ret[0].filename,
                        ideaId: ret[0]._id
                    });
                 }
            
                
                    res.json(final[0]);
                    return;
                
            });
        // res.json({});
        // return;
    });
}

function getJudgmentJson(req) {
    
    return { judgeName: req.user.name, judgeId: req.user._id, ideaId: req.body.ideaId, score:req.body.score, innovationComment: req.body.innovationComment, problemSolvingComment: req.body.problemSolvingComment, financialImpactComment: req.body.financialImpactComment, feasibilityComment:req.body.feasibilityComment, qualityComment: req.body.qualityComment, innovationScore: req.body.innovationScore, problemSolvingScore: req.body.problemSolvingScore, feasibilityScore: req.body.feasibilityScore, qualityScore: req.body.qualityScore, financialImpactScore: req.body.financialImpactScore};
}

function submitJudgment(req, res, next) {
    var currJudgeId = req.user._id;
    if(!req.user.isJudge) {
        Utils.send400('Unauthorized', res);
        return;
    }

    Judgment.find({judgeId: currJudgeId}, 'ideasId' ,function(err, ideasFirst) {
        if(err) {
            Utils.send400(err, res);
            return;    
        }
        let judgment = getJudgmentJson(req);  
        if(ideasFirst[0].ideasId.indexOf(judgment.ideaId) <= -1) {
            Utils.send400('Unauthorized', res);
            return;
        } 
        Idea.find({_id: judgment.ideaId} ,function(err, ideas) {
            if(err) {
                Utils.send400(err, res);
                return;    
            }
            var newJudgments = [judgment];
            (ideas[0].judgments).forEach((ret)=>{
                if(ret.judgeId != judgment.judgeId) {
                    newJudgments.push(ret);
                }
            });
            ideas[0].judgments = newJudgments;
            Idea.update({_id: judgment.ideaId}, ideas[0], function (err){
                if(err) {
                    Utils.send400(err, res);
                    return;
                }else {
                    res.status(200).json({
                        status: '200',
                        statustext: 'Ok'
                    });
                }
            });
        });
    });
}

function assignIdeatoJudge(req, res) {
    
    console.log("Is admin?: ", req.user.email, req.user.email != config.admin)
    if(req.user.email != config.admin) {
        Utils.send400("Unauthorized", res);
        return;
    }
    Judgment.find({judgeId: req.body.judgeId} ,function(err, judgment) {
        if(err) {
            console.log("ERR1: ", err)
            Utils.send400(err, res);
            return;    
        }

        if(!judgment) {
            Utils.send400("Invalid Judge Id", res);
            return;         
        }
        console.log(judgment)
        var ideas = []
        if(judgment[0] && judgment[0].ideasId.indexOf(req.body.ideaId) > -1) {
            Utils.send400('Idea already assigned to this judge', res);
            return;
        } 
        if(judgment[0])
            ideas = judgment[0].ideasId.slice()

        ideas.push(req.body.ideaId);
        Judgment.update({ judgeId: req.body.judgeId }, {ideasId: ideas}, { new: true, upsert: true}, function(err, doc){
            if(err) {
                console.log("err: ", err);
                Utils.send400(err, res);
                return;    
            }
            Idea.find({_id: req.body.ideaId} ,function(err, ideas) {
                if(err) {
                    Utils.send400(err, res);
                    return;    
                }
                var newJudgments = [{ judgeName: req.user.name, judgeId: req.user._id, ideaId: req.body.ideaId, score:-1}];
                (ideas[0].judgments).forEach((ret)=>{
                    if(ret.judgeId != req.body.judgeId) {
                        newJudgments.push(ret);
                    }
                });
                console.log(newJudgments);
                ideas[0].judgments = newJudgments;
                Idea.update({_id: req.body.ideaId}, ideas[0], function (err){
                    if(err) {
                        Utils.send400(err, res);
                        return;
                    }else {
                        res.status(200).json({
                            status: '200',
                            statustext: 'Ok'
                        });
                    }
                });
            });
        });
    });
}
module.exports = {
    getIdeas,
    submitJudgment,
    getIdea,
    assignIdeatoJudge
};