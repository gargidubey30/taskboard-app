// pages/api/auth/login.js
import bcrypt from "bcryptjs";
import * as cookie from 'cookie';

import { signToken } from "@/lib/auth";
import { getUserByUsername } from "@/lib/data";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });

  try {
    const user = await getUserByUsername(username);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ id: user.id, username: user.username });

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        path: "/",
      })
    );

    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Something went wrong (login)" });
  }
}
