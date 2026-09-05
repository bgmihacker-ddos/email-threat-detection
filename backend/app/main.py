from fastapi import FastAPI

app = FastAPI(title="Email Threat Detection Platform", version="0.1.0")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
