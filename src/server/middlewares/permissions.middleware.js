"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const permission_manager_1 = require("./../managers/permission.manager");
class PermissionsMiddleware {
    static hasPermissions(permissions, some) {
        return (req, res, next) => {
            let permissionManager = new permission_manager_1.PermissionManager();
            let user = req.user;
            if (!user) {
                return res.redirect('/login');
            }
            permissionManager.hasPermissions(user._id, permissions, some).then(hasPermissions => {
                if (hasPermissions) {
                    return next();
                }
                return res.status(403).send();
            });
        };
    }
    static hasPermissionForOrganization(permissions, organization, some) {
        return (req, res, next) => {
            let permissionManager = new permission_manager_1.PermissionManager();
            let user = req.user;
            if (!user) {
                return res.redirect('/login');
            }
            permissionManager.hasPermissionForOrganization(user._id, permissions, organization, some).then(hasPermissions => {
                if (hasPermissions) {
                    return next();
                }
                return res.status(403).send();
            });
        };
    }
}
exports.PermissionsMiddleware = PermissionsMiddleware;
