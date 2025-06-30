import express, { Express, Request, Response } from "express";
import i18n from "./i18n"; // adjust path
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { router } from "./routes/routes";

dotenv.config();
import("./db/conn");
const app: Express = express();
const port = process.env.PORT || 3000;

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(i18n.init);

app.use("/api", router);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
