import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware.js';
import cookieParser from 'cookie-parser';
import initializeSiteConfig from './libs/initializeSiteConfig.js';
import router from './routes/product.routes.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

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
app.use("/api", router)


app.use(errorMiddleware)

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to product-service!' });
});

const port = process.env.PORT || 6002;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/products`);
  try {
    initializeSiteConfig();
    console.log("Site Config Successfully initialised")
  } catch (error) {
    console.error(error);
  }
});
server.on('error', console.error);
