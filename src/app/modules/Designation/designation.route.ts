import express from 'express';
import { authenticateUser, authorizeSuperAdmin } from '../../middlewares/auth';
import { DesignationControllers } from './designation.controller';
import requestValidator from '../../middlewares/validateRequest';
import { designationSchema, updateDesignationValidation } from './designation.validation';

const router = express.Router();

router.post(`/create-designation`,
    authenticateUser,
    authorizeSuperAdmin,
    // requestValidator(designationSchema),
    DesignationControllers.createDesignation,
);

router.patch(`/update-designation/:id`,
    authenticateUser,
    authorizeSuperAdmin,
    requestValidator(updateDesignationValidation),
    DesignationControllers.updateDesignation,
);

router.delete(`/archive-designation/:id`,
    authenticateUser,
    authorizeSuperAdmin,
    DesignationControllers.archiveDesignation,
);

router.delete(`/unarchive-designation/:id`,
    authenticateUser,
    authorizeSuperAdmin,
    DesignationControllers.archiveDesignation,
);

router.delete(`/delete-designation/:id`,
    authenticateUser,
    authorizeSuperAdmin,
    DesignationControllers.deleteDesignation,
);

router.get(`/`,
    authenticateUser,
    DesignationControllers.getAllDesignations,
);

router.get(`/active-designation`,
    authenticateUser,
    DesignationControllers.getActiveDesignations,
);

router.get(`/archive-designation`,
    authenticateUser,
    DesignationControllers.getArchiveDesignations,
);

router.get(`/:id`,
    authenticateUser,
    DesignationControllers.getDesignationById
);

export const DesignationRoutes = router;