import "dotenv/config";
import { connectDB } from "./config/db.js";
import app from "./app.js";

const port = process.env.PORT || 4000;

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`API escuchando en http://localhost:${port}`);
  });
}

start();
