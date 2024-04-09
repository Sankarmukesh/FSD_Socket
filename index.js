const io = require("socket.io")(8900, {
    cors: {
        origin: ["http://localhost:3000"],
    },
});

let users = [];

const addUser = (userId, socketId) => {
       // adding Online Users
        users.push({ userId, socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.filter((user) => user.userId === userId);
};

io.on("connection", (socket) => {

    //take userId and socketId from user and add it into list
    socket.on("addUser", (userId) => {
        console.log(userId, "user connected.");
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    socket.on("logoutAll", ({ userId }) => {
        const user = getUser(userId);
        for (let i = 0; i < user.length; i++) {
            io.to(user[i]?.socketId).emit("allDeviceLogout", "logout");
        }

    });

    //when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});
 