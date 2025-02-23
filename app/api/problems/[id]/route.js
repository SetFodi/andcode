// app/api/problems/[id]/route.js
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET(request, { params }) {
  const { id } = await params; // Await the params

  try {
    const client = await clientPromise;
    const db = client.db("leetcode-clone");
    
    const problem = await db.collection("problems").findOne({
      _id: new ObjectId(id)
    });

    if (!problem) {
      return new Response("Problem not found", { status: 404 });
    }

    return new Response(JSON.stringify(problem), { status: 200 });
  } catch (e) {
    return new Response("Failed to fetch problem", { status: 500 });
  }
}