import { log } from './../logger';
import { Request } from './../types';
import { db } from '../db';
import Joi from 'joi';
import { Router, Response } from 'express';
import { verifyIdToken, onlyAdmin } from '../firebase';
import { ObjectID } from 'mongodb';

export const letterPublicFields = {
  _id: true,
  title: true,
  body: true,
  createdAt: true,
  approved: true
};

export const letterRoutes = Router();

letterRoutes.get('/', async (req, res) => {
  try {
    const letters = await db
      .db()
      .collection('letters')
      .find({ approved: true }, { fields: letterPublicFields })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(letters);
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

letterRoutes.get('/all', onlyAdmin, async (req: Request, res: Response) => {
  try {
    const letters = await db
      .db()
      .collection('letters')
      .find({}, { fields: letterPublicFields })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(letters);
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

letterRoutes.post(
  '/:id/set-approved',
  onlyAdmin,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { approved } = req.body;
    log.info('Setting letter approval', { id, approved });
    try {
      const response = await db
        .db()
        .collection('letters')
        .update({ _id: new ObjectID(id) }, { $set: { approved } });
      res.json({ message: 'Success' });
    } catch (error) {
      log.error(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  }
);

letterRoutes.post('/', async (req, res) => {
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
    const letter = await db
      .db()
      .collection('letters')
      .insertOne(document);
    res.json({ _id: letter.insertedId });
  } catch (error) {
    log.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
