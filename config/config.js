module.exports = {
    port: process.env.PORT || 5000,
    db: {
        database: process.env.DB_NAME || "scoutDatabase",
        user: process.env.DB_USER || "AhmedDali",
        password: process.env.DB_PASS || "@hmed2025",
        dialect: process.env.DIALECT || "mssql",
        host: process.env.HOST || "databasescout.database.windows.net",
        port :1433
        
    },
    authentication: {
        jwtSecret : process.env.JWT_SECRET || 'secret'
    }
}