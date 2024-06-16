import express from "express";
import { sendMessage, getQRCode } from "../controller/WhatsappController.js";
import configDotenv from "dotenv";

import apiKeys from "../utils/apiKey.js";

configDotenv.config();

const router = express.Router();

router.post("/send-message", checkApiKey, sendMessage);
router.get("/get-qr", checkApiKey, getQRCode);

function checkApiKey(req, res, next) {
  const apiKey = req.query.api_key;

  if (!apiKey || !apiKeys.has(apiKey)) {
    return res.status(401).json({ message: "Unauthorized: Invalid API Key" });
  }

  next();
}

export default router;
