import { Client as WhatsAppClient } from "whatsapp-web.js";
import qrcode from "qrcode";

let client;

// Initialize WhatsApp Client
client = new WhatsAppClient({
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  },
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  session: null,
});

// Event listener for QR code
// client.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
// });
client.on("qr", async (qr) => {
  try {
    const qrCodeDataUrl = await generateQRCode(qr);
    client.qrCodeDataUrl = qrCodeDataUrl; // Store QR code data URL for future requests
    console.log("QR code generated.");
  } catch (error) {
    console.error("Error generating QR code:", error);
  }
});

// Event listener when client is ready
client.on("ready", () => {
  console.log("WhatsApp Client is ready!");
});

// Initialize the client
client.initialize();

const generateQRCode = async (qr) => {
  const qrCodeDataUrl = await qrcode.toDataURL(qr);
  return qrCodeDataUrl;
};

// Function to get QR code data URL
export const getQRCode = async (req, res) => {
  try {
    if (!client || !client.qrCodeDataUrl) {
      throw new Error("QR Code not available yet.");
    }
    res.send(client.qrCodeDataUrl);
  } catch (error) {
    console.error("Error fetching QR code:", error);
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const { to, message } = req.body;

  try {
    const chatId = `${to}@c.us`;
    await client.sendMessage(chatId, message);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    res.status(500).send({ success: false, error: error.message });
  }
};
