import config from '../../../config/config';
const Idea  = require('../Idea/Models/idea');
const Utils = require('../utils')
const Team  = require('../Team/Models/team');
const User  = require('../User/Models/user');
function getAllUsers(req, res) {
    // console.log("Is admin?: ", req.user.email, req.user.email != config.admin)
    // if(req.user.email != config.admin) {
    //     console.log()
    //     Utils.send400("Unauthorized", res);
    //     return;
    // }
    User.find({},'name email region location position', (err, users) => {
      if(err) {
        console.log("err: ", err.message);
        Utils.send400(err.message, res);
        return
      }
      if(!users) {
        console.log("err2: ", "not user");
        Utils.send400("Internal server error", res);
        return
      }else{
          console.log(users);
          
        // let list = users.toJSON()
        
            return res.status(200).json({
                status : '200',
                message: 'Success',
                body: users
                })
            }
        })
       
}
module.exports = {
    getAllUsers
}