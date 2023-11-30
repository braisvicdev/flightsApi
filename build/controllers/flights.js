"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByDays = void 0;
const error_handle_1 = require("../utils/error.handle");
const flights_service_1 = __importDefault(require("../services/flights.service"));
const getByDays = async (req, res) => {
    try {
        const response = await (0, flights_service_1.default)(req.query);
        res.send(response);
    }
    catch (error) {
        (0, error_handle_1.handleHttp)(res, String(error));
    }
};
exports.getByDays = getByDays;
