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
  const [processing, setProcessing] = useState(false);

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
      setProcessing(true);
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
      setProcessing(false);
    };
    recognition.start();
  };

  return (
    // <div className="max-w-xl mx-auto mt-10 p-4 rounded-xl shadow bg-white space-y-4">
    //   <h1 className="text-2xl font-bold flex justify-between items-center">
    //     🎤 Voice To-Do Agent
    //     <span
    //       className={`text-sm px-2 py-1 rounded ${
    //         listening
    //           ? "bg-green-100 text-green-700"
    //           : "bg-gray-100 text-gray-600"
    //       }`}
    //     >
    //       {listening ? "Listening..." : "Idle"}
    //     </span>
    //   </h1>

    //   <button
    //     className={`px-4 py-2 rounded font-semibold transition-colors duration-200 ${
    //       listening
    //         ? "bg-red-600 text-white hover:bg-red-700"
    //         : "bg-blue-600 text-white hover:bg-blue-700"
    //     }`}
    //     onClick={handleVoice}
    //   >
    //     {listening ? "Stop Listening" : "Start Speaking"}
    //   </button>

    //   {transcript && (
    //     <div className="text-sm bg-gray-100 p-2 rounded border border-gray-200 text-gray-700 italic">
    //       You said: “{transcript}”
    //     </div>
    //   )}

    //   {processing && (
    //     <div className="flex items-center space-x-2 animate-pulse text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded border border-purple-200">
    //       <span>🤖 AI is thinking...</span>
    //       <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" />
    //       <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce [animation-delay:.1s]" />
    //       <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce [animation-delay:.2s]" />
    //     </div>
    //   )}

    //   <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
    //     <ul className="space-y-2">
    //       {todos?.map((todo) => (
    //         <li
    //           key={todo.id}
    //           className={`px-4 py-3 rounded-lg flex justify-between items-center shadow-sm transition ${
    //             todo.deletedAt
    //               ? "bg-red-100 text-red-700 line-through"
    //               : todo.updatedAt
    //               ? "bg-yellow-100 text-yellow-800"
    //               : "bg-gray-50 text-gray-800"
    //           }`}
    //         >
    //           <div className="flex flex-col">
    //             <span className="font-medium">{todo.content}</span>
    //             <span className="text-xs text-gray-500">
    //               {new Date(todo.createdAt).toLocaleString()}
    //             </span>
    //           </div>

    //           <span className="text-xs italic">
    //             {todo.deletedAt
    //               ? "Deleted"
    //               : todo.updatedAt
    //               ? "Updated"
    //               : "New"}
    //           </span>
    //         </li>
    //       ))}
    //     </ul>
    //   </div>
    // </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mt-10 p-6">
      {/* Left Panel */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold flex justify-between items-center">
          🎤 Voice To-Do Agent
          <span
            className={`text-sm px-2 py-1 rounded ${
              listening
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {listening ? "Listening..." : "Idle"}
          </span>
        </h1>

        {transcript && (
          <div className="text-sm bg-gray-100 p-2 rounded border border-gray-200 text-gray-700 italic">
            You said: “{transcript}”
          </div>
        )}

        <button
          className={`px-4 py-2 flex justify-center items-center rounded font-semibold transition-colors duration-200 ${
            listening
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
          onClick={handleVoice}
        >
          {listening ? "Stop Listening" : "Start Speaking"}
        </button>

        {processing && (
          <div className="flex items-center space-x-2 animate-pulse text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded border border-purple-200">
            <span>🤖 AI is thinking...</span>
            <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" />
            <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce [animation-delay:.1s]" />
            <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce [animation-delay:.2s]" />
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 border-l border-gray-200 pl-4">
        <ul className="space-y-2">
          {todos?.map((todo) => (
            <li
              key={todo.id}
              className={`px-4 py-3 rounded-lg flex justify-between items-center shadow-sm transition ${
                todo.deletedAt
                  ? "bg-red-100 text-red-700 line-through"
                  : todo.updatedAt
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-50 text-gray-800"
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{todo.content}</span>
                <span className="text-xs text-gray-500">
                  {new Date(todo.createdAt).toLocaleString()}
                </span>
              </div>

              <span className="text-xs italic">
                {todo.deletedAt
                  ? "Deleted"
                  : todo.updatedAt
                  ? "Updated"
                  : "New"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
