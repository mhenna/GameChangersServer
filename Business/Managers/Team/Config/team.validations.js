import Joi from 'joi';

const user = Joi.object().keys({
  email: Joi.string().required(),
  accepted: Joi.boolean().default(false)
});

  // POST /teams
export const _createTeam = {
  body: {
    teamName: Joi.string().required(),
    members: Joi.array().items(user).required(),
  }
};
  // POST /delete/member
export const _deleteTeamMember = {
  params: {
    email: Joi.string().required()
  }
};

  // POST /add/member
export const _addTeamMember = {
  body: {
    email: Joi.string().required()
  }
};

export const _respondToInvitation = {
  body: {
    accepted: Joi.boolean().required()
  },
  params: {
    teamName: Joi.string().required()
  }
};
