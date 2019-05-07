import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  members: {
    type: [],
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  allowOthers: {
    type: Boolean,
    required: true
  },
  lookingFor: {
    type: String,

    // required: true
  },
  region: {
    type: String,
    required: true
  },
  chapter: {
    type: String,
    required: true

  }

});

teamSchema.plugin(beautifyUnique);
export default mongoose.model('Team', teamSchema);