"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";

export default function Chat() {
  // const { messages, isLoading, append } = useChat();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
  } = useChat();
  const [imageIsLoading, setImageIsLoading] = useState(false);
  const [audioIsLoading, setAudioIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  if (imageIsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-700 h-10 w-10"></div>
          </div>
        </div>
      </div>
    );
  }
  if (image) {
    return (
      <div className="flex flex-col items-center p-4 justify-center gap-4 h-screen">
        <img className="w-[30vw] h-auto" src={`data:image/jpeg;base64,${image}`} />
        <textarea
          className="mt-4 w-full text-white bg-red-700 h-64"
          value={messages[messages.length - 1].content}
          readOnly
        />

        <div className="w-[50vw] flex flex-col items-center">
          {audio && (
            <>
              <p> Listen to the recipe: </p>
              <audio controls src={audio} className="w-full"></audio>
            </>
          )}
          {audioIsLoading && !audio && <p> Audio is being generated... </p>}
          {!audioIsLoading && !audio && (
            <button
              className="bg-blue-500 p-2 text-white rounded shadow-xl"
              onClick={async () => {
                setAudioIsLoading(true);
                const response = await fetch("/api/audio", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    message: messages[messages.length - 1].content,
                  }),
                });
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudio(audioUrl);
                setAudioIsLoading(false);
              }}
            >
              Generate Audio
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col w-full h-screen max-w-md py-24 mx-auto stretch overflow-hidden">
      <div
        className="overflow-auto w-full mb-8"
        ref={messagesContainerRef}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`whitespace-pre-wrap ${m.role === "user"
              ? "bg-green-700 p-3 m-2 rounded-lg"
              : "bg-red-700 p-3 m-2 rounded-lg"
              }`}
          >
            {m.role === "user" ? "User: " : "AI: "}
            {m.content}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end pr-4">
            <span className="animate-pulse text-2xl">...</span>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full max-w-lg">
        <div className="flex flex-col justify-center mb-2 items-center">
          {messages.length === 0 && (
            <>
              <button
                className="bg-blue-500 p-2 text-white rounded shadow-xl"
                disabled={isLoading}
                onClick={() =>
                  append({
                    role: "user",
                    content: "Give me a random recipe",
                  })
                }
              >
                Random Recipe
              </button>

              <form onSubmit={handleSubmit} className="flex justify-center mt-4 w-full">
                <input
                  className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl text-black max-w-2xl"
                  value={input}
                  placeholder="Say something..."
                  onChange={handleInputChange}
                />
              </form>
            </>
          )}

          {messages.length == 2 && !isLoading && (
            <button
              className="bg-blue-500 p-2 text-white rounded shadow-xl"
              disabled={isLoading}
              onClick={async () => {
                setImageIsLoading(true);
                const response = await fetch("api/images", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    message: messages[messages.length - 1].content,
                  }),
                });
                const data = await response.json();
                setImage(data);
                setImageIsLoading(false);
              }}
            >
              Generate image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}