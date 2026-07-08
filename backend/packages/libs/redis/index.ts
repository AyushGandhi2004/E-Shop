import {Redis} from 'ioredis'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, "../../../../.env"),
});
const url = process.env.REDIS_URL as string;

// console.log(`url : ${url}`)

const redis = new Redis(url);

export default redis




// All Redis Keys :

// AUTH :
// otp:email -> Actual Stored OTP
// otp:count:email -> Keeps the count of the no. of otp req by a email
// otp:limit:email -> If OTP is sent recently and we need to set timer for resend OTP sendEmail, this key is used
// otp:fail:email -> No. of Failed attempts
// otp:lock:email -> If a acc has many failed otp i.e submitted wrong otps lock it for 30 mins
// otp:spam:email -> If a person sends >=2 otp request for same email we spam the acc for 1 Hr
