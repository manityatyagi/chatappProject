import mongoose from 'mongoose';

const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
                      useNewUrlParser: true,
                      useUnifiedTopology: true,
                      serverSelectionTimeoutMS: 5000,
        });
        logger.info(`MONGODB connected successfully: ${conn.connection.host}`);
        mongoose.connection.on("connected", () => {
            logger.info('Mongoose connected to DB');
        });
        mongoose.connection.on("error", (err) => {
            logger.error(`Mongoose connection error: ${err}`);
        });
        mongoose.connection.on("disconnected", () => {
            logger.info('Mongoose disconnected from DB');
        });

        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            process.exit(0)
        })
    } catch (error) {
        logger.error(`Database connection error: ${err.message}`); 
        process.exit(1);
    }
}

export { connectDB };