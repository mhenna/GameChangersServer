import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

const challengeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});
challengeSchema.plugin(beautifyUnique);
export default mongoose.model('Challenge', challengeSchema);
