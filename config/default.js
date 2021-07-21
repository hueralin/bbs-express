module.exports = {
    port: 3000,
    session: {
        secret: 'n-blog',
        key: 'n-blog',
        maxAge: 2592000000
    },
    mongodb: 'mongodb://localhost:27017/n-blog'
}
