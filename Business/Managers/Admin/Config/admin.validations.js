import Joi from 'joi';

export const createDomain = {
  body: {
    name: Joi.string().required(),
  }
};
export const updateDomain = {
  body: {
    name: Joi.string().required(),
  },
  params: {
    name: Joi.string().required(),
  }
};
export const createJudge = {
  body: {
    email: Joi.string().required()
  }
};

export const removeDomain = {
  params: {
    name: Joi.string().required(),
  }
};
export const createChallenge = {
  body: {
    name: Joi.string().required(),
  }
};
export const updateChallenge = {
  body: {
    name: Joi.string().required(),
  },
  params: {
    name: Joi.string().required(),
  }
};
export const removeChallenge = {
  params: {
    name: Joi.string().required(),
  }
};
export const addTeamMember = {
  body: {
    email: Joi.string().required()
  },
  params: {
    teamName: Joi.string().required(),
  }
};
export const deleteTeamMember = {
  body: {
    email: Joi.string().required(),
  },
  params: {
    teamName: Joi.string().required(),
  }
};

export const createDeadline = {
  body: {
    registration: Joi.date().min('now').required(),
    teams: Joi.date().min('now').required(),
    judging: Joi.date().min('now').required(),
    submission: Joi.date().min('now').required(),
  }
};
export const updateDeadline = {
  body: {
    registration: Joi.date().min('now').required(),
    teams: Joi.date().min('now').required(),
    judging: Joi.date().min('now').required(),
    submission: Joi.date().min('now').required(),
  }
};
export const updateMail = {
  body: {
    host: Joi.string().required(),
    port: Joi.number().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
  }
};
export const saveQuestions = {
  body: {
    questions: Joi.array().items(Joi.object({
      category: Joi.string().required(),
      question: Joi.string().required(),
      rate: Joi.number().required(),
    }))
  }
};
