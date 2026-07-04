import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import {rateLimit, ipKeyGenerator} from 'express-rate-limit';
import proxy from 'express-http-proxy';

const app = express();

//global middlewares
app.use(cors({
    origin : process.env.CORS_ORIGIN || ['http://localhost:3000'],
    allowedHeaders : ['Authorization', 'Content-Type'],
    credentials : true,
}));
app.use(morgan('dev'));
app.use(express.json({limit : '100mb'}));
app.use(express.urlencoded({limit : '100mb', extended: true }));
app.use(cookieParser());
app.set('trust proxy', 1);

//Rate limiting - Global:
const limiter = rateLimit({
    windowMs : 15*60*1000,
    max : (req : any)=>(req.user ? 1000 : 100),
    message : { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders : true,
    legacyHeaders : true,
    keyGenerator : (req : any) => ipKeyGenerator(req.ip)
});

app.use(limiter);


//api gateway health check route
app.get('/gateway-health', (req, res)=>{
    res.status(200).json({status : 'ok', message : 'API Gateway is healthy and running!'});
})

//API GATEWAY PROXY:
app.use('/', proxy('http://localhost:6001'));



const port = process.env.PORT || 8080;
const server = app.listen(port, ()=>{
    console.log(`API Gateway is running on port ${port}`);
});

server.on('error', (err)=>{
    console.error('Error occurred while starting API Gateway:', err);
});