import { MongoClient } from 'mongodb';

const uri =
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/con-tu-carta-resistiremos';

export const db = new MongoClient(uri);
