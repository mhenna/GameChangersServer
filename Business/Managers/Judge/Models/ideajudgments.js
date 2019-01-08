const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const ideajudgmentsSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true
  },
  idea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea'
  },
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  questions: {
    type: mongoose.Schema.Types.Array,
    required: true
  },
  totalScore: {
    type: mongoose.Schema.Types.Number,
    required: true,
    default: -1
  }
});

ideajudgmentsSchema.plugin(beautifyUnique);
ideajudgmentsSchema.index({ idea: 1, judge: 1 }, { unique: true });
const ideaJudgments = mongoose.model('IdeaJudgments', ideajudgmentsSchema);
module.exports = ideaJudgments;
