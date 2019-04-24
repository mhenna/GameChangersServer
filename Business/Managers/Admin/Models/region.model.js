import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

const regionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

regionSchema.plugin(beautifyUnique);
export default mongoose.model('Region', regionSchema);
