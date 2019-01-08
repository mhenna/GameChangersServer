import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

const judgmentQuestionsSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: false
  },
  question: {
    type: String,
    required: true,
    unique: false
  },
  rate: {
    type: Number,
    required: true,
    unique: false
  }
});
judgmentQuestionsSchema.index({ category: 1, question: 1 }, { unique: true });
judgmentQuestionsSchema.plugin(beautifyUnique);
export default mongoose.model('judgmentQuestion', judgmentQuestionsSchema);
