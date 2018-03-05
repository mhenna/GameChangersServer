const Team = require('../Team/Models/team');

function createTeam(req, res, next) {

    if(req.body.members.length > 5)
    {
      res.status(400).json({
        status: '400',
        statustext: 'Failed',
        errors: [{
          messages: [
            'Maximum team size is 6'
          ]
        }]
      });
    } else {
        let team = new Team({ name: req.body.teamName, creator: req.user.id, members: req.body.members});
        team.save(function (err){
          if(err) {
            const uniqueColumnKey = Object.keys(err.errors)[0];
            res.status(403).json({
              status: '403',
              statustext: 'Forbidden',
              errors: [{
                message: [
                  err.errors[uniqueColumnKey].message
                ]
              }]
            });
          }else {
          // sending email to invitees should be added
          res.status(200).json({
            status: '200',
            statustext: 'Ok'
          });
         }
       });
    }
  }

  module.exports = {
    createTeam
  };
