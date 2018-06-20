const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const categorySchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        unique: true
    }
});
categorySchema.plugin(beautifyUnique);
const Category = mongoose.model('Category',categorySchema);
module.exports = Category;