import express from "express";
import cors from "cors";
import path from "path";
import env from "dotenv";
import TransactionXenditControllers from "./controllers/TransactionControllers";
import ClientControllers from "./controllers/ClientControllers";

env.config();

const app = express();
const PORT = process.env.PORT;

console.log(process.env.NODE_ENV);

//MIDDLEWARE
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "/public")));

//ROUTES
app.use("/api", TransactionXenditControllers);
app.use("/api", ClientControllers);

//LISTENER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
    SERVER RUNNING TO PORT ${PORT}
    `);
});
