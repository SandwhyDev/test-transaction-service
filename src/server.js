import express from "express";
import cors from "cors";
import path from "path";
import env from "dotenv";
import CryptoJS from "crypto-js";
import TransactionXenditControllers from "./controllers/TransactionControllers";
import ClientControllers from "./controllers/ClientControllers";
import IpaymuControllers from "./controllers/IpaymuControllers";
import AppControllers from "./controllers/AppControllers";

const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";

env.config({
  path: envFile,
});

const app = express();
const PORT = process.env.PORT;

//MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/public")));

//ROUTES
app.use("/api", TransactionXenditControllers);
app.use("/api", ClientControllers);
app.use("/api", IpaymuControllers);
app.use("/api", AppControllers);

// // Encrypt
// var ciphertext = CryptoJS.AES.encrypt("my message", "secret key 123").toString();

// // Decrypt
// var bytes = CryptoJS.AES.decrypt(ciphertext, "secret key 123");
// var originalText = bytes.toString(CryptoJS.enc.Utf8);

// console.log(ciphertext);
// console.log(bytes);
// console.log(originalText); // 'my message'

//LISTENER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
    SERVER RUNNING TO PORT ${PORT}
    `);
});
