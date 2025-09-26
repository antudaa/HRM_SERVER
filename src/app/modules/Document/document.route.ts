// routes/document.routes.ts
import express from 'express';
import { authenticateUser, authorizeSuperAdmin } from '../../middlewares/auth';
import { DocumentControllers } from './document.controller';

const router = express.Router();

router.post('/create',
    authenticateUser,
    authorizeSuperAdmin,
    DocumentControllers.createDocument
);

router.patch('/update/:id',
    authenticateUser,
    authorizeSuperAdmin,
    DocumentControllers.updateDocument
);

router.patch('/archive/:id',
    authenticateUser,
    authorizeSuperAdmin,
    DocumentControllers.archiveDocument
);

router.patch('/unarchive/:id',
    authenticateUser,
    authorizeSuperAdmin,
    DocumentControllers.unarchiveDocument
);

router.delete('/soft-delete/:id',
    authenticateUser,
    authorizeSuperAdmin,
    DocumentControllers.softDeleteDocument
);

router.delete('/hard-delete/:id',
    authenticateUser,
    authorizeSuperAdmin,
    DocumentControllers.hardDeleteDocument
);

router.get('/all',
    authenticateUser,
    DocumentControllers.getAllDocuments
);

router.get('/active',
    authenticateUser,
    DocumentControllers.getActiveDocuments
);

router.get('/archived',
    authenticateUser,
    DocumentControllers.getArchivedDocuments
);

router.get('/:id',
    authenticateUser,
    DocumentControllers.getSingleDocument
);


export const DocumentRoutes = router;
