import {socker} from './socker/index.js';
import express from 'express'
import http from 'node:http';
// const express = require("express")
// const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
socker(server)


server.listen(3000, () => {
    console.log('listening on *:3000');
});