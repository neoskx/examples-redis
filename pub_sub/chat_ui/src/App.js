import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [group, setGroup] = useState("");
  const [recipient, setRecipient] = useState("");
  const [mode, setMode] = useState(""); // 'group' or 'private'
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState("");

  useEffect(() => {
    // Get the socket ID when connected
    socket.on("connect", () => {
      setSocketId(socket.id);
    });

    if (isConnected) {
      if (mode === "group") {
        socket.emit("subscribe group", group);
        socket.emit("join group", group);

        socket.off("group message").on("group message", (msg) => {
          setChat((prevChat) => [
            ...prevChat,
            `Group ${group}: ${msg.sender}: ${msg.message}`,
          ]);
        });
      }

      if (mode === "private") {
        socket.off("private message").on("private message", (msg) => {
          setChat((prevChat) => [
            ...prevChat,
            `Private from ${msg.sender}: ${msg.message}`,
          ]);
        });
      }

      return () => {
        socket.off("group message");
        socket.off("private message");
      };
    }
  }, [isConnected, group, mode]);

  const connectToGroup = () => {
    if (group) {
      setMode("group");
      setIsConnected(true);
    }
  };

  const connectToPrivate = () => {
    if (recipient) {
      setMode("private");
      setIsConnected(true);
    }
  };

  const sendMessage = () => {
    if (mode === "group") {
      socket.emit("group message", { group, message });
    } else if (mode === "private") {
      socket.emit("private message", { recipient, message });
    }
    setMessage("");
  };

  return (
    <div className="App">
      {!isConnected ? (
        <div>
          <h3>Select Chat Mode</h3>
          <div>
            <h4>Join a Group Chat</h4>
            <input
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder="Enter group name"
            />
            <button onClick={connectToGroup}>Join Group</button>
          </div>
          <div>
            <h4>Private Chat</h4>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient ID"
            />
            <button onClick={connectToPrivate}>Start Private Chat</button>
          </div>
        </div>
      ) : (
        <div>
          <h4>Your Socket ID: {socketId}</h4>
          <div className="chat-box">
            {chat.map((msg, idx) => (
              <div key={idx} className="chat-message">
                {msg}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button onClick={sendMessage}>Send Message</button>
        </div>
      )}
    </div>
  );
}

export default App;
