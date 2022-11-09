"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const E = __importStar(require("fp-ts/Either"));
const IO = __importStar(require("fp-ts/IO"));
const IOE = __importStar(require("fp-ts/IOEither"));
const B = __importStar(require("fp-ts/boolean"));
const function_1 = require("fp-ts/function");
const app = (0, express_1.default)();
const port = 3000;
const unsafeRunIO = (io) => io();
const unsafeRandom = () => Math.random();
const unsafeRandomBool = () => unsafeRandom() <= 0.5;
const random = unsafeRandom;
const randomBool = (0, function_1.pipe)(random, IO.map((value) => value <= 0.5));
const createResponse = (code, json) => ({ code, json });
const doStuffFp = (0, function_1.pipe)(randomBool, IO.chain(B.match(() => IO.of(0), () => random)), IO.chain((value) => (0, function_1.pipe)(randomBool, IO.map(B.match(() => E.left('error'), () => E.of(value))))), IOE.match((error) => createResponse(500, { error }), (value) => createResponse(200, { value })));
const doStuffException = () => {
    let value = undefined;
    try {
        if (unsafeRandomBool()) {
            value = unsafeRandom();
        }
    }
    catch (error) {
        value = 0;
    }
    try {
        if (unsafeRandomBool()) {
            throw new Error('error');
        }
        return createResponse(500, { value });
    }
    catch (error) {
        return createResponse(500, { error: error.message });
    }
};
app.get('/fp', (_, res) => {
    const { code, json } = unsafeRunIO(doStuffFp);
    res.status(code).send(JSON.stringify(json));
});
app.get('/exception', (_, res) => {
    const { code, json } = doStuffException();
    res.status(code).send(JSON.stringify(json));
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
