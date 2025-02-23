// app/api/problems/route.js
import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const client = await clientPromise;
    const db = client.db("leetcode-clone");

    // Build query based on filters
    const query = {};
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Get total count for pagination
    const total = await db.collection("problems").countDocuments(query);

    // Get paginated results
    const problems = await db
      .collection("problems")
      .find(query)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return new Response(
      JSON.stringify({
        problems,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page,
        },
      }),
      { status: 200 }
    );
  } catch (e) {
    return new Response("Failed to fetch problems", { status: 500 });
  }
}