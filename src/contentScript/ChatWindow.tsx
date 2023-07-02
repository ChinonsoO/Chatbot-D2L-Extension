import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from './ChatMessage';
import './ChatWindow.css'

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  loading?: boolean; // Add this line

} 


// user, bot
type Chat = [string, string]


interface ChatWindowProps {
    onClose: () => void;
  }
  

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([{
    id:uuidv4(),
    text: "I've detected a pdf on this page.\nWhat question would you like to ask?",
    sender: 'bot'
  }]);
  const [inputValue, setInputValue] = useState<string>('');
  const [testSend, setTestSend] = useState<boolean>(false)
  const [pdfContents, setPdfContents] = useState<string>('');
  const [profilePicUrl, setProfilePicUrl] = useState<string>('')
  const [sendingMessage, setSendingMessage] = useState<boolean>(false)
  const [chatHistory, setChatHistory] = useState<Chat[]>([])
 


  useEffect(() => {

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'get-pdf-contents') {
        // console.log(message.data); // Log the PDF contents
        setPdfContents(message.data)
        setProfilePicUrl(createInitialsProfilePic())
      }
    });
  
    // return () => {
    //   chrome.runtime.onMessage.removeListener(handleMessage);
    // };


  }, []);


  // useEffect(() => {
  //   console.log(chatHistory);
  // }, [chatHistory]);

  function createInitialsProfilePic() {
    let profileImageElement = document.querySelector('d2l-profile-image-base');

    let firstName = profileImageElement.getAttribute('first-name');
    let lastName = profileImageElement.getAttribute('last-name');

    // Get the initials
    let initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

    // Create a new canvas element
    let canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    // Get the 2d context of the canvas
    let ctx = canvas.getContext('2d');

    // Set the color of the background
    ctx.fillStyle = "#6F6BB8"; // Change this to any color you like
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set the color of the text
    ctx.fillStyle = "#fff"; // Change this to any color you like
    ctx.font = " bold 50px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw the text
    ctx.fillText(initials, canvas.width / 2, canvas.height / 2);

    // Get the data URL of the canvas
    let dataUrl = canvas.toDataURL();

    return dataUrl;
}



  const sendMessage = async (e: React.FormEvent) => {

    let botResponse = null

    setTestSend(!testSend)
    e.preventDefault();
  
   

    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: uuidv4(), 
      text: inputValue,
      sender: 'user',
    };
  
    const loadingBotMessage: Message = {
      id: uuidv4(), 
      text: 'Loading...',
      sender: 'bot',
      loading: true,
    };

      setMessages((prevMessages) => [...prevMessages, userMessage, loadingBotMessage]);


    let openAIkey = "Put Your open AI API key here"

    try {
      setSendingMessage(true)
      //Replace the url inside the fetch block with the url of your google cloud function
      let res = await fetch("https://analyze-pdf-2r3un6265a-uc.a.run.app", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + openAIkey
        },
        body: JSON.stringify({
          pdfContent: pdfContents,
          // prompt: inputValue
          prompt: inputValue,
          chatHistory: chatHistory
        })
      })
    
      res = await res.json()

      setSendingMessage(false)
      
      botResponse = res['llm_response']

      // console.log(res)
      // console.log(res["llm_response"])
    } catch (err) {
      console.error('Error:', err);
    }

    const botMessage: Message = {
      id: loadingBotMessage.id, 
      text: botResponse, 
      sender: 'bot',
      loading: false,
    };
  
     setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === botMessage.id ? botMessage : message
      )
    );

    //user, bot
    const chat = [inputValue, botResponse]

    setChatHistory((prevChat) => [...prevChat, chat as Chat])

    setInputValue('');


    // You can add your chatbot response logic here
  };



  return (
    <div className={`chat-window`}>
        <div className='chat-header'> 
                    <h1 className='chat-header-title'>ScholarBot</h1>
            <button onClick={onClose} className="close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                    </svg>
            </button>
        </div>
        
      <div className="chat-messages">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} profilePicUrl={profilePicUrl} sendingMessage={sendingMessage} />
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
        </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
