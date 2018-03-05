const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const teamSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: "Team name '{VALUE}' already exists."
    },
    members: {
      type: [],
      required: true
    },
    creator:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: 'You already have a team. A user cannot have more than one team.'
    }
});

teamSchema.plugin(beautifyUnique);
const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
