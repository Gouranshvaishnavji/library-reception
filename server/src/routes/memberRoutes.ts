import { type Router } from 'express';
import { Router as ExpressRouter } from 'express';
import { createMember, getMemberById, getAllMembers, updateMember, deleteMember } from '../controllers/memberController.js';
import { requireApiKey } from '../middlewares/authMiddleware.js';

const memberRoutes: Router = ExpressRouter();

memberRoutes.post('/', requireApiKey, createMember);
memberRoutes.get('/', requireApiKey, getAllMembers);
memberRoutes.get('/:memberId', requireApiKey, getMemberById);
memberRoutes.put('/:memberId', requireApiKey, updateMember);
memberRoutes.delete('/:memberId', requireApiKey, deleteMember);

export default memberRoutes;
