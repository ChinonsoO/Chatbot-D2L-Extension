        // TODO: content script

        import { PDFDocumentProxy, PDFPageProxy, TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';
        import * as pdfjs from 'pdfjs-dist'
        import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'


        import { injectChatWindow } from './injectChatWindow';


        pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

        // import { getDocument } from 'pdfjs-dist/build/pdf';
        // pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;/


        // Check if the current URL is a D2L site
        console.log(window.location.hostname);

        // Look for iframe elements
        let iframe: HTMLIFrameElement | null = null;
        let pdfContents = '';

        iframe = document.querySelector('iframe');
        const pdfDiv = document.querySelector(".d2l-fileviewer-pdf-pdfjs");

        if (iframe) {
            let pdfURL: string = (pdfDiv as HTMLElement).getAttribute('data-location') || '';

            pdfURL = "https://" + window.location.hostname + "/" + pdfURL;

            console.log(`PDF src: ${pdfURL}`);

            fetch(pdfURL, {
                credentials: 'include'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    // console.log(response);
                    return response.arrayBuffer();
                })
                .then(data => {
                    // console.log(data);
                    // Load the PDF document using pdf.js
                    const loadingTask = pdfjs.getDocument({ data });
                    loadingTask.promise
                        .then((pdfDocument: PDFDocumentProxy) => {
                            console.log(`Number of pages: ${pdfDocument.numPages}`);

                            // Use an array to store promises for each page
                            const pagePromises: Promise<void>[] = [];

                            const pagesText: string[] = new Array(pdfDocument.numPages);


                            // Loop through all pages and extract text
                            // for (let i = 1; i <= pdfDocument.numPages; i++) {
                            //     const pagePromise = pdfDocument.getPage(i).then((page: PDFPageProxy) => {
                            //         return page.getTextContent().then((textContent: TextContent) => {
                            //             // console.log(`Page ${i}:`, textContent.items
                            //             //     .filter(item => 'str' in item) // Filter out items without 'str' property
                            //             //     .map(item => (item as TextItem).str).join(' '));
                            //             pdfContents = pdfContents + `Page: ${i}: ${textContent.items
                            //                 .filter(item => 'str' in item) // Filter out items without 'str' property
                            //                 .map(item => (item as TextItem).str).join(' ')}\n`;
                            //         });
                            //     });
                            //     pagePromises.push(pagePromise);
                            // }
                            // for (let i = 1; i <= pdfDocument.numPages; i++) {
                            //     const pagePromise = pdfDocument.getPage(i).then((page: PDFPageProxy) => {
                            //         return page.getTextContent().then((textContent: TextContent) => {
                            //             pagesText[i - 1] = `Page: ${i}: ${textContent.items
                            //                 .filter(item => 'str' in item) // Filter out items without 'str' property
                            //                 .map(item => (item as TextItem).str).join(' ')}\n`;
                            //         });
                            //     });
                            //     pagePromises.push(pagePromise);
                            // }

                            for (let i = 1; i <= pdfDocument.numPages; i++) {
                                const pagePromise = pdfDocument.getPage(i).then((page: PDFPageProxy) => {
                                    return page.getTextContent().then((textContent: TextContent) => {
                                        let pageText = '';
                                        let lastY = -1;
                                        textContent.items.forEach((item: TextItem) => {
                                            if ('str' in item) {
                                                if (lastY !== item.transform[5]) {
                                                    pageText += '\n';
                                                    lastY = item.transform[5];
                                                }
                                                pageText += item.str + ' ';
                                            }
                                        });
                                        pagesText[i - 1] = `Page: ${i}: ${pageText}\n`;
                                    });
                                });
                                pagePromises.push(pagePromise);
                            }

                            // Wait for all page promises to resolve
                            return Promise.all(pagePromises).then(() => {
                                pdfContents = pagesText.join('');
                                // console.log(pdfContents.split("\n"))
                                // chrome.runtime.sendMessage('get-pdf-contents', (response) => {
                                //     // 3. Got an asynchronous response with the data from the service worker
                                //     console.log('received user data', response);
                                //   });
                                
                                chrome.runtime.sendMessage({ type: 'get-pdf-contents', data: pdfContents });


                            });
                        })
                        .catch(error => {
                            console.error('Error loading PDF:', error);
                        });
                })
                .catch(error => {
                    console.error('Error fetching PDF:', error);
                });
            
            
        
        injectChatWindow()
    

    
    }
