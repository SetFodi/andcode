// app/api/compile/route.js
export async function POST(request) {
    try {
      const { code } = await request.json();
  
      const payload = {
        language: "javascript", // correct language identifier
        version: "18.15.0",     // use the available version from your list
        files: [
          {
            name: "main.js",
            content: code,
          },
        ],
        stdin: "",
        args: [],
      };
  
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
  
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
      console.error(error);
      return new Response("Error running code", { status: 500 });
    }
  }
  