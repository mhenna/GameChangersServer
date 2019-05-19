import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

const chapterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: true

  }
});

chapterSchema.plugin(beautifyUnique);
export default mongoose.model('Chapter', chapterSchema);
