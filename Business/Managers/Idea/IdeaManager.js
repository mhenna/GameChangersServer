const Utils = require('../utils')
const express = require('express');
const fileUpload = require('express-fileupload');
const gridfs = require('../../../db/grid-fs')
const app = express();
const Idea  = require('../Idea/Models/idea');
const mime = require('mime-types')

app.use(fileUpload());

function upload(req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');
    gridfs.write(req, res);
}

function download(req, res){
    gridfs.read(req, res);
}

function createIdea(req, res){
    Idea.findOne({ teamName: req.user.teamMember }, (err, ret) => {
        if (err) { 
        Utils.send400(err, res); 
        return;
        }
        if(ret)
        {
            Utils.send400("This team has already submitted an idea",res);
            return;
        }else{
            gridfs.replace(req, res);
        }
    });
}

function editIdea(req, res)
{
    
    Idea.findOne({ teamName: req.user.teamMember}, (err, ret) => {
        if (err) { 
        	Utils.send400(err, res); 
        return;
        }
        if(!ret)
        {
            Utils.send400("This team does not have an idea yet.",res);
            return
        }else{

            if(req.files) {
                gridfs.replace(req, res);
            }
            else{
                console.log(req.body.title, "  ", req.body.challenge);
                Idea.update({ teamName: req.user.teamMember }, {title: req.body.title, teamName: req.user.teamMember, challenge: req.body.challenge}, { new: true, upsert: true }, function(err, doc){
                    if(err){
                        Utils.send400('Cannot perform operation.', res);
                        return;
                    }
                    res.status(200).json({
                      status: '200',
                      statustext: 'Ok',
                      idea: doc
                    });
                  });
            }
        }
    });
}
function getIdea(req, res) {
    Idea.findOne({ teamName: req.user.teamMember }, (err, ret) => {
        if (err) { 
          Utils.send400(err, res); 
          return;
        }
        if(ret)
        {
            res.status(200).json({
                status: '200',
                statustext: 'Ok',
                idea: ret
              });
            return
        }else {
            Utils.send400("This team does not have an idea yet.",res);
        }
    });
}
module.exports = {
upload, 
download, 
createIdea, 
getIdea,
editIdea
}
