const env = {
    port: Number(process.env.PORT),
    mongoUrl:process.env.MONGO_DATABASE_URL,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    /** -- Cloudinary Details -- */
    // cloudinaryUrl: process.env.CLOUDINARY_URL,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

    /** --- Temporary File Storage -- */
    tempFileStoragePath:  `${__dirname}/${process.env.TEMP_FILE_STORAGE}`,
    /** --- View EJS Template Path -- */
    viewsPath: `${__dirname}/views`,
    email:{
        from: process.env.EMAIL_FROM,
        host: process.env.EMAIL_HOST, // hostname 
        secureConnection: false, // TLS requires secureConnection to be false
        port: Number(process.env.EMAIL_SMTP_PORT), // port for secure SMTP 
        tls: {
            ciphers:'SSLv3'
        },
        transportMethod: process.env.EMAIL_TRANSPORT_METHOD, // default is SMTP. Accepts anything that nodemailer accepts 
        auth: {
            user: process.env.EMAIL_AUTH_USER,
            pass: process.env.EMAIL_AUTH_PASSWORD,
        }
    },
    defaultAdmin:{
        firstName:process.env.DEFAULT_FIRST_NAME,
        lastName:process.env.DEFAULT_LAST_NAME,
        email:process.env.DEFAULT_EMAIL,
        password:process.env.DEFAULT_PASSWORD,
    },

    stripe: {
        publishKey: process.env.STRIPE_PUBLISH_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY
    },
    linkedIn: {
        redirectUri: process.env.LINKEDIN_CALLBACK_REDIRECT_URI,
        clientId: process.env.LINKEDIN_CLIENTID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET
    },
    ADMIN_APP_URL:process.env.IDEA_EXCHANGE_ADMIN,
    CLIENT_APP_URL:process.env.IDEA_EXCHANGE_CLIENT,
}

module.exports = env