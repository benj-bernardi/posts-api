import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import { userRotes } from "./routes/user.routes.js" ;

const app = express();

app.use(express.json());
app.use("/users", userRotes);
app.use(errorHandler);

export default app;