var gridfs = require('gridfs-stream');
var fs = require('fs');
const mongoose = require('mongoose');
const Idea  = require('../Business/Managers/Idea/Models/idea');
gridfs.mongo = mongoose.mongo;
var connection = mongoose.connection;
const Utils = require('../Business/Managers/utils')
var mime = require('mime-types')

function write(req, res){
    var gfs = gridfs(connection.db);
    var part = req.files.file;
    
    var writeStream = gfs.createWriteStream({
        filename: req.user.teamMember + req.body.extension,
        mode: 'w',
        content_type: mime.lookup(req.body.extension), 
        metadata:{
            encoding: part.encoding
        },
    });


    writeStream
    .on('close', function() {
        var team = req.user.teamMember;
        let idea = new Idea({title: req.body.title, teamName: team, challenge: req.body.challenge});
        Idea.update({ teamName: team }, {filename: req.user.teamMember + req.body.extension, title: req.body.title, teamName: team, challenge: req.body.challenge}, { new: true, upsert: true }, function(err, doc){
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
        return;
    })
    .on('error', function(err){
        Utils.send400(err, res);
        return;
    });
     
    writeStream.write(part.data);
    writeStream.end();
}

function read(req, res){
    var gfs = gridfs(connection.db);
    gfs.exist({ filename: req.body.file }, function (err, found) {
        if (err) {
            Utils.send400(err, res);
            return;    
        } else if(!found){
            Utils.send400('file not found', res);
            return;  
        } 
        else{
            gfs.createReadStream({
                filename: req.body.file
            }).pipe(res)
            .on('error', function(err){
                Utils.send400(err, res);
                return;
            });
        } 
    });
   
}

function remove(req, res){ 
    var gfs = gridfs(connection.db);
    console.log(req.body.oldName);
    gfs.exist({ filename: req.body.oldName }, function (err, file) {
        if (err) {
            console.log('errorrr')
            Utils.send400(err, res);
        } else if(!file) {
            return;
        } else {
            gfs.remove({ filename: req.body.oldName}, function (err) {
                if (err) {
                    Utils.send400(err, res);
                }
            });
        }
    });
}

function replace(req, res){
    remove(req, res);
    write(req, res);
}

module.exports = {
    write, 
    read, 
    remove, 
    replace
    }
