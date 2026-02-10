import dotenv from "dotenv";
import express from "express";
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.json());

const EMAIL = process.env.OFFICIAL_EMAIL;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

/* ---------- Utility Functions ---------- */

const fibonacci = (n) => {
  const res = [0, 1];
  for (let i = 2; i < n; i++) {
    res.push(res[i - 1] + res[i - 2]);
  }
  return res.slice(0, n);
};

const isPrime = (n) => {
  if (n <= 1) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const hcfArray = (arr) => arr.reduce((a, b) => gcd(a, b));
const lcm = (a, b) => (a * b) / gcd(a, b);
const lcmArray = (arr) => arr.reduce((a, b) => lcm(a, b));

/* ---------- POST /bfhl ---------- */

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (body.fibonacci !== undefined) {
      if (!Number.isInteger(body.fibonacci)) {
        return res.status(400).json({ is_success: false });
      }
      return res.json({
        is_success: true,
        official_email: EMAIL,
        data: fibonacci(body.fibonacci)
      });
    }

    if (body.prime) {
      return res.json({
        is_success: true,
        official_email: EMAIL,
        data: body.prime.filter(isPrime)
      });
    }

    if (body.lcm) {
      return res.json({
        is_success: true,
        official_email: EMAIL,
        data: lcmArray(body.lcm)
      });
    }

    if (body.hcf) {
      return res.json({
        is_success: true,
        official_email: EMAIL,
        data: hcfArray(body.hcf)
      });
    }

    if (body.AI) {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
        {
          contents: [{ parts: [{ text: body.AI }] }]
        }
      );

      const answer =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text
          ?.trim()
          ?.split(" ")[0] || "Unknown";

      return res.json({
        is_success: true,
        official_email: EMAIL,
        data: answer
      });
    }

    res.status(400).json({ is_success: false });
  } catch (err) {
    res.status(500).json({ is_success: false });
  }
});

/* ---------- GET /health ---------- */

app.get("/health", (req, res) => {
  res.json({
    is_success: true,
    official_email: EMAIL
  });
});

/* ---------- Start Server ---------- */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
