import express from "express";
import bodyParser from "body-parser";
import webpush from "web-push";
import cors from "cors";

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Lưu subscription tạm (production thì nên lưu DB)
let subscriptions = [];

// Setup VAPID
const publicKey =
  "BHMSlDgH3FCcT5QBYr3OATHJEV3yxLlAPMMV8A8fqCJObAAmqifOP_6kldtCKWhkfhTDojzPkKb9C_oSl9NEOIk";
const privateKey = "QhvVdhhp1W8h-08EIfg83Y-qrzseVgPqzx4BCIE7rJI";

webpush.setVapidDetails("mailto:your@email.com", publicKey, privateKey);

// API: Client gửi subscription lên server
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  console.log("req.body ==> ", subscription);
  subscriptions.push(subscription);
  console.log("subscriptions ==> ", subscriptions);
  res.status(201).json({ message: "Subscribed!" });
});

// API: gửi noti ngẫu nhiên
app.post("/send", async (req, res) => {
  const payload = JSON.stringify({
    title: "Hello from server 🎉",
    body: "Random message: " + Math.random(),
  });
  console.log("payload ==> ", payload);
  console.log("subscriptions ==> ", subscriptions);

  try {
    await Promise.all(
      subscriptions.map((sub) => webpush.sendNotification(sub, payload))
    );
    res.json({ message: "Push sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send push" });
  }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:4000");
  console.log("Access from other devices using your IP address");
});
