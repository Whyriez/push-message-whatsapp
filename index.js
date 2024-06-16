import express from "express";
import cors from "cors";
import WhatsAppRoute from "./routes/WhatsAppRoute.js";
import bodyParser from "body-parser";

const app = express();

app.get("/", (req, res) => {
  res.send("Api Ready");
});

// app.use(
//   cors({
//     credentials: true,
//     origin: ["http://localhost:3000", "http://secret-chat.my.id"],
//   })
// );
app.use(bodyParser.json());
app.use(WhatsAppRoute);

app.listen(5000, () => {
  console.log("Server Running", 5000);
});
