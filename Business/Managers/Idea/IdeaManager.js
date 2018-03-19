const Utils = require('../utils')
const express = require('express');
const fileUpload = require('express-fileupload');
const gridfs = require('../../../db/grid-fs')
const app = express();
const Idea  = require('../Idea/Models/idea');

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
    gridfs.replace(req, res);
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
getIdea
}