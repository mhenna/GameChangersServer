var gridfs = require('gridfs-stream');
var fs = require('fs');
const mongoose = require('mongoose');
const Idea  = require('../Business/Managers/Idea/Models/idea');

gridfs.mongo = mongoose.mongo;
var connection = mongoose.connection;
const Utils = require('../Business/Managers/utils')

function write(req, res){
    var gfs = gridfs(connection.db);
    var part = req.files.file;
    
    var writeStream = gfs.createWriteStream({
        filename: req.user.teamMember,
        mode: 'w',
        content_type:part.mimetype, 
        metadata:{
            encoding: part.encoding
        },
    });


    writeStream
    .on('close', function() {
        var team = req.user.teamMember;
        Idea.findOne({ teamName: team }, (err, ret) => {
            if (err) { 
            Utils.send400(err, res); 
            return;
            }
            if(ret)
            {
                Utils.send400("This team has already submitted an idea",res);
                return
            }else{
                let idea = new Idea({title: req.body.title, teamName: team, challenge: req.body.challenge});
                idea.save((err, idea) =>{
                    if(err) {
                        Utils.send400(err, res)
                        return;
                    }
                    if(!idea) 
                    {
                        res.status(500).json({
                            status: '500',
                            message: 'Internal server error'
                        })
                    }else {
                        res.status(200).send({
                            message: 'Success'
                        });               
                    }
                }
            );
            }
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
    gfs.exist({ filename: req.user.teamMember }, function (err, file) {
        if (err) {
            Utils.send400(err, res);
        } else if(!file) {
            return;
        } else {
            gfs.remove({ filename: req.user.teamMember}, function (err) {
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