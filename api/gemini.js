export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { prompt, imageBase64 } = req.body;
  const key = process.env.OPENAI_API_KEY;

  const messages = [];
  if (imageBase64) {
    messages.push({
      role: "user",
      content: [
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        { type: "text", text: prompt }
      ]
    });
  } else {
    messages.push({ role: "user", content: prompt });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        messages
      })
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
