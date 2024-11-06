"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const pixelRoutes_1 = __importDefault(require("./routes/pixelRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/auth', authRoutes_1.default);
app.use('/pixel', pixelRoutes_1.default);
app.use('/categories', categoryRoutes_1.default);
app.get('/health', (req, res) => {
    res.sendStatus(200).send('OK');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
