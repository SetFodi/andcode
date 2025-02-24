// app/api/auth/register/route.js
import bcrypt from 'bcryptjs';  // Use bcryptjs instead of bcrypt
import { v4 as uuidv4 } from 'uuid';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { email, username, password } = await request.json();

    // Check if user already exists (you can modify this part based on your requirement)
    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return new Response("User already exists", { status: 400 });
    }

    // Hash the password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = {
      email,
      username,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    // Generate a token (you can use a JWT here for authentication)
    const token = uuidv4(); // Temporary token (you should generate a JWT token here)

    // Return the user data and token
    return new Response(
      JSON.stringify({ token, userId: result.insertedId }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response("Failed to register user", { status: 500 });
  }
}
