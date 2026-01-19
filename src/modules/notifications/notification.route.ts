import express from 'express';
import { authHandler } from '../../middlewares/authHandler';
import {
    createNotificationHandler,
    markNotificationAsReadHandler,
    getUserNotificationsHandler,
    getUnreadNotificationCountHandler
} from './notification.controller';

const router = express.Router();

router.post('/', authHandler, createNotificationHandler);
router.patch('/:notificationId/read', authHandler, markNotificationAsReadHandler);
router.get('/', authHandler, getUserNotificationsHandler);
router.get('/unread/count', authHandler, getUnreadNotificationCountHandler);

export default router;