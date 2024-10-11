import express from "express";
import cors from "cors";
import path from "path";
import env from "dotenv";
import CustomersXenditControllers from "./controllers/xendit/CustomerXenditControllers";
import VirtualAccountXenditControllers from "./controllers/xendit/VirtualAccountXenditControllers";
import DirectDebitXenditControllers from "./controllers/xendit/DirectDebitXenditControllers";
import TransactionXenditControllers from "./controllers/TransactionControllers";

const app = express();
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";

env.config({
  path: envFile,
});
const PORT = process.env.PORT;

//MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/public")));

//ROUTES
app.use("/api", CustomersXenditControllers);
app.use("/api", VirtualAccountXenditControllers);
app.use("/api", DirectDebitXenditControllers);
app.use("/api", TransactionXenditControllers);

//LISTENER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
    SERVER RUNNING TO PORT ${PORT}
    `);
});
