import { type Router } from 'express';
import { Router as ExpressRouter } from 'express';
import { getBooks, getBookById } from '../controllers/bookController.js';
import { requireApiKey } from '../middlewares/authMiddleware.js';

const bookRoutes: Router = ExpressRouter();

bookRoutes.get('/', requireApiKey, getBooks);
bookRoutes.get('/:bookId', requireApiKey, getBookById);

export default bookRoutes;
