import os
import pickle
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="FlowMind ML Success Service")

# Model path
MODEL_PATH = r"c:\Users\Prasham\OneDrive\Documents\FlowMind\ML_Model\success_model.pkl"

model = None

@app.on_event("startup")
async def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        print(f"ERROR: Model not found at {MODEL_PATH}")
        return
    try:
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        print("Success Model loaded successfully.")
    except Exception as e:
        print(f"ERROR loading model: {e}")

class PredictionRequest(BaseModel):
    num_services: int
    dag_depth: int
    parallel_steps: int
    retry_count: int = 0
    avg_latency: float = 1.8

@app.post("/predict")
async def predict(req: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Features order matches training: num_services, dag_depth, parallel_steps, retry_count, avg_latency
    features = [[
        req.num_services,
        req.dag_depth,
        req.parallel_steps,
        req.retry_count,
        req.avg_latency
    ]]
    
    try:
        # model.predict_proba returns [prob_fail, prob_success]
        prob = model.predict_proba(features)[0][1]
        return {"probability": round(float(prob), 4)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9001)
