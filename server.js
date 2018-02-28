const express = require('express')
const bodyParse = require('body-parser')
const _ = require('lodash')
const {ObjectId} = require('mongodb')
const {mongoose} = require('./db/mongoose')

const app = express();
test ={
    test: 'test'
}
app.get('/', (req, res)=> {res.send(test)});
app.listen(3000, () => console.log("Game Changers up, Listening on port 3000, inshallah."))
