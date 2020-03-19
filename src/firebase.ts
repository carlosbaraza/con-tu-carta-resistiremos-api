import { log } from './logger';
import * as admin from 'firebase-admin';
import {
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL
} from './config';

import { Request } from './types';
import { Response, NextFunction } from 'express';
import { UNAUTHORIZED, TEMPORARY_REDIRECT } from 'http-status';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    privateKey: FIREBASE_PRIVATE_KEY,
    clientEmail: FIREBASE_CLIENT_EMAIL
  })
});

export async function verifyIdToken(
  token: string,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const decodedClaims = await admin
    .auth()
    .verifyIdToken(token, true /** checkRevoked */);

  req.uid = decodedClaims.uid;

  next();
}

export async function verifyAuthorizationIdToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) throw new Error('Bearer token is mandatory');
    await verifyIdToken(token, req, res, next);
  } catch (e) {
    log.error(e);
    res.status(UNAUTHORIZED).json({ error: 'Not authorized' });
  }
}

export async function onlyAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await verifyAuthorizationIdToken(req, res, next);
    if (!req.uid || !(req.uid === 'TFwYCinXp7NmUfko5EnL5GzoStn2')) {
      throw new Error('User is not an admin');
    }
  } catch (e) {
    log.error(e);
    res.status(UNAUTHORIZED).json({ error: 'Not authorized' });
  }
}
