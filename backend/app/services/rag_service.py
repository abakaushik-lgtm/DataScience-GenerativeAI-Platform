import os
from typing import List, Dict, Any
import logging

class RAGService:
    def __init__(self):
        self.persist_directory = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chroma_db")
        self.vectorstore = None
        self.embeddings = None
        
        try:
            from langchain_openai import OpenAIEmbeddings, ChatOpenAI
            if os.getenv("OPENAI_API_KEY"):
                self.embeddings = OpenAIEmbeddings()
                self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
                
                from langchain_qdrant import Qdrant
                from qdrant_client import QdrantClient

                qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
                
                try:
                    client = QdrantClient(url=qdrant_url)
                    self.vectorstore = Qdrant(
                        client=client,
                        collection_name="knowledge_base",
                        embeddings=self.embeddings
                    )
                except Exception as ex:
                    logging.warning(f"Qdrant connection failed: {ex}. Falling back to mock RAG.")
                    self.vectorstore = None
                    
        except Exception as e:
            logging.warning(f"RAG Service Initialization Warning: {e}")

    def ingest_document(self, file_path: str, filename: str) -> Dict[str, Any]:
        """Parses a file, chunks it, and adds it to the vector database."""
        if not self.vectorstore:
            return {"status": "success", "message": "Mock ingested (No API Key or Vector DB)."}
            
        try:
            documents = []
            
            # 1. Parse File
            if file_path.endswith('.pdf'):
                from langchain_community.document_loaders import PyPDFLoader
                loader = PyPDFLoader(file_path)
                documents = loader.load()
            else:
                from langchain_community.document_loaders import TextLoader
                loader = TextLoader(file_path, encoding='utf-8')
                documents = loader.load()

            # Add source metadata
            for doc in documents:
                doc.metadata["source_file"] = filename

            # 2. Chunk Text
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len
            )
            chunks = text_splitter.split_documents(documents)

            # 3. Embed and Store
            self.vectorstore.add_documents(chunks)
            
            return {"status": "success", "chunks_added": len(chunks), "file": filename}
        except Exception as e:
            logging.error(f"Failed to ingest document: {str(e)}")
            raise

    def query(self, question: str) -> Dict[str, Any]:
        """Retrieves relevant context and generates an answer."""
        if not self.vectorstore:
            return {
                "answer": f"Mock Answer: I see you are asking about '{question}'. Since I am running in offline mock mode without an API key, I cannot query the vector database.",
                "sources": []
            }
            
        try:
            # 1. Retrieve
            retriever = self.vectorstore.as_retriever(search_kwargs={"k": 4})
            docs = retriever.invoke(question)
            
            if not docs:
                return {
                    "answer": "I couldn't find any relevant information in the uploaded documents to answer your question.",
                    "sources": []
                }

            # 2. Format Context
            context_text = "\n\n---\n\n".join([doc.page_content for doc in docs])
            sources = list(set([doc.metadata.get("source_file", "Unknown") for doc in docs]))

            # 3. Generate Answer
            from langchain_core.prompts import ChatPromptTemplate
            
            prompt_template = """
            You are an expert AI assistant for the AntiGravity platform.
            Answer the user's question based ONLY on the following context. 
            If the answer is not in the context, say "I don't know based on the provided documents."
            
            Context:
            {context}
            
            Question:
            {question}
            """
            
            prompt = ChatPromptTemplate.from_template(prompt_template)
            chain = prompt | self.llm
            
            response = chain.invoke({"context": context_text, "question": question})
            
            return {
                "answer": response.content,
                "sources": sources
            }
            
        except Exception as e:
            logging.error(f"RAG Query Error: {str(e)}")
            raise

rag_service = RAGService()
