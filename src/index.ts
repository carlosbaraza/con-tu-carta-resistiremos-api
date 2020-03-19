import { log } from './logger';
require('dotenv').config();

import { db } from './db';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { corsOptions } from './cors';
import expressWinston from 'express-winston';

import { letterRoutes } from './controllers/letters';
import './firebase';

async function main() {
  await db.connect();

  const app = express();
  app.use(bodyParser.json());
  app.use(cors(corsOptions));
  app.use(expressWinston.logger({ winstonInstance: log }));

  app.use('/letters', letterRoutes);

  app.listen(process.env.PORT || 3001);
}

main();
