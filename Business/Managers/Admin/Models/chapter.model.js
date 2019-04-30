import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

const chapterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

chapterSchema.plugin(beautifyUnique);
export default mongoose.model('Chapter', chapterSchema);
