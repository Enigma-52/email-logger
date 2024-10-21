import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  userId: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: jwt.VerifyErrors | null, decoded: any) => {
    if (err) {
      res.sendStatus(403);
      return;
    }
    
    // You can cast the decoded object to UserPayload if you're sure it matches the shape
    const user = decoded as UserPayload;
    req.user = user;
    next();
  });
};