const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const sendOTP = require("../js/emailService"); 
require('dotenv').config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");

async function findUserByEmail(email) {
  console.log("find user by email is revoked");
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
}

router.post("/", async (req, res) => {
  const {
    role,
    name,
    brandName,
    email,
    password,
    website,
    segment,
    audience,
    platforms,
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
    INSERT INTO users (role, name, brandName, email, password, website, segment, audience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

    db.query(
      sql,
      [
        role,
        name,
        brandName,
        email,
        hashedPassword,
        website,
        segment,
        audience,
      ],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const userId = result.insertId;
        if (role === "influencer" && platforms) {
          const platformEntries = Object.entries(platforms).map(
            ([platform, info]) => [
              userId,
              platform,
              info.handle,
              info.followers,
            ]
          );

          db.query(
            "INSERT INTO platforms (user_id, platform, handle, followers) VALUES ?",
            [platformEntries],
            (err2) => {
              if (err2) return res.status(500).json({ error: err2.message });
              return res.json({ message: "User registered with platforms" });
            }
          );
        } else {
          res.json({ message: "User registered" });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Something went wrong during signup" });
  }
});

router.get("/", async (req, res) => {
  const { email, password } = req.query;
  try {
    const [results] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const otpMap = {}; 


router.post("/forgot-password", async (req, res) => {
  console.log("POST /forgot-password hit");
  const { email } = req.body;
  const user = await findUserByEmail(email);
  console.log("user: ", user);
  if (!user) return res.status(404).json({ error: "User not found" });
  console.log("otp generating in backend");

  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  otpMap[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  try {
    const info = await sendOTP(email, otp);
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const entry = otpMap[email];

  if (!entry || entry.otp !== parseInt(otp) || Date.now() > entry.expiresAt) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);
    delete otpMap[email];
    res.json({ message: "Password successfully updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, email, newPassword } = req.body;

  if (!token || !email || !newPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [results] = await db.query("SELECT * FROM users WHERE email = ? AND resetToken = ?", [email, token]);
    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ?, resetToken = NULL WHERE email = ?", [hashedPassword, email]);
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/influencers/all", async (req, res) => {
  const sql = `SELECT u.id, u.name, u.email, u.segment, u.audience, u.image,
                      p.platform, p.handle, p.followers
               FROM users u
               LEFT JOIN platforms p ON u.id = p.user_id
               WHERE u.role = 'influencer'`;

  try {
    const [rows] = await db.query(sql);
    const influencersMap = {};

    rows.forEach((row) => {
      if (!influencersMap[row.email]) {
        influencersMap[row.email] = {
          name: row.name,
          email: row.email,
          segment: row.segment,
          audience: row.audience,
          image: row.image,
          platforms: {},
        };
      }
      if (row.platform) {
        influencersMap[row.email].platforms[row.platform] = {
          handle: row.handle,
          followers: row.followers,
        };
      }
    });

    res.json(Object.values(influencersMap));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const userId = req.params.id;
  const { name, segment, audience, image } = req.body;

  try {
    await db.query(
      "UPDATE users SET name = ?, segment = ?, audience = ?, image = ? WHERE id = ?",
      [name, segment, audience, image, userId]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/profile", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];

    if (user.role === "influencer") {
      const [platformsData] = await db.query(
        "SELECT platform, handle, followers FROM platforms WHERE user_id = ?",
        [user.id]
      );

      const platforms = {};
      platformsData.forEach((p) => {
        platforms[p.platform] = {
          handle: p.handle,
          followers: p.followers,
        };
      });

      user.platforms = platforms;
    }

    res.json([user]);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.patch("/campaigns/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.query("UPDATE campaigns SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
