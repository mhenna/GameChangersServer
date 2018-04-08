const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const judgmentSchema = new mongoose.Schema({
    ideasId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Idea'
    }], 
    judgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: 'This Judge Already has an entry.',
        required: true
    }
});

judgmentSchema.plugin(beautifyUnique);
const Judgment = mongoose.model('Judgment', judgmentSchema);
module.exports = Judgment;
