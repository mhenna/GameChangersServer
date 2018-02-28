const mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
    email:{
        type: String, 
        lowercase:true,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true
    },
    password:{
        type: String, 
        required: true
    },
    bio:
    {
        default: "This used did not add any bio",
        type: String   
    },
    position:
    {
        type: String,
        required: true
    },
    //this attributes shows if the user belongs to a team or not
    teamMember:
    {
        type: Boolean,
        default: 0
    },
    craetorOf:
    {
        type: String,
        default: "-1"
    },
    careerLevel:
    {
        type: String
    },
    isRemote:
    {
        type: Boolean,
        required: true
    },
    location:
    {
        type: String,
        required: true
    },
    genNextMember:
    {
        type: Boolean,
        required: true
    },
    previousParticipation:
    {
        type: Boolean,
        required: true
    },
    preferences:
    {
        // type: String,
        type: [],
        required: true
    }
});

var User = mongoose.model('User', userSchema);
module.exports = User;