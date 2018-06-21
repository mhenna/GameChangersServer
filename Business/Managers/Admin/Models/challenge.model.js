const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const challengeSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        unique: true
    }
});
challengeSchema.plugin(beautifyUnique);
const Challenge = mongoose.model('Challenge',challengeSchema);
module.exports = Challenge;