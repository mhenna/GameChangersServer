import config from '../../../config/config';
const Idea  = require('../Idea/Models/idea');
const Utils = require('../utils')
const Team  = require('../Team/Models/team');
const User  = require('../User/Models/user');
const Domain = require('./Models/domains.model');
const Category = require('./Models/categories.model');
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
function getAllDomains(req, res) {
    Domain.find({}, (err, domains) => {
      if(err) {
        console.log("err: ", err.message);
        Utils.send400(err.message, res);
        return
      }
        return res.status(200).json({
            status : '200',
            message: 'Success',
            body: domains
            })
        })
       
}
function createDomain(req, res, next) {
    let domain = new Domain({ name: req.body.name});
    domain.save(function (err){
      if(err) {
        console.log("ERROR SAVING DOMAIN")
        const uniqueColumnKey = Object.keys(err.errors)[0];
        Utils.send400(err.errors[uniqueColumnKey].message, res);
        return;
      }else {
        console.log("SAVING Domain")
        res.status(200).json({
              status: '200',
              statustext: 'Ok'
        });
      }
    });
  }
function removeDomain(req, res, next){ 
    Domain.findOneAndRemove({ name: req.params.name }, function (err, domain) {
        if (err) {
            console.log('ERROR DELETING DOMAIN')
            Utils.send400(err.message, res);
        } else {
            if(domain) {
                return res.status(204).json({
                    status : '204',
                    message: 'Success'
                }); 
            } else {
                return res.status(404).json({
                    status : '404',
                    message: 'Not Found'
                });
            }       
        }
    });
}
function updateDomain(req, res, next){ 
    Domain.findOneAndUpdate({ name: req.params.name }, {name: req.body.name}, { new: true }, function (err, domain) {
        if (err) {
            console.log('ERROR UPDATING DOMAIN')
            Utils.send400(err.message, res);
        } else {
            if(domain) {
                return res.status(200).json({
                    status : '200',
                    message: 'Success',
                    result: domain
                }); 
            } else {
                return res.status(404).json({
                    status : '404',
                    message: 'Not Found'
                });
            }       
        }
    });
}
function getAllCategories(req, res) {
    Category.find({}, (err, categories) => {
      if(err) {
        console.log("err: ", err.message);
        Utils.send400(err.message, res);
        return
      }
        return res.status(200).json({
            status : '200',
            message: 'Success',
            body: categories
            })
        })
       
}
function createCategory(req, res, next) {
    let category = new Category({ name: req.body.name});
    category.save(function (err){
      if(err) {
        console.log("ERROR SAVING CATEGORY")
        const uniqueColumnKey = Object.keys(err.errors)[0];
        Utils.send400(err.errors[uniqueColumnKey].message, res);
        return;
      }else {
        console.log("SAVING CATEGORY")
        res.status(200).json({
              status: '200',
              statustext: 'Ok'
        });
      }
    });
  }
function removeCategory(req, res, next){ 
    Category.findOneAndRemove({ name: req.params.name }, function (err, category) {
        if (err) {
            console.log('ERROR DELETING CATEGORY')
            Utils.send400(err.message, res);
        } else {
            if(category) {
                return res.status(204).json({
                    status : '204',
                    message: 'Success'
                }); 
            } else {
                return res.status(404).json({
                    status : '404',
                    message: 'Not Found'
                });
            }       
        }
    });
}
function updateCategory(req, res, next){ 
    Category.findOneAndUpdate({ name: req.params.name }, {name: req.body.name}, { new: true }, function (err, category) {
        if (err) {
            console.log('ERROR UPDATING CATEGORY')
            Utils.send400(err.message, res);
        } else {
            if(category) {
                return res.status(200).json({
                    status : '200',
                    message: 'Success',
                    result: category
                }); 
            } else {
                return res.status(404).json({
                    status : '404',
                    message: 'Not Found'
                });
            }       
        }
    });
}
module.exports = {
    getAllUsers,
    getAllDomains,
    createDomain,
    removeDomain,
    updateDomain,
    getAllCategories,
    createCategory,
    removeCategory,
    updateCategory,
}