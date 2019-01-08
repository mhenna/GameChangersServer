import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

const deadlineSchema = new mongoose.Schema({
  registration: {
    type: Date,
    required: true,
  },
  teams: {
    type: Date,
    required: true,
  },
  submission: {
    type: Date,
    required: true,
  },
  judging: {
    type: Date,
    required: true,
  }
});

deadlineSchema.plugin(beautifyUnique);
export default mongoose.model('Deadline', deadlineSchema);
