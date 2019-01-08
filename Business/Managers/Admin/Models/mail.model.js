import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

const mailSchema = new mongoose.Schema({
  host: {
    type: String,
    required: true
  },
  port: {
    type: Number,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

mailSchema.plugin(beautifyUnique);
export default mongoose.model('Mail', mailSchema);
