import { useState, useEffect, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown"; 
import { piyushSirTranscript } from "../transcript";

function App() {
  const [character, setCharacter] = useState("Hitesh Sir");
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  async function generateResponse(userMessage) {
    try {
      setIsLoading(true);

      const syspromt =
        character === "Hitesh Sir"
          ? `Your Name is Hitesh Choudhary and You am a teacher by profession. You teach coding to various level of students, right from beginners to folks who are already writing great softwares. You have been teaching on for more than 10 years now and it is my passion to teach people coding. You feel great when you teach someone and they get a job or build something on their own. In past, You have worked with many companies and on various roles such as Cyber Security related roles, iOS developer, Tech consultant, Backend Developer, Content Creator, CTO and these days.
          
          Instruction: 
          - You have to talk and respond like how he talks on youtube and his posts on twitter )
          - You teach complex topics in very easy, practical and straightforward way with no unnecessary jargon.
          - Talk in a casual and encouraging tone with slight humor and whenever necessary use real world examples.
          - you love tea and you favourite tea is Ice tea.
          - Use hanji word in between

          Examples: 
          user: "sir ji job karte karte nayi skills kaise seekhe aur side projects kaise banaye?"
          Hitesh sir: "Dekhiye job karte karte expirience badhane ka ya skiils badhane ka ek hi tarika hai ki kabhi bhi kisi to apna weekend mat do aur agar kisi ko weekend de rahe ho to aisi jagah do jaha se aapko ya to kuch seekne ko mil raha hai ya waha se paisa mil raha hai
          `
          : `You are Piyush Garg (Indian tech youtuber who teaches web development), content creator, educator, and entrepreneur known for his expertise in the tech industry. You have successfully launched numerous technical courses on various platforms. Founder of Teachyst, white-labeled Learning Management System (LMS) to help educators monetize their content globally.

          Instuctions: 
          - Respond to user messages like him like how he posts on twitter and how he talks in his youtube vidoes
          - Chat as if you are talking to someone in person
          - Use analogies and real life examples while explaining
          - you have engouraging and supportive tone
          - Talk in hindi with som
          - Copy the talking style of Piyush from this transcript: ${piyushSirTranscript}
          - respond as if you are talking to only one person.
          
          Feel free to use markdown for formatting your response when appropriate:        
          If you share code, format it with proper markdown code blocks.
          If you create lists, use proper markdown formatting.
      `;

      const chat = await ai.chats.create({
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: syspromt
        }
      });

      const response = await chat.sendMessage({
        message: userMessage,
      });

      setChatMessages((prevMessages) => [
        ...prevMessages,
        { role: character, content: response.text },
      ]);
    } catch (error) {
      console.error("Error generating response:", error);

      setChatMessages((prevMessages) => [
        ...prevMessages,
        {
          role: character,
          content: "Sorry, I couldn't generate a response. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }
  const handleSend = () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();

    setChatMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userMessage, formatted: false },
    ]);

    setMessage("");
    generateResponse(userMessage);
  };

  
  const renderMessageContent = (message) => {
    if (!message.formatted) {
     
      return <span className="whitespace-pre-wrap">{message.content}</span>;
    }

    
    return (
      <ReactMarkdown
        className="markdown-content"
        components={{
          
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <pre className="bg-gray-800 p-3 rounded text-gray-100 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-gray-200 px-1 rounded" {...props}>
                {children}
              </code>
            );
          },
          // Add custom styling for other markdown elements
          p: ({ node, children }) => <p className="mb-2">{children}</p>,
          h1: ({ node, children }) => (
            <h1 className="text-xl font-bold mb-2">{children}</h1>
          ),
          h2: ({ node, children }) => (
            <h2 className="text-lg font-bold mb-2">{children}</h2>
          ),
          ul: ({ node, children }) => (
            <ul className="list-disc pl-5 mb-2">{children}</ul>
          ),
          ol: ({ node, children }) => (
            <ol className="list-decimal pl-5 mb-2">{children}</ol>
          ),
          li: ({ node, children }) => <li className="mb-1">{children}</li>,
        }}
      >
        {message.content}
      </ReactMarkdown>
    );
  };

  return (
    <>
      <div className="min-h-screen max-w-full grid grid-rows-16 gap-1">
        <nav className="flex p-3 row-span-2 bg-amber-300 justify-between items-center mx-4 rounded-2xl">
          <h1 className="text-3xl font-bold mx-4 text-black">ChaiChat</h1>
          <select
            className="bg-black text-white px-3 py-2 rounded-lg"
            onChange={(e) => setCharacter(e.target.value)}
            value={character}
            name="roles"
            id="roles"
          >
            <option value="Hitesh Sir">Hitesh Sir</option>
            <option value="Piyush Sir">Piyush Sir</option>
          </select>
        </nav>
        <div className="row-span-14 mx-4">
          <div className="h-96 w-full border rounded-2xl my-4 border-amber-100 p-4 overflow-y-auto">
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Start a conversation with {character}
              </div>
            ) : (
              <>
                {chatMessages.map((chat, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      chat.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block px-4 py-2 rounded-lg ${
                        chat.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      } ${chat.formatted ? "formatted-message" : ""}`}
                    >
                      {renderMessageContent(chat)}
                    </div>
                    <div className="text-xs mt-1 text-gray-500">
                      {chat.role === "user" ? "You" : chat.role}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-left mb-4">
                    <div className="inline-block px-4 py-2 rounded-lg bg-gray-100 text-black">
                      <span className="inline-block animate-pulse">...</span>
                    </div>
                    <div className="text-xs mt-1 text-gray-500">
                      {character}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          <div className="flex gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded-xl border-amber-100 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="Enter your message here"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows="3"
              disabled={isLoading}
            ></textarea>
            <button
              className={`w-24 px-3 py-2 rounded-2xl font-bold text-xl text-white transition-colors ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={handleSend}
              disabled={isLoading}
            >
              {isLoading ? "Wait..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
