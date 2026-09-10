import { Router } from 'express';
import * as roomController from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { getRoomSchema } from '../validation/roomSchemas.js';

export const roomRouter = Router();

roomRouter.use(authMiddleware);

roomRouter.get('/:roomId', validateRequest(getRoomSchema), roomController.getRoomDetails);
