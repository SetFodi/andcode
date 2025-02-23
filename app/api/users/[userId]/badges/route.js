// app/api/users/[userId]/badges/route.js
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("leetcode-clone");
    
    const badges = await db.collection("badges")
      .find({ userId: new ObjectId(params.userId) })
      .sort({ earnedAt: -1 })
      .toArray();

    return new Response(JSON.stringify(badges), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch badges" }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}