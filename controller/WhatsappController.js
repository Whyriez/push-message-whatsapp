import { Client as WhatsAppClient } from "whatsapp-web.js";
import chromium from "chrome-aws-lambda";
import qrcode from "qrcode";

let client;
let qrCodePromise; // Promise to track QR code generation

async function setupWhatsAppClient() {
  try {
    const executablePath = await chromium.executablePath;
    console.log("Chromium executable path:", executablePath);

    // Initialize WhatsApp Client
    client = new WhatsAppClient({
      webVersionCache: {
        type: "remote",
        remotePath:
          "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
      },
      puppeteer: {
        executablePath,
        args: [
          ...chromium.args,
          "--hide-scrollbars",
          "--disable-web-security",
          "--disable-dev-shm-usage",
          "--no-sandbox",
          "--disable-setuid-sandbox",
        ],
        defaultViewport: chromium.defaultViewport,
        headless: true,
        ignoreHTTPSErrors: true,
      },
    });

    // Event listener for QR code
    qrCodePromise = new Promise((resolve, reject) => {
      client.on("qr", async (qr) => {
        console.log("QR code received:", qr);
        try {
          const qrCodeDataUrl = await generateQRCode(qr);
          client.qrCodeDataUrl = qrCodeDataUrl; // Store QR code data URL for future requests
          console.log("QR code generated:", qrCodeDataUrl);
          resolve(); // Resolve the promise once QR code is generated
        } catch (error) {
          console.error("Error generating QR code:", error);
          reject(error); // Reject promise if there's an error generating QR code
        }
      });
    });

    // Event listener when client is ready
    client.on("ready", () => {
      console.log("WhatsApp Client is ready!");
    });

    // Initialize the client
    await client.initialize();
    console.log("WhatsApp Client initialized successfully.");
  } catch (error) {
    console.error("Error setting up WhatsApp client:", error);
  }
}

setupWhatsAppClient();

const generateQRCode = async (qr) => {
  try {
    console.log("Generating QR code for:", qr); // Tambahkan log ini
    const qrCodeDataUrl = await qrcode.toDataURL(qr);
    console.log("QR code data URL:", qrCodeDataUrl); // Tambahkan log ini
    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error; // Re-throw error to handle it in calling function
  }
};

// Function to get QR code data URL
export const getQRCode = async (req, res) => {
  try {
    console.log("Waiting for QR code to be generated...");
    await qrCodePromise;
    console.log("QR Code promise resolved.");

    // Optional: Add a small delay to ensure QR code is available
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!client || !client.qrCodeDataUrl) {
      throw new Error("QR Code not available yet.");
    }
    res.send(client.qrCodeDataUrl);
  } catch (error) {
    console.error("Error fetching QR code:", error);
    res.status(500).json({ message: error.message });
  }
};

// Function to send WhatsApp message
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
