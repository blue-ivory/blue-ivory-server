"use strict";
const express = require("express");
const user_manager_1 = require("./../managers/user.manager");
const permission_manager_1 = require("./../managers/permission.manager");
const permission_1 = require("./../classes/permission");
const auth_middleware_1 = require("./../middlewares/auth.middleware");
const permissions_middleware_1 = require("./../middlewares/permissions.middleware");
var router = express.Router();
var userManager = new user_manager_1.UserManager();
var permissionManager = new permission_manager_1.PermissionManager();
router.get('/user', auth_middleware_1.AuthMiddleware.requireLogin, permissions_middleware_1.PermissionsMiddleware.hasPermissions([permission_1.Permission.EDIT_USER_PERMISSIONS]), (req, res) => {
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
router.get('/user/current', auth_middleware_1.AuthMiddleware.requireLogin, (req, res) => {
    return res.json(req.user);
});
router.get('/user/:id', auth_middleware_1.AuthMiddleware.requireLogin, permissions_middleware_1.PermissionsMiddleware.hasPermissions([permission_1.Permission.EDIT_USER_PERMISSIONS]), (req, res) => {
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
router.post('/user', auth_middleware_1.AuthMiddleware.requireLogin, (req, res) => {
    userManager.create(req.body.user).then((user) => {
        return res.json(user);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});
router.put('/user/:id/permissions', auth_middleware_1.AuthMiddleware.requireLogin, permissions_middleware_1.PermissionsMiddleware.hasPermissions([permission_1.Permission.EDIT_USER_PERMISSIONS]), (req, res) => {
    let userId = req.params.id;
    let permissions = req.body.permissions;
    let organization = req.body.organization;
    permissionManager.setPermissions(userId, organization || req.user.organization, permissions).then((user) => {
        return res.json(user);
    }).catch(error => {
        console.error(error);
        return res.sendStatus(500);
    });
});
router.put('/user/:id/organization', auth_middleware_1.AuthMiddleware.requireLogin, permissions_middleware_1.PermissionsMiddleware.hasPermissions([permission_1.Permission.EDIT_USER_PERMISSIONS]), (req, res) => {
    let userId = req.params.id;
    let organizationId = req.body.organizationId;
    userManager.setOrganization(userId, organizationId).then((user) => {
        return res.json(user);
    }).catch(error => {
        console.error(error);
        return res.sendStatus(500);
    });
});
module.exports = router;
