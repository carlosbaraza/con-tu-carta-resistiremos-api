import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import Joi from 'joi';
import { MongoClient } from 'mongodb';
import { corsOptions } from './cors';
import { letterPublicFields } from './letters';

const uri =
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/con-tu-carta-resistiremos';
const client = new MongoClient(uri);

async function main() {
  await client.connect();

  const app = express();
  app.use(bodyParser.json());
  app.use(cors(corsOptions));

  app.get('/letters', async (req, res) => {
    try {
      const letters = await client
        .db()
        .collection('letters')
        .find({}, { fields: letterPublicFields })
        .toArray();
      res.json(letters);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.post('/letters', async (req, res) => {
    const schema = Joi.object().keys({
      title: Joi.string()
        .min(3)
        .max(150)
        .trim()
        .required(),
      body: Joi.string()
        .min(3)
        .trim()
        .required(),
      email: Joi.string()
        .trim()
        .email()
    });
    const { error: validationError, value: parsedDocument } = Joi.validate(
      req.body,
      schema
    );

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    try {
      const document = {
        ...parsedDocument,
        approved: false,
        createdAt: new Date()
      };
      const letter = await client
        .db()
        .collection('letters')
        .insertOne(document);
      res.json({ _id: letter.insertedId });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

  app.listen(process.env.PORT || 3001);
}

main();
