// scripts/seed.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log("MONGODB_URI:", process.env.MONGODB_URI);
const { default: clientPromise } = await import("../lib/mongodb.js");

async function createCollections() {
  const client = await clientPromise;
  const db = client.db("leetcode-clone");

  // Create users collection with validation
  try {
    await db.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["email", "username"],
          properties: {
            email: { bsonType: "string" },
            username: { bsonType: "string" },
            totalSubmissions: { bsonType: "int" },
            successfulSubmissions: { bsonType: "int" },
            lastSubmission: { bsonType: "date" }
          }
        }
      }
    });
    console.log("Created users collection");
  } catch (e) {
    if (e.code !== 48) { // 48 is collection already exists
      console.error("Error creating users collection:", e);
    }
  }

  // Create submissions collection with validation
  try {
    await db.createCollection("submissions", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "problemId", "code", "status"],
          properties: {
            userId: { bsonType: "objectId" },
            problemId: { bsonType: "objectId" },
            code: { bsonType: "string" },
            language: { bsonType: "string" },
            status: { bsonType: "string" },
            executionTime: { bsonType: "number" },
            memoryUsed: { bsonType: "number" },
            timestamp: { bsonType: "date" }
          }
        }
      }
    });
    console.log("Created submissions collection");
  } catch (e) {
    if (e.code !== 48) {
      console.error("Error creating submissions collection:", e);
    }
  }

  // Create indexes
  try {
    await db.collection("submissions").createIndex({ userId: 1 });
    await db.collection("submissions").createIndex({ problemId: 1 });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    console.log("Created indexes");
  } catch (e) {
    console.error("Error creating indexes:", e);
  }
}

async function seed() {
  const client = await clientPromise;
  const db = client.db("leetcode-clone");

  // Create initial collections and indexes
  await createCollections();

  const problems = [
    {
      title: "Sum of Two Numbers",
      description: "Given two numbers, return their sum.",
      statement:
        "Write a function that takes two numbers as input and returns their sum.\n\nExample:\nInput: a = 3, b = 4\nOutput: 7",
      difficulty: "easy",
      category: "arrays",
      successRate: 85.5,
      testCases: [
        { input: "3\n4", expectedOutput: "7" },
        { input: "10\n20", expectedOutput: "30" },
        { input: "-5\n8", expectedOutput: "3" }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Reverse a String",
      description: "Reverse the input string.",
      statement:
        "Write a function that reverses a given string.\n\nExample:\nInput: hello\nOutput: olleh",
      difficulty: "easy",
      category: "strings",
      successRate: 78.2,
      testCases: [
        { input: "hello", expectedOutput: "olleh" },
        { input: "world", expectedOutput: "dlrow" },
        { input: "leetcode", expectedOutput: "edocteel" }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Check for Palindrome",
      description: "Determine if the input string is a palindrome.",
      statement:
        "Write a function that checks if a given string is a palindrome.\n\nExample:\nInput: racecar\nOutput: true",
      difficulty: "easy",
      category: "strings",
      successRate: 72.8,
      testCases: [
        { input: "racecar", expectedOutput: "true" },
        { input: "hello", expectedOutput: "false" },
        { input: "level", expectedOutput: "true" }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Binary Tree Level Order Traversal",
      description: "Given a binary tree, return the level order traversal of its nodes' values.",
      statement: 
        "Implement level order traversal of a binary tree.\n\nExample:\nInput: [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]",
      difficulty: "medium",
      category: "trees",
      successRate: 65.3,
      testCases: [
        { 
          input: "[3,9,20,null,null,15,7]", 
          expectedOutput: "[[3],[9,20],[15,7]]" 
        },
        {
          input: "[1]",
          expectedOutput: "[[1]]"
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Maximum Subarray Sum",
      description: "Find the contiguous subarray with the largest sum.",
      statement: 
        "Given an array of integers, find the contiguous subarray with the largest sum.\n\nExample:\nInput: [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6",
      difficulty: "medium",
      category: "dynamic-programming",
      successRate: 58.7,
      testCases: [
        { 
          input: "[-2,1,-3,4,-1,2,1,-5,4]", 
          expectedOutput: "6" 
        },
        {
          input: "[1,2,3,4]",
          expectedOutput: "10"
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Merge K Sorted Lists",
      description: "Merge k sorted linked lists into one sorted linked list.",
      statement: 
        "Merge k sorted linked lists into one sorted linked list.\n\nExample:\nInput: [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]",
      difficulty: "hard",
      category: "linked-lists",
      successRate: 42.1,
      testCases: [
        { 
          input: "[[1,4,5],[1,3,4],[2,6]]", 
          expectedOutput: "[1,1,2,3,4,4,5,6]" 
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    }
  ];

  try {
    // Clear existing problems
    await db.collection("problems").deleteMany({});
    console.log("Cleared existing problems");

    // Insert new problems
    const result = await db.collection("problems").insertMany(problems);
    console.log(`Successfully inserted ${result.insertedCount} problems`);

    // Create sample user for testing
    const sampleUser = {
      email: "test@example.com",
      username: "testuser",
      totalSubmissions: 0,
      successfulSubmissions: 0,
      lastSubmission: new Date(),
      createdAt: new Date()
    };

    // Try to create sample user (ignore if already exists)
    try {
      await db.collection("users").insertOne(sampleUser);
      console.log("Created sample user");
    } catch (e) {
      if (e.code !== 11000) { // 11000 is duplicate key error
        console.error("Error creating sample user:", e);
      }
    }

  } catch (error) {
    console.error("Error seeding data:", error);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});