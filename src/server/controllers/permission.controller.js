"use strict";
const express = require("express");
const permission_manager_1 = require("./../managers/permission.manager");
const auth_middleware_1 = require("./../middlewares/auth.middleware");
var router = express.Router();
var permissionManager = new permission_manager_1.PermissionManager();
router.post('/has-permissions', auth_middleware_1.AuthMiddleware.requireLogin, (req, res) => {
    let permissions = req.body.permissions;
    let some = req.body.some;
    let user = req.user;
    if (!permissions) {
        return res.status(400).send();
    }
    permissionManager.hasPermissions(user._id, permissions, some).then(hasPermissions => {
        return res.json(hasPermissions);
    }).catch(error => {
        console.error(error);
        return res.sendStatus(500);
    });
});
router.all('/has-permissions/organization', auth_middleware_1.AuthMiddleware.requireLogin, (req, res) => {
    let permissions = req.body.permissions;
    let organizationId = req.body.organizationId;
    let some = req.body.some;
    let user = req.user;
    if (!permissions || !organizationId) {
        return res.status(400).send();
    }
    permissionManager.hasPermissionForOrganization(user._id, permissions, organizationId, some).then(hasPermissions => {
        return res.json(hasPermissions);
    }).catch(error => {
        console.error(error);
        return res.sendStatus(500);
    });
});
module.exports = router;
