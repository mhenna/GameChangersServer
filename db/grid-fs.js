const gridfs = require('gridfs-stream');
const fs = require('fs');
const mongoose = require('mongoose');
const Idea = require('../Business/Managers/Idea/Models/idea');

gridfs.mongo = mongoose.mongo;
const connection = mongoose.connection;
const Utils = require('../Business/Managers/utils');
const mime = require('mime-types');
let part = '';
let found_idea = ''


function write(req, res) {
  const gfs = gridfs(connection.db);
  if (req.files == null || req.files == undefined){
    part ={encoding: '',
          data: ''};
  }else{
    part = req.files.file;
  }
  var fileKeys = Object.keys(req.files);
  var i=0;
  var to=0;
  let data = '';
  if(req.files.file.length == undefined){
    data=req.files.file;
    
    to=1;
  }
  else{
    part=req.files.file;
    to=part.length;
  }
 
 
  for(let i =0; i < to;i++ )
  { 
    if(req.files.file.length != undefined){
      data= part[i];
    }

  const writeStream = gfs.createWriteStream({
    filename: req.user.teamMember + '-file-' + i +'.'+ mime.extension(data.mimetype) ,
    mode: 'w',
    content_type: data.mimetype,
    metadata: {
      encoding: data.encoding
    },
  });
 
  writeStream
    .on('close', () => {
      const team = req.user.teamMember;
      const idea = new Idea({ title: req.body.title, teamName: team });
      try {
        Idea.update({ teamName: team }, {
          filename: req.user.teamMember +'.'+ mime.extension(data.mimetype),
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
        });
      } catch (err) {
        return Utils.sendResponse(res, httpStatus.BAD_REQUEST,
          httpStatus.getStatusText(httpStatus.BAD_REQUEST), null, 
          [{message: 'cannot perform update of idea'}]);
      }
    })
    .on('error', (err) => {
      Utils.send400(err, res);
      return;
    });
    
  try {

    writeStream.write(data.data);
   
    writeStream.end();
   
  } catch (err) {
    
    Utils.send400('Error in write stream.', res);
    return;
  }
  console.log('File ',i+1 ,' uploded')
}
  
  console.log('before ressssssssssssss')
  res.status(200).json({
    status: '200',
    statustext: 'Ok'
  });
  console.log('after resssssssssssssssssssss')
}


async function read(req, res) {
  console.log('Start READ')
  const gfs = gridfs(connection.db);
  const idea = await getIdea(req)
  
  if(idea == undefined)
    return
  let filenames = idea.oldFilename.split(',')
  let i = filenames.indexOf(req.body.file)
  
  let name = req.user.teamMember + '-file-' + i +'.'+ mime.extension(mime.lookup(req.body.file))
  //console.log(name)
  
  gfs.exist({ filename: name }, (err, found) => {
    if (err) {
      Utils.send400(err, res);
    } else if (!found) {
      Utils.send400('file not found', res);
    } else {
      res.header('Content-Type', mime.lookup(req.body.file));
      gfs.createReadStream({
        filename: name
      }).pipe(res)
        .on('error', (err) => {
          Utils.send400(err, res);
        });
    }
  });
}

async function getIdea(req, res) {
  try {
    found_idea = await Idea.findOne({ teamName: req.user.teamMember}, (err, ret) => {
      if (err) {
        Utils.send400('Error finding the idea', res);
        return 'No idea'
      }
      if(!ret){
        Utils.send400('Error finding the idea', res);
        return 'No idea'
      }
      console.log('End of get idea')
    })
  } catch (err) {
    return Utils.sendResponse(res, httpStatus.BAD_REQUEST, httpStatus.getStatusText(httpStatus.BAD_REQUEST),
      null, [{ message: 'couldn\'t fetch corresponding team to create the idea' }]);
  }
  return found_idea;
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
