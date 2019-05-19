import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import httpStatus from 'http-status';
import expressWinston from 'express-winston';
import expressValidation from 'express-validation';
import helmet from 'helmet';
import winston from 'winston';
import expressJwt from 'express-jwt';
import { mongoose } from '../db/mongoose';
import winstonInstance from './winston';
import config from './config';
import UserManager from '../Business/Managers/User/UserManager';
import userRoutes from '../Business/Managers/User/user.routes';
import teamRoutes from '../Business/Managers/Team/team.routes';
import ideaRoutes from '../Business/Managers/Idea/idea.routes';
import judgeRoutes from '../Business/Managers/Judge/judge.routes';
import adminRoutes from '../Business/Managers/Admin/admin.routes';
import { isAdmin } from '../Business/Managers/Admin/Config/admin.midddlewares';
import redis from './redis.config';
import es from './elasticsearch.config';
import registerUser from '../Business/Managers/User/UserManager';
const app = express();

app.use(express.static('APIs/Documentation'));

if (config.env === 'development') {
  app.use(logger('dev'));
}
// parse body params and attache them to req.body
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

redis.populateWithConfig();
redis.setDeadlines();

// enable detailed API logging in dev env
if (config.env === 'development') {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(expressWinston.logger({
    winstonInstance: new (winston.Logger)({
      transports: [
        new (winston.transports.Console)({
          json: true,
          colorize: true,
          timestamp: true
        })
      ]
    }),
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    colorStatus: true
  }));
}

es.intializeES();

// app.post('/register', (req, res) => { UserManager.registerUser(req); });
app.post('/register', (req, res) => { 
  console.log(req.body)
  UserManager.registerUser(req,res) });
// mount user routes at /users
app.use('/users', userRoutes);
app.use('/ideas', expressJwt({ secret: config.jwtSecret }), ideaRoutes);
app.use('/judge', expressJwt({ secret: config.jwtSecret }), judgeRoutes);
app.use('/admin', expressJwt({ secret: config.jwtSecret }), isAdmin, adminRoutes);
app.use('/teams', teamRoutes);

// error handler
app.use((err, req, res, next) => {
  res.status(err.status).json(err);
});

export default app;
