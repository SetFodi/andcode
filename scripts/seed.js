// scripts/seed.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Load env variables first
console.log("MONGODB_URI:", process.env.MONGODB_URI);
const { default: clientPromise } = await import("../lib/mongodb.js");

async function seed() {
  const client = await clientPromise;
  const db = client.db("leetcode-clone");
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
        { input: "3\n4", expectedOutput: "7" }
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
        { input: "hello", expectedOutput: "olleh" }
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
        { input: "racecar", expectedOutput: "true" }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Find Maximum of Two Numbers",
      description: "Given two numbers, return the greater one.",
      statement:
        "Write a function that takes two numbers as input and returns the maximum of the two.\n\nExample:\nInput: a = 5, b = 3\nOutput: 5",
      difficulty: "easy",
      category: "arrays",
      successRate: 89.1,
      testCases: [
        { input: "5\n3", expectedOutput: "5" }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Multiply Two Numbers",
      description: "Given two numbers, return their product.",
      statement:
        "Write a function that takes two numbers as input and returns their product.\n\nExample:\nInput: a = 4, b = 3\nOutput: 12",
      difficulty: "easy",
      category: "arrays",
      successRate: 86.4,
      testCases: [
        { input: "4\n3", expectedOutput: "12" }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    // Adding some medium and hard problems
    {
      title: "Binary Tree Level Order Traversal",
      description: "Given a binary tree, return the level order traversal of its nodes' values.",
      statement: "Implement level order traversal of a binary tree.\n\nExample:\nInput: [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]",
      difficulty: "medium",
      category: "trees",
      successRate: 65.3,
      testCases: [
        { input: "[3,9,20,null,null,15,7]", expectedOutput: "[[3],[9,20],[15,7]]" }
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
      statement: "Given an array of integers, find the contiguous subarray with the largest sum.\n\nExample:\nInput: [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6",
      difficulty: "medium",
      category: "dynamic-programming",
      successRate: 58.7,
      testCases: [
        { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" }
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
      statement: "Merge k sorted linked lists into one sorted linked list.\n\nExample:\nInput: [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]",
      difficulty: "hard",
      category: "linked-lists",
      successRate: 42.1,
      testCases: [
        { input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]" }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    }
  ];

  try {
    await db.collection("problems").deleteMany({}); // Clear existing data
    const result = await db.collection("problems").insertMany(problems);
    console.log(`Successfully inserted ${result.insertedCount} problems`);
    console.log("Seed data inserted");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    process.exit(0);
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});