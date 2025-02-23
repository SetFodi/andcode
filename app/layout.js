// app/layout.js
import "./globals.css"; // Ensure Tailwind styles are loaded

export const metadata = {
  title: "My LeetCode App",
  description: "A modern, smooth coding challenge platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <header className="bg-white shadow py-4">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold"><a href="/">My LeetCode App</a></h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="bg-white shadow py-4 mt-8">
          <div className="container mx-auto px-4 text-center">
            © {new Date().getFullYear()} My LeetCode App
          </div>
        </footer>
      </body>
    </html>
  );
}
