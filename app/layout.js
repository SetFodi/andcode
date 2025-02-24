// app/layout.js
import Providers from "./providers"; // now this will find a default export
import "./globals.css";
import Link from "next/link";
export const metadata = {
  title: "LeetCode Clone",
  description: "Practice coding problems",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <div className="flex space-x-4">
    <Link href="/problems" className="text-black">Problems</Link>
    <Link href="/profile" className="text-black">Profile</Link>
</div>

      </body>
    </html>
  );
}
