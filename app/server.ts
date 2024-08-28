// import { createServer, IncomingMessage, ServerResponse } from "http";
// import { parse } from "url";
// import next from "next";
// import WebSocket from "ws";
// import chessboardInstance from "./lib/chess/persistent-chessboard";

// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//     const server = createServer((req: IncomingMessage, res: ServerResponse) => {
//         const parsedUrl = parse(req.url || "", true);
//         handle(req, res, parsedUrl);
//     });

//     const wss = new WebSocket.Server({ server });

//     wss.on("connection", (ws: WebSocket) => {
//         ws.on("message", (message: string) => {
//             const { action, data } = JSON.parse(message);

//             if (action === "move") {
//                 try {
//                     chessboardInstance.movePiece(data.startPos, data.endPos);
//                     const updatedPieces = chessboardInstance.getPieces();
//                     //TODO: also get the checkmate and in check statuses here and send them.
//                     ws.send(
//                         JSON.stringify({ success: true, pieces: updatedPieces })
//                     );
//                 } catch (error: any) {
//                     ws.send(
//                         JSON.stringify({
//                             success: false,
//                             message: error.message,
//                         })
//                     );
//                 }
//             }
//             if (action === "boardUpdate") {
//                 ws.send(
//                     JSON.stringify({ pieces: chessboardInstance.getPieces() })
//                 );
//             }

//             // Handle other actions like 'reset', 'undo', etc.
//         });

//         // Send initial state when a client connects
//         const initialPieces = chessboardInstance.getPieces();
//         ws.send(JSON.stringify({ pieces: initialPieces }));
//     });

//     server.listen(3000, (err?: Error) => {
//         if (err) throw err;
//         console.log("> Ready on http://localhost:3000");
//     });
// });
