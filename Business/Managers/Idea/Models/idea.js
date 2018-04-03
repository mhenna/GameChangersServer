const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const ideaSchema = new mongoose.Schema({
    teamName: {
      type: String,
      required: true,
    },
    title: {
        type: String, 
        required: true
    },
    challenge: {
        type: String,
        required: true
    },
    filename: {
        type: String, 
        required: true
    },
    oldFilename: {
        type: String
    }
});

ideaSchema.plugin(beautifyUnique);
const Idea = mongoose.model('Idea', ideaSchema);
module.exports = Idea;
