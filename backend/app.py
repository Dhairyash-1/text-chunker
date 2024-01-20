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

@app.route('/api/uploadfile', methods=['POST'])
def upload_files():
    try:
        uploaded_file = request.files['file']
        
        if not uploaded_file:
            raise ValueError("No file provided in the request")
       
        file_content = uploaded_file.read().decode('utf-8')
        # print(file_content)
        text="hisdlf sdhfodf"
        doc = Document(page_content=file_content,metadata={'name':uploaded_file.filename})
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=0,length_function=len)
        chunks = text_splitter.split_documents([doc])
        # print(chunks)
        chunk_list = [{'page_content':chunk.page_content,'metadata':chunk.metadata} for chunk in chunks]
        # You can do something with the file content here
        
        return jsonify({'status': 'success','chunks':chunk_list, 'message': 'File uploaded successfully'})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

# str = 'this is a document object model hwih helop to trans hthe user hdi dhs'
# text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=0,length_function=len)

# doc = Document(page_content=str,metadata={"name":"dh"})
# split= text_splitter.split_documents([doc])
# print(split)