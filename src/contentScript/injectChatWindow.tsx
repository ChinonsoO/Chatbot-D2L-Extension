import ReactDOM from 'react-dom';
import React from 'react';
import ChatWindow from './ChatWindow';
import { createRoot } from 'react-dom/client'




export function injectChatWindow(): void {
    const button = document.createElement('button');
    button.innerText = 'Open Chat';
    button.style.position = 'fixed';
    button.style.zIndex = '1000';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.padding = '10px';
    button.style.backgroundColor = '#007bff';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.addEventListener('click', () => console.log("opened chat"));
    
    

    const chatOverlay = document.createElement('div');
    chatOverlay.style.position = 'fixed';
    chatOverlay.style.bottom = '0';
    chatOverlay.style.marginBottom = '50px';
    chatOverlay.style.marginRight = '25px';
    chatOverlay.style.right = '0';
    chatOverlay.style.width = '40%';
    chatOverlay.style.height = '50%';
    chatOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    chatOverlay.style.display = 'flex';
    chatOverlay.style.alignItems = 'center';
    chatOverlay.style.justifyContent = 'center';
    chatOverlay.style.zIndex = '10001';
    chatOverlay.style.visibility = 'hidden';

    // chatOverlay.style.opacity = '0';
    // chatOverlay.style.transition = 'opacity 0.5s ease-in-out'; // added transition


    button.addEventListener('click', () => {
        chatOverlay.style.visibility = 'visible';
        // chatOverlay.style.opacity = '1';
        // chatOverlay.style.pointerEvents = 'auto'; // added this line


      });
    
    function closeChatWindow(): void {
    chatOverlay.style.visibility    = 'hidden';
      // chatOverlay.style.opacity = '0';
      // chatOverlay.style.pointerEvents = 'none'; // added this line


    }

    document.body.appendChild(chatOverlay);
    document.body.appendChild(button);

    const root = createRoot(chatOverlay)
    root.render(<ChatWindow onClose={closeChatWindow} />)
    

    }

