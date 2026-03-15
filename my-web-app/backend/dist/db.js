"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/gym_social';
exports.pool = new pg_1.Pool({
    connectionString
});
