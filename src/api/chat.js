export async function sendMessage(message) {

  const token = localStorage.getItem("token");

  const res = await fetch("http://127.0.0.1:8000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      message
    })
  });

  const data = await res.json();

  return data;
}
