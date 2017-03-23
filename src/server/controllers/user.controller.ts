import * as express from 'express';
import { UserManager } from './../managers/user.manager';
import { PermissionManager } from './../managers/permission.manager';
import { User } from './../classes/user';
import { Organization } from './../classes/organization';
import { Permission } from './../classes/permission';
import { AuthMiddleware } from './../middlewares/auth.middleware';
import { PermissionsMiddleware } from './../middlewares/permissions.middleware';


var router: express.Router = express.Router();
var userManager = new UserManager();
var permissionManager = new PermissionManager();

router.get('/user',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([Permission.EDIT_USER_PERMISSIONS]),
    (req: express.Request, res: express.Response) => {
        let searchTerm = req.param('searchTerm');
        let page = +req.param('page');
        let pageSize = +req.param('pageSize');
        let paginationOptions = null;
        if (page && pageSize) {
            paginationOptions = {
                skip: (page - 1) * pageSize,
                limit: pageSize
            };
        }

        userManager.search(searchTerm, paginationOptions).then((users) => {
            return res.json(users);
        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

router.get('/user/current',
    AuthMiddleware.requireLogin,
    (req: express.Request, res: express.Response) => {
        return res.json(req.user);
    });

router.get('/user/:id',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([Permission.EDIT_USER_PERMISSIONS]),
    (req: express.Request, res: express.Response) => {

        userManager.read(req.params.id).then((user) => {
            if (!user) {
                return res.sendStatus(404);
            }

            return res.json(user);

        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

router.post('/user', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    userManager.create(req.body.user).then((user) => {
        return res.json(user);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.put('/user/:id/permissions',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([Permission.EDIT_USER_PERMISSIONS]),
    (req: express.Request, res: express.Response) => {
        let userId = req.params.id;
        let permissions: Permission[] = req.body.permissions;
        let organization: Organization = req.body.organization;

        permissionManager.setPermissions(userId, organization || req.user.organization, permissions).then((user: User) => {
            return res.json(user);
        }).catch(error => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

router.put('/user/:id/organization',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([Permission.EDIT_USER_PERMISSIONS]),
    (req: express.Request, res: express.Response) => {
        let userId = req.params.id;
        let organizationId: any = req.body.organizationId;

        userManager.setOrganization(userId, organizationId).then((user: User) => {
            return res.json(user);
        }).catch(error => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

export default router;