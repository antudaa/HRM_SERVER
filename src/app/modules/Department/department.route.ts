import express from 'express';
import requestValidator from '../../middlewares/validateRequest';
import { DepartmentControllers } from './department.controller';
import { updateDepartmentZodSchema } from './department.validation';
import { authenticateUser, authorizeSuperAdmin } from '../../middlewares/auth';

const router = express.Router();

router.post(`/create-department`,
    authenticateUser,
    authorizeSuperAdmin,
    DepartmentControllers.createDepartment,
);

router.patch(`/update-department/:id`,
    authenticateUser,
    authorizeSuperAdmin,
    requestValidator(updateDepartmentZodSchema),
    DepartmentControllers.updateDepartment,
);

router.delete(`/archive-department/:id`,
    authenticateUser,
    authorizeSuperAdmin,
    DepartmentControllers.archivedDepartment,
);

router.delete(`/unarchive-department/:id`,
    authenticateUser,
    authorizeSuperAdmin,
    DepartmentControllers.unArchivedDepartment,
);

router.delete(`/delete-department/:id`,
    authenticateUser,
    authorizeSuperAdmin,
    DepartmentControllers.handDeleteDepartment,
);

router.get(`/`,
    authenticateUser,
    DepartmentControllers.getAllDepartments,
);

router.get(`/active-departments`,
    authenticateUser,
    DepartmentControllers.getActiveDepartments,
);
router.get(`/archive-departments`,
    authenticateUser,
    DepartmentControllers.getArchiveDepartments,
);

router.get(`/:id`,
    authenticateUser,
    DepartmentControllers.getDepartmentById
);

export const DepartmentRoutes = router;