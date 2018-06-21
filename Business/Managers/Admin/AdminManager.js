import config from '../../../config/config';
const Idea = require('../Idea/Models/idea');
const Utils = require('../utils')
const Team = require('../Team/Models/team');
const User = require('../User/Models/user');
const Domain = require('./Models/domains.model');
function getAllUsers(req, res) {
    User.find({}, 'name email region location position', (err, users) => {
        if (err) {
            Utils.send400(err.message, res);
            return;
        } else {
            return res.status(200).json({
                status: '200',
                message: 'Success',
                body: users
            })
        }
    })

}
function getAllDomains(req, res) {
    Domain.find({}, (err, domains) => {
        if (err) {
            Utils.send400(err.message, res);
            return
        }
        return res.status(200).json({
            status: '200',
            message: 'Success',
            body: domains
        })
    })

}
function createDomain(req, res, next) {
    let domain = new Domain({ name: req.body.name });
    domain.save(function (err) {
        if (err) {
            const uniqueColumnKey = Object.keys(err.errors)[0];
            Utils.send400(err.errors[uniqueColumnKey].message, res);
            return;
        } else {
            return res.status(200).json({
                status: '200',
                statustext: 'Ok'
            });
        }
    });
}
function removeDomain(req, res, next) {
    Domain.findOneAndRemove({ name: req.params.name }, function (err, domain) {
        if (err) {
            Utils.send400(err.message, res);
            return;
        } else {
            if (domain) {
                return res.status(204).json({
                    status: '204',
                    message: 'Success'
                });
            } else {
                return res.status(404).json({
                    status: '404',
                    message: 'Not Found'
                });
            }
        }
    });
}
function updateDomain(req, res, next) {
    Domain.findOneAndUpdate({ name: req.params.name }, { name: req.body.name }, { new: true }, function (err, domain) {
        if (err) {
            Utils.send400(err.message, res);
            return;
        } else {
            if (domain) {
                return res.status(200).json({
                    status: '200',
                    message: 'Success',
                    result: domain
                });
            } else {
                return res.status(404).json({
                    status: '404',
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
    updateDomain
}