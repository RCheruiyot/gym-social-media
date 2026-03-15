"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
exports.router = (0, express_1.Router)();
exports.router.get('/health', controllers_1.getHealth);
exports.router.get('/posts', controllers_1.getPosts);
exports.router.post('/posts', controllers_1.createPost);
