import functions_framework
from langchain.text_splitter import CharacterTextSplitter
import json
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI
from langchain.chains import ConversationalRetrievalChain


@functions_framework.http
def analyze_pdf(request):

    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return (json.dumps({'error': 'No Authorization header provided'}), 400, headers)
    
    parts = auth_header.split(' ')
    if len(parts) != 2 or parts[0] != 'Bearer':
        return (json.dumps({'error': 'Invalid Authorization header format'}), 400, headers)
    
    OPENAI_API_KEY = parts[1]
    
    request_json = request.get_json(silent=True)
    request_args = request.args

    if request_json and 'pdfContent' in request_json:
        pdf_contents = request_json['pdfContent']
        
        if 'prompt' in request_json and 'chatHistory' in request_json:
            prompt = request_json['prompt']
            chat_history = request_json['chatHistory']
        else:
            return (json.dumps({'error': 'No Prompt/ChatHistory provided'}), 400, headers)

        print(chat_history)
    else:
        pdf_contents = None

    if pdf_contents is None:
        return (json.dumps({'error': 'No PDF content provided'}), 400, headers)
    else:
        #Split pdf contents into chunks
        text_splitter = CharacterTextSplitter(
            separator = '\n',
            chunk_size = 1024,
            chunk_overlap=128,
            length_function =len
            
        )
        
        chunks = text_splitter.split_text(pdf_contents)

        # perform similarity search
        embeddings = OpenAIEmbeddings(openai_api_key = OPENAI_API_KEY)
        knowledge_base = FAISS.from_texts(chunks, embeddings)
        docs = knowledge_base.similarity_search(prompt, k=7)

        print(docs)
        
        # use llm to generate our answer 
        llm = OpenAI(openai_api_key = OPENAI_API_KEY, max_tokens=1024)

        # chain = load_qa_chain(llm, chain_type="stuff")


        # llm_response = chain.run(input_documents = docs, question = prompt)

        chat_history = [(item[0], item[1]) for item in chat_history]

        convo_chain = ConversationalRetrievalChain.from_llm(llm, knowledge_base.as_retriever())

        result = convo_chain({"question":prompt, "chat_history": chat_history})

        llm_response = result['answer']

        

        print(llm_response)


        # Do something with pdf_contents
        # For example, return it back to the sender
        return (json.dumps({'message': 'Received PDF contents', 'llm_response': llm_response}), 200, headers)


