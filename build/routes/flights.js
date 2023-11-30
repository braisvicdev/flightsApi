"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const flights_1 = require("../controllers/flights");
const router = (0, express_1.Router)();
exports.router = router;
router.get("/", flights_1.getByDays);
