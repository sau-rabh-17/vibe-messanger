import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { Server } from "socket.io";
import { Socket } from "dgram";

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});



export const userSocketMap = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);
    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    socket.on("disconnect", () => {
        console.log("user disconnectd", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

app.use(express.json({ limit: "4mb" }));
app.use(cors());

app.use("/api/status", (req, res) => {
    res.send("server is live");
})
app.use("/api/auth", userRouter)
app.use("/api/messages", messageRoutes)

await connectDB();

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
    server.listen(PORT, () => {
        console.log(`server in running on port: ${PORT}`)
    })
}

export default server;
