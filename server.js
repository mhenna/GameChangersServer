const express = require('express')
const bodyParse = require('body-parser')
const _ = require('lodash')
const {ObjectId} = require('mongodb')
const {mongoose} = require('./db/mongoose')
const UserManager = require('./Business/Managers/User/UserManager')
const app = express();

app.use(bodyParse.json());
app.post('/register', (req, res)=> {UserManager.registerUser(req);});
app.listen(3000, () => console.log("Game Changers up, Listening on port 3000, inshallah."))
