from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import grpc
import translation_pb2
import translation_pb2_grpc

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to gRPC server
# In a real app we'd handle connection pooling
channel = grpc.insecure_channel('localhost:50051')
stub = translation_pb2_grpc.TranslationEngineStub(channel)

class TranslateRequest(BaseModel):
    q: str
    source: str
    target: str

@app.get("/")
def read_root():
    return {"message": "Translation FastAPI Gateway Active. Custom .po backend."}

@app.get("/languages")
def get_languages():
    try:
        response = stub.GetSupportedLanguages(translation_pb2.GetLanguagesRequest())
        languages = [{"code": lang.code, "name": lang.name} for lang in response.languages]
        return languages
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.details()}"}

@app.post("/translate")
def translate_text(req: TranslateRequest):
    try:
        grpc_req = translation_pb2.TranslateRequest(
            text=req.q,
            source_lang=req.source,
            target_lang=req.target
        )
        response = stub.TranslateText(grpc_req)
        
        if response.success:
            return {"translatedText": response.translated_text}
        else:
            return {"error": response.error_message}
            
    except grpc.RpcError as e:
        return {"error": f"gRPC error: {e.details()}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)