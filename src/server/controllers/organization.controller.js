"use strict";
const permission_manager_1 = require("./../managers/permission.manager");
const express = require("express");
const organization_manager_1 = require("./../managers/organization.manager");
const permission_1 = require("./../classes/permission");
const auth_middleware_1 = require("./../middlewares/auth.middleware");
const permissions_middleware_1 = require("./../middlewares/permissions.middleware");
var router = express.Router();
var organizationManager = new organization_manager_1.OrganizationManager();
router.get('/organization', auth_middleware_1.AuthMiddleware.requireLogin, (req, res) => {
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
    organizationManager.search(searchTerm, paginationOptions).then((organization) => {
        return res.json(organization);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});
router.get('/organization/:id/workflow', auth_middleware_1.AuthMiddleware.requireLogin, permissions_middleware_1.PermissionsMiddleware.hasPermissions([permission_1.Permission.EDIT_USER_PERMISSIONS]), (req, res) => {
    let organizationId = req.param('id');
    organizationManager.getWorkflow(organizationId).then((workflow) => {
        return res.json(workflow);
    }).catch(error => {
        console.error(error);
        return res.status(500).send();
    });
});
router.post('/organization/:id/workflow', auth_middleware_1.AuthMiddleware.requireLogin, permissions_middleware_1.PermissionsMiddleware.hasPermissions([permission_1.Permission.EDIT_USER_PERMISSIONS]), (req, res) => {
    let workflow = req.body.workflow;
    let organizationId = req.param('id');
    console.log(req.body);
    let permissionManager = new permission_manager_1.PermissionManager();
    permissionManager.hasPermissionForOrganization(req.user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS], organizationId).then((hasPermissions) => {
        if (hasPermissions) {
            organizationManager.setWorkflow(organizationId, workflow).then((organization) => {
                return res.json(organization);
            }).catch(error => {
                console.error(error);
                return res.status(500).send();
            });
        }
        else {
            return res.status(403).send();
        }
    }).catch(error => {
        console.error(error);
        return res.status(500).send();
    });
});
router.post('/organization', auth_middleware_1.AuthMiddleware.requireLogin, permissions_middleware_1.PermissionsMiddleware.hasPermissions([permission_1.Permission.EDIT_USER_PERMISSIONS]), (req, res) => {
    organizationManager.create(req.body.organization).then((organization) => {
        return res.json(organization);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});
router.delete('/organization/:id', auth_middleware_1.AuthMiddleware.requireLogin, permissions_middleware_1.PermissionsMiddleware.hasPermissions([permission_1.Permission.EDIT_USER_PERMISSIONS]), (req, res) => {
    organizationManager.delete(req.params.id).then((organization) => {
        if (!organization) {
            return res.sendStatus(404);
        }
        return res.json(organization);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});
module.exports = router;
