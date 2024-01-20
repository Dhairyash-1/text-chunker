from dotenv import load_dotenv
load_dotenv()
import os
from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

app = Flask(__name__)
CORS(app=app, origins=os.environ.get('FRONTEND_URL'), supports_credentials=True)

@app.route('/')
def welcome():
    return '<h1>Welcome to Flask</h1>'

@app.route('/api/uploadfiles', methods=['POST'])  # Change route to handle multiple files
def upload_files():
    try:
        uploaded_files = request.files.getlist('file')  # Use getlist to get multiple files

        if not uploaded_files:
            raise ValueError("No files provided in the request")
       
        chunk_lists = []  # List to store chunks for each file

        for uploaded_file in uploaded_files:
            file_content = uploaded_file.read().decode('utf-8')
            doc = Document(page_content=file_content, metadata={'name': uploaded_file.filename})
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=0, length_function=len)
            chunks = text_splitter.split_documents([doc])
            chunk_list = [{'page_content': chunk.page_content, 'metadata': chunk.metadata} for chunk in chunks]
            chunk_lists.append(chunk_list)

        return jsonify({'status': 'success', 'chunks': chunk_lists, 'message': 'Files uploaded successfully'})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
