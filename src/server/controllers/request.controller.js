"use strict";
const express = require("express");
const request_manager_1 = require("./../managers/request.manager");
const auth_middleware_1 = require("./../middlewares/auth.middleware");
const requests_middleware_1 = require("./../middlewares/requests.middleware");
var router = express.Router();
var requestManager = new request_manager_1.RequestManager();
router.get('/request/:type', auth_middleware_1.AuthMiddleware.requireLogin, (req, res) => {
    let type = req.params;
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
    requestManager.searchByType(type, searchTerm, req.user, paginationOptions).then((requests) => {
        if (!requests) {
            return res.sendStatus(404);
        }
        return res.json(requests);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});
router.post('/request', auth_middleware_1.AuthMiddleware.requireLogin, (req, res) => {
    // Get request from body
    let request = req.body.request;
    // Set requestor as current user
    request.requestor = req.user._id;
    // Create request
    requestManager.create(request).then((request) => {
        return res.json(request);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});
router.put('/request', auth_middleware_1.AuthMiddleware.requireLogin, requests_middleware_1.RequestsMiddleware.requireRequestOwner, (req, res) => {
    let request = req.body.request;
    requestManager.update(request).then((request) => {
        return res.json(request);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});
router.delete('/request/:id', auth_middleware_1.AuthMiddleware.requireLogin, requests_middleware_1.RequestsMiddleware.requireRequestOwner, (req, res) => {
    requestManager.delete(req.params.id).then((request) => {
        if (!request) {
            return res.sendStatus(404);
        }
        return res.json(request);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});
module.exports = router;
