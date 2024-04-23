const io = require("socket.io")(8900, {
    cors: {
        origin: ["http://localhost:3000", "https://fsd-frontend.vercel.app"],
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

    socket.on("roleChangeReq", (userId, role) => {
        console.log(userId, role);
        const user = getUser(userId);
        io.to(user[0]?.socketId).emit("roleChanged", role);
    });
    
    socket.on("logoutAll", ({ userId }) => {
        const user = getUser(userId);
        for (let i = 0; i < user.length; i++) {
            io.to(user[i]?.socketId).emit("allDeviceLogout", "logout");
        }

    });

    // socket.on when project assigned to group of users and we need to send notification to that added users
    socket.on("projectAssigned", (id, projectId, projectName) => {
        const user = getUser(id);
            io.to(user[0]?.socketId).emit("projectAssigned", { userId: id, projectId, projectName });
    });

    //when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});
 