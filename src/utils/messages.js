const generateMessage = (username, text,) => {
    return {
        text,
        username,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, location) => {
    return {
        url: location,
        username,
        createdAt: new Date().getTime()
    }
}
module.exports = { generateMessage, generateLocationMessage }