"use client";

import { useEffect, useState } from "react";

interface Todo {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export default function TodoAgent() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await fetch("/api/todo");
    const { data } = await res.json();
    if (!data?.length) return;
    setTodos(data);
  };

  const handleVoice = () => {
    const recognition = new (window?.SpeechRecognition ||
      window?.webkitSpeechRecognition)();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const { status, message, data } = await res.json();

      // Check if the response is successful and contains valid data
      if (status !== "success" || !data?.action) return;

      const { action, content, id, old } = data;

      console.log("response", { action, content, id });

      if (action === "add") {
        if (!content) return;
        await fetch("/api/todo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
      } else if (action === "delete") {
        if (!old) return; 
      
        const res = await fetch("/api/todo/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: old }),
        });

        console.log("Delete Search", res);
        
        const { data: existing } = await res.json();
        if (!existing?.id) return; 
      
        await fetch("/api/todo", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing?.id }), // Or pass the ID if you prefer
        });
      } else if (action === "update") {
        if (!old || !content) return; 

        const res = await fetch("/api/todo/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: old }),
        });

        const { data: existing } = await res.json();
        if (!existing?.id) return;

        // 2. Update the todo using its ID
        await fetch("/api/todo", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, content }),
        });
      }

      await fetchTodos();
    };
    recognition.start();
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 rounded-xl shadow bg-white space-y-4">
      <h1 className="text-xl font-bold">🎤 Voice To-Do Agent</h1>

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleVoice}
      >
        {listening ? "Listening..." : "Start Speaking"}
      </button>

      {transcript && (
        <div className="text-sm text-gray-600 italic">
          You said: “{transcript}”
        </div>
      )}

      <ul className="space-y-2">
        {todos?.map((todo) => (
          <li
            key={todo.id}
            className={`px-4 py-2 rounded ${
              todo.deletedAt
                ? "bg-red-500 text-white"
                : todo.updatedAt
                ? "bg-yellow-300"
                : "bg-gray-100"
            }`}
          >
            {todo.deletedAt ? (
              <span className="line-through text-red-600">
                Deleted: {todo.content}
              </span>
            ) : todo.updatedAt ? (
              <span className="text-yellow-600">Updated: {todo.content}</span>
            ) : (
              <span>{todo.content}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
