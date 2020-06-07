const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    //Store user
    const user = {id ,username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    //find index is a bit better than filter because it stops when it finds a match
    const index = users.findIndex((user) => {
        return id === user.id
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id)
    return user
}

const getUsersInRoom = (room) => {
    const foundUsers =  users.filter((user) => {
        return user.room === room
    })
    return foundUsers
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
