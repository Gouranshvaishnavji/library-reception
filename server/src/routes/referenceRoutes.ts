import { type Router } from 'express';
import { Router as ExpressRouter } from 'express';
import { getAllCategories, getAllCollections } from '../controllers/referenceController.js';
import { requireApiKey } from '../middlewares/authMiddleware.js';

const referenceRoutes: Router = ExpressRouter();

referenceRoutes.get('/categories', requireApiKey, getAllCategories);
referenceRoutes.get('/collections', requireApiKey, getAllCollections);

export default referenceRoutes;
