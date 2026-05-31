import { type Router } from 'express';
import { Router as ExpressRouter } from 'express';
import { issueBook, returnBook, getIssuanceHistory } from '../controllers/issuanceController.js';
import { requireApiKey } from '../middlewares/authMiddleware.js';

const issuanceRoutes: Router = ExpressRouter();

issuanceRoutes.post('/', requireApiKey, issueBook);
issuanceRoutes.put('/:issuanceId', requireApiKey, returnBook);
issuanceRoutes.get('/history', requireApiKey, getIssuanceHistory);

export default issuanceRoutes;
