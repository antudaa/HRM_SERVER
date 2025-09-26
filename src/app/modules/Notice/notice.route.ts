import express from 'express';
import { authenticateUser, authorizeSuperAdmin } from '../../middlewares/auth';
import { NoticeControllers } from './notice.controller';

const router = express.Router();

router.post('/create',
    authenticateUser,
    authorizeSuperAdmin,
    NoticeControllers.createNotice
);

router.patch('/update/:id',
    authenticateUser,
    authorizeSuperAdmin,
    NoticeControllers.updateNotice
);

router.patch('/archive/:id',
    authenticateUser,
    authorizeSuperAdmin,
    NoticeControllers.archiveNotice
);

router.patch('/unarchive/:id',
    authenticateUser,
    authorizeSuperAdmin,
    NoticeControllers.unarchiveNotice
);

router.patch('/soft-delete/:id',
    authenticateUser,
    authorizeSuperAdmin,
    NoticeControllers.softDeleteNotice
);

router.delete('/delete/:id',
    authenticateUser,
    authorizeSuperAdmin,
    NoticeControllers.deleteNotice
);

router.get('/all',
    authenticateUser,
    NoticeControllers.getAllNotices
);

router.get('/active',
    authenticateUser,
    NoticeControllers.getActiveNotices
);

router.get('/archived',
    authenticateUser,
    NoticeControllers.getArchivedNotices
);

router.get('/:id',
    authenticateUser,
    NoticeControllers.getNoticeById
);

export const NoticeRoutes = router;