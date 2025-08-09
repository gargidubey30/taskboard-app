// pages/api/auth/register.js
import bcrypt from "bcryptjs";
import * as cookie from 'cookie';

import { signToken } from "@/lib/auth";
import { getUserByUsername, addUser } from "@/lib/data";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });

  try {
    const existing = await getUserByUsername(username);
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), username, password: hashed };

    await addUser(newUser);

    const token = signToken({ id: newUser.id, username: newUser.username });

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

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Something went wrong (register)" });
  }
}
