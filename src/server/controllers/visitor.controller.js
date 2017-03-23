"use strict";
const express = require("express");
const visitor_manager_1 = require("./../managers/visitor.manager");
const auth_middleware_1 = require("./../middlewares/auth.middleware");
var router = express.Router();
var visitorManager = new visitor_manager_1.VisitorManager();
router.get('/visitor/:id', auth_middleware_1.AuthMiddleware.requireLogin, (req, res) => {
    let id = req.param('id');
    if (id.trim()) {
        visitorManager.read(id).then(visitor => res.json(visitor))
            .catch(error => res.status(500).send(error));
    }
    else {
        res.status(400).send();
    }
});
module.exports = router;
