const gridfs = require('gridfs-stream');
const fs = require('fs');
const mongoose = require('mongoose');
const Idea = require('../Business/Managers/Idea/Models/idea');

gridfs.mongo = mongoose.mongo;
const connection = mongoose.connection;
const Utils = require('../Business/Managers/utils');
const mime = require('mime-types');
let part = '';
function write(req, res) {
  const gfs = gridfs(connection.db);
  if (req.files == null || req.files == undefined){
    part ={encoding: '',
          data: ''};
  }else{
    part = req.files.file;
  }

  const writeStream = gfs.createWriteStream({
    filename: req.user.teamMember + req.body.extension,
    mode: 'w',
    content_type: mime.lookup(req.body.extension),
    metadata: {
      encoding: part.encoding
    },
  });


  writeStream
    .on('close', () => {
      const team = req.user.teamMember;
      const idea = new Idea({ title: req.body.title, teamName: team });
      try {
        Idea.update({ teamName: team }, {
          filename: req.user.teamMember + req.body.extension,
          description: req.body.description,
          oldFilename: req.body.oldFilename,
          title: req.body.title,
          category: req.body.challenge,
          teamName: team
        }, { new: true, upsert: true }, (err, doc) => {
          if (err) {
            Utils.send400('Cannot perform operation.', res);
            return;
          }
          res.status(200).json({
            status: '200',
            statustext: 'Ok',
            idea: doc
          });
        });
      } catch (err) {
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, 
          [{message: 'cannot perform update of idea'}]);
      }
    })
    .on('error', (err) => {
      Utils.send400(err, res);
    });

  writeStream.write(part.data);
  writeStream.end();
}


function read(req, res) {
  const gfs = gridfs(connection.db);
  gfs.exist({ filename: req.body.file }, (err, found) => {
    if (err) {
      Utils.send400(err, res);
    } else if (!found) {
      Utils.send400('file not found', res);
    } else {
      res.header('Content-Type', mime.lookup(req.body.file));
      // res.setContentType(mime.lookup(req.body.file));
      gfs.createReadStream({
        filename: req.body.file
      }).pipe(res)
        .on('error', (err) => {
          Utils.send400(err, res);
        });
    }
  });
}

function remove(req, res) {
  const gfs = gridfs(connection.db);

  gfs.exist({ filename: req.body.oldName }, (err, file) => {
    if (err) {
      
      Utils.send400(err, res);
    } else if (!file) {

    } else {
      gfs.remove({ filename: req.body.oldName }, (err) => {
        if (err) {
          Utils.send400(err, res);
        }
      });
    }
  });
}

function replace(req, res) {
  remove(req, res);
  write(req, res);
}

module.exports = {
  write,
  read,
  remove,
  replace
};
