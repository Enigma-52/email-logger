import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import pixelRoutes from './routes/pixelRoutes';
import categoryRoutes from './routes/categoryRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/pixel', pixelRoutes);
app.use('/categories', categoryRoutes);


app.get('/health', (req, res) => {
  res.sendStatus(200).send('OK');
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
