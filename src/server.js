import { server as WebSocketServer } from "websocket";
import http from "http";
import uniqueid from "lodash.uniqueid";
import express from "express";
import path from "path";

const app = new express();
const PORT = 3001;
const clients = [];

// sends message to all clients connected to websocket
const sendToAllClients = message => {
  clients.forEach(client => {
    client.sendUTF(message);
  });
};

// webhook sending specific action to the front end
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

//create server
const server = http
  .createServer(app)
  .listen(PORT, () => console.log(`Server is running on port ${PORT}`));

//creating websocket server
const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

//websocket request
wsServer.on("request", req => {
  //connection (can filter by origin)
  const connection = req.accept(null, req.origin);

  //set unique id and add to connections array
  connection.id = uniqueid();
  clients.push(connection);

  // what happens on any message
  connection.on("message", message => {
    console.log("Received message");
    sendToAllClients(message.utf8Data);
  });

  //called on client disconnect
  connection.on("close", () => {
    console.log(`${connection.remoteAddress} disconnected`);
    //remove current client from array
    clients.filter(c => c.id !== connection.id);
  });
});
