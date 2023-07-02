// TODO: background script
// chrome.runtime.onInstalled.addListener(() => {
//   // TODO: on installed function
// })

chrome.runtime.onMessage.addListener( async (message, sender, sendResponse) => {
  console.log(message)
  if (message.type === 'get-pdf-contents') {
    console.log(message.data)
    // Forward the PDF contents to the active tab
    let tab = await chrome.tabs.query({ active: true, currentWindow: true })
    console.log('Sending message to tab:', tab[0].id, { type: 'get-pdf-contents', data: message.data }); // Log the tab ID and message

    chrome.tabs.sendMessage(tab[0].id, { type: 'get-pdf-contents', data: message.data });


  }
});

