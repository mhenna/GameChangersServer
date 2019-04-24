import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: {
    type: [],
    required: true
  },
  creator: {
    type: String,
    ref: 'User',
    required: true
  }
});

teamSchema.plugin(beautifyUnique);
export default mongoose.model('Team', teamSchema);
