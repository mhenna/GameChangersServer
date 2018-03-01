const express = require('express')
const bodyParse = require('body-parser')
const _ = require('lodash')
const {ObjectId} = require('mongodb')
const {mongoose} = require('./db/mongoose')
const UserManager = require('./Business/Managers/User/UserManager')
const userRoutes = require('./Business/Managers/User/user.routes');

const app = express();

app.use(bodyParse.json());
app.post('/register', (req, res)=> {UserManager.registerUser(req);});
// mount user routes at /users
app.use('/users', userRoutes);

// error handler
app.use(function (err, req, res, next) {
    res.status(400).json(err);
});

app.listen(3000, () => console.log("Game Changers up, Listening on port 3000, inshallah."))
