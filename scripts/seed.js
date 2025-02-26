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
    if (e.code !== 48) { // 48 means collection already exists
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
    // Easy Problems (20+)
    {
      title: "Sum of Two Numbers",
      description: "Given two numbers, return their sum.",
      statement:
        "Write a function that takes two numbers as input and returns their sum.\n\nExample:\nInput: a = 3, b = 4\nOutput: 7",
      difficulty: "easy",
      category: "math",
      successRate: 85.5,
      testCases: [
        { input: "3\n4", expectedOutput: "7" },
        { input: "0\n0", expectedOutput: "0" },
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
        { input: "", expectedOutput: "" },
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
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Find Maximum Number",
      description: "Find the maximum number in an array.",
      statement:
        "Write a function that returns the largest number in an array.\n\nExample:\nInput: [1, 5, 3, 9, 2]\nOutput: 9",
      difficulty: "easy",
      category: "arrays",
      successRate: 88.9,
      testCases: [
        { input: "[1,5,3,9,2]", expectedOutput: "9" },
        { input: "[0]", expectedOutput: "0" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Count Vowels",
      description: "Count the number of vowels in a string.",
      statement:
        "Write a function that counts the vowels (a, e, i, o, u) in a string.\n\nExample:\nInput: hello\nOutput: 2",
      difficulty: "easy",
      category: "strings",
      successRate: 80.1,
      testCases: [
        { input: "hello", expectedOutput: "2" },
        { input: "xyz", expectedOutput: "0" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Even or Odd",
      description: "Determine if a number is even or odd.",
      statement:
        "Write a function that returns 'even' or 'odd' based on the input number.\n\nExample:\nInput: 4\nOutput: even",
      difficulty: "easy",
      category: "math",
      successRate: 90.3,
      testCases: [
        { input: "4", expectedOutput: "even" },
        { input: "7", expectedOutput: "odd" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Find First Duplicate",
      description: "Find the first duplicate in an array.",
      statement:
        "Write a function that returns the first duplicate number in an array, or -1 if none.\n\nExample:\nInput: [1, 3, 4, 3, 6]\nOutput: 3",
      difficulty: "easy",
      category: "arrays",
      successRate: 75.6,
      testCases: [
        { input: "[1,3,4,3,6]", expectedOutput: "3" },
        { input: "[1,2,3]", expectedOutput: "-1" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Multiply Array Elements",
      description: "Multiply all elements in an array.",
      statement:
        "Write a function that multiplies all numbers in an array.\n\nExample:\nInput: [1, 2, 3, 4]\nOutput: 24",
      difficulty: "easy",
      category: "arrays",
      successRate: 82.4,
      testCases: [
        { input: "[1,2,3,4]", expectedOutput: "24" },
        { input: "[5]", expectedOutput: "5" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Capitalize First Letter",
      description: "Capitalize the first letter of a string.",
      statement:
        "Write a function that capitalizes the first letter of a string.\n\nExample:\nInput: hello\nOutput: Hello",
      difficulty: "easy",
      category: "strings",
      successRate: 87.2,
      testCases: [
        { input: "hello", expectedOutput: "Hello" },
        { input: "", expectedOutput: "" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Sum of Array",
      description: "Calculate the sum of all numbers in an array.",
      statement:
        "Write a function that returns the sum of all numbers in an array.\n\nExample:\nInput: [1, 2, 3]\nOutput: 6",
      difficulty: "easy",
      category: "arrays",
      successRate: 89.1,
      testCases: [
        { input: "[1,2,3]", expectedOutput: "6" },
        { input: "[]", expectedOutput: "0" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Is Positive",
      description: "Check if a number is positive.",
      statement:
        "Write a function that returns true if a number is positive, false otherwise.\n\nExample:\nInput: 5\nOutput: true",
      difficulty: "easy",
      category: "math",
      successRate: 91.0,
      testCases: [
        { input: "5", expectedOutput: "true" },
        { input: "-3", expectedOutput: "false" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Remove Spaces",
      description: "Remove all spaces from a string.",
      statement:
        "Write a function that removes all spaces from a string.\n\nExample:\nInput: hello world\nOutput: helloworld",
      difficulty: "easy",
      category: "strings",
      successRate: 83.5,
      testCases: [
        { input: "hello world", expectedOutput: "helloworld" },
        { input: "no", expectedOutput: "no" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Count Elements",
      description: "Count the number of elements in an array.",
      statement:
        "Write a function that returns the length of an array.\n\nExample:\nInput: [1, 2, 3, 4]\nOutput: 4",
      difficulty: "easy",
      category: "arrays",
      successRate: 92.3,
      testCases: [
        { input: "[1,2,3,4]", expectedOutput: "4" },
        { input: "[]", expectedOutput: "0" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Find Minimum Number",
      description: "Find the minimum number in an array.",
      statement:
        "Write a function that returns the smallest number in an array.\n\nExample:\nInput: [4, 2, 7, 1]\nOutput: 1",
      difficulty: "easy",
      category: "arrays",
      successRate: 86.7,
      testCases: [
        { input: "[4,2,7,1]", expectedOutput: "1" },
        { input: "[3]", expectedOutput: "3" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Check Equality",
      description: "Check if two numbers are equal.",
      statement:
        "Write a function that returns true if two numbers are equal, false otherwise.\n\nExample:\nInput: 3\n3\nOutput: true",
      difficulty: "easy",
      category: "math",
      successRate: 93.2,
      testCases: [
        { input: "3\n3", expectedOutput: "true" },
        { input: "5\n7", expectedOutput: "false" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "First Character",
      description: "Return the first character of a string.",
      statement:
        "Write a function that returns the first character of a string.\n\nExample:\nInput: hello\nOutput: h",
      difficulty: "easy",
      category: "strings",
      successRate: 88.4,
      testCases: [
        { input: "hello", expectedOutput: "h" },
        { input: "", expectedOutput: "" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Double Number",
      description: "Double a given number.",
      statement:
        "Write a function that doubles a number.\n\nExample:\nInput: 5\nOutput: 10",
      difficulty: "easy",
      category: "math",
      successRate: 94.1,
      testCases: [
        { input: "5", expectedOutput: "10" },
        { input: "0", expectedOutput: "0" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Array Contains",
      description: "Check if an array contains a specific number.",
      statement:
        "Write a function that returns true if an array contains a given number.\n\nExample:\nInput: [1, 2, 3]\n2\nOutput: true",
      difficulty: "easy",
      category: "arrays",
      successRate: 81.9,
      testCases: [
        { input: "[1,2,3]\n2", expectedOutput: "true" },
        { input: "[1,3,5]\n4", expectedOutput: "false" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "String Length",
      description: "Return the length of a string.",
      statement:
        "Write a function that returns the length of a string.\n\nExample:\nInput: hello\nOutput: 5",
      difficulty: "easy",
      category: "strings",
      successRate: 90.7,
      testCases: [
        { input: "hello", expectedOutput: "5" },
        { input: "", expectedOutput: "0" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Is Greater Than",
      description: "Check if one number is greater than another.",
      statement:
        "Write a function that returns true if the first number is greater than the second.\n\nExample:\nInput: 5\n3\nOutput: true",
      difficulty: "easy",
      category: "math",
      successRate: 89.8,
      testCases: [
        { input: "5\n3", expectedOutput: "true" },
        { input: "2\n7", expectedOutput: "false" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Last Element",
      description: "Return the last element of an array.",
      statement:
        "Write a function that returns the last element of an array.\n\nExample:\nInput: [1, 2, 3]\nOutput: 3",
      difficulty: "easy",
      category: "arrays",
      successRate: 85.9,
      testCases: [
        { input: "[1,2,3]", expectedOutput: "3" },
        { input: "[5]", expectedOutput: "5" },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },

    // Medium Problems (5)
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
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Two Sum",
      description: "Find two numbers in an array that add up to a target.",
      statement: 
        "Given an array of integers and a target sum, return the indices of two numbers that add up to the target.\n\nExample:\nInput: [2,7,11,15]\n9\nOutput: [0,1]",
      difficulty: "medium",
      category: "arrays",
      successRate: 70.4,
      testCases: [
        { 
          input: "[2,7,11,15]\n9", 
          expectedOutput: "[0,1]" 
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Longest Substring Without Repeating Characters",
      description: "Find the length of the longest substring without repeating characters.",
      statement: 
        "Given a string, find the length of the longest substring without repeating characters.\n\nExample:\nInput: abcabcbb\nOutput: 3",
      difficulty: "medium",
      category: "strings",
      successRate: 62.9,
      testCases: [
        { 
          input: "abcabcbb", 
          expectedOutput: "3" 
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "Container With Most Water",
      description: "Find the maximum area of water a container can hold.",
      statement: 
        "Given an array of heights, find two lines that form a container with the most water.\n\nExample:\nInput: [1,8,6,2,5,4,8,3,7]\nOutput: 49",
      difficulty: "medium",
      category: "arrays",
      successRate: 60.2,
      testCases: [
        { 
          input: "[1,8,6,2,5,4,8,3,7]", 
          expectedOutput: "49" 
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },

    // Hard Problems (3)
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
    },
    {
      title: "Trapping Rain Water",
      description: "Calculate how much water can be trapped between bars.",
      statement: 
        "Given an array of heights, calculate the water trapped between bars.\n\nExample:\nInput: [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6",
      difficulty: "hard",
      category: "arrays",
      successRate: 45.8,
      testCases: [
        { 
          input: "[0,1,0,2,1,0,1,3,2,1,2,1]", 
          expectedOutput: "6" 
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: 0,
      likes: 0,
      dislikes: 0
    },
    {
      title: "N-Queens",
      description: "Solve the N-Queens puzzle.",
      statement: 
        "Place N queens on an NxN chessboard so no two queens threaten each other.\n\nExample:\nInput: 4\nOutput: [['.Q..','...Q','Q...','..Q.'],['..Q.','Q...','...Q','.Q..']]",
      difficulty: "hard",
      category: "backtracking",
      successRate: 38.6,
      testCases: [
        { 
          input: "4", 
          expectedOutput: "[['.Q..','...Q','Q...','..Q.'],['..Q.','Q...','...Q','.Q..']]" 
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
      if (e.code !== 11000) { // Duplicate key error
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