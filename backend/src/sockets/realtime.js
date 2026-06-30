let ioInstance = null;

function initRealtime(io) {
    ioInstance = io;

    io.on('connection', (socket) => {
        socket.on('project:join', (projectId) => {
            socket.join(roomName(projectId))
        });
        socket.on('project:leave', (projectId) => {
            socket.leave(roomName(projectId))
        })

        socket.on('disconnect', () => {
            // socket.io cleands up
        })
    })
}

function roomName(projectId) {
    return `project: ${projectId}`
}

function broadcastIssueEvent(eventName, payload) {
    if(!ioInstance) return;
    if(payload && payload.projectId) {
        ioInstance.to(roomName(payload.projectId)).emit(eventName, payload)
    } else {
        ioInstance.emit(eventName, payload)
    }
}

module.exports = { initRealtime, broadcastIssueEvent }