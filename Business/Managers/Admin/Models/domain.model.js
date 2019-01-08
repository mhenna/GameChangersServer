import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';

const domainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});

domainSchema.plugin(beautifyUnique);
export default mongoose.model('Domain', domainSchema);
