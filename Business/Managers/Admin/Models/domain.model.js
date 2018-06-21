const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const domainSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        unique: true
    }
});

domainSchema.plugin(beautifyUnique);
const Domain = mongoose.model('Domain', domainSchema);
module.exports = Domain;