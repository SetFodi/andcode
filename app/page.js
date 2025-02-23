// app/page.js
export default function Home() {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold mb-4">Welcome to My LeetCode App</h2>
      <p className="text-lg text-gray-600 mb-8">
        Practice coding challenges and improve your skills.
      </p>
      <a
        href="/problems"
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Browse Problems
      </a>
    </div>
  );
}
