import { app } from "./app";
import { connectDb } from "./utils/db";

require("dotenv").config();

app.listen(process.env.PORT, () => {
  console.log(`i am running on ${process.env.PORT}`);
  connectDb();
});
