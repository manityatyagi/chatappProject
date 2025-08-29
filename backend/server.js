import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/User.routes'


dotenv.config();
const app = express();

app.use('/api/v1/auth', userRoutes)

const PORT = process.env.PORT || 5500;
app.listen(PORT, (req, res) => {
    console.log(`Server is running on http:localhost${PORT}`);
})