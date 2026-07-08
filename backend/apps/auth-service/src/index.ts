import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware.js';
import cookieParser from 'cookie-parser';
import router from './routes/auth.router.js';

const app = express();

app.use(cors({
  origin : ["http://localhost:3000", "http://localhost:3001"],
  allowedHeaders : ["Authorization", "Content-Type"],
  credentials : true
}))
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

//Routes:
app.use(router)


app.use(errorMiddleware)

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to auth-service!' });
});

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
