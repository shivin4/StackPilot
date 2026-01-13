from fastapi import FastAPI

app = FastAPI(title="python-hello")


@app.get("/")
def root():
    return {"message": "Hello from StackPilot sample Python app!", "service": "python-hello"}


@app.get("/health")
def health():
    return {"status": "ok"}
