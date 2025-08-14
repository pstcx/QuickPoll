from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
from typing import Dict, List

app = FastAPI(title="WebSocket Test")

# CORS für WebSocket
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Einfacher Connection Manager
class SimpleConnectionManager:
    def __init__(self):
        self.connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, survey_id: str):
        await websocket.accept()
        if survey_id not in self.connections:
            self.connections[survey_id] = []
        self.connections[survey_id].append(websocket)
        print(f"WebSocket connected for survey {survey_id}")
    
    def disconnect(self, websocket: WebSocket, survey_id: str):
        if survey_id in self.connections:
            self.connections[survey_id].remove(websocket)
        print(f"WebSocket disconnected for survey {survey_id}")
    
    async def send_message(self, survey_id: str, message: dict):
        if survey_id in self.connections:
            for connection in self.connections[survey_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    pass

manager = SimpleConnectionManager()

@app.get("/")
async def root():
    return {"message": "WebSocket Test Server"}

@app.websocket("/ws/host/{survey_id}")
async def websocket_host(websocket: WebSocket, survey_id: str):
    await manager.connect(websocket, survey_id)
    try:
        # Sende initial message
        await websocket.send_text(json.dumps({
            "type": "connected",
            "role": "host",
            "survey_id": survey_id
        }))
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            print(f"Received from host: {message}")
            
            # Echo zurück
            await websocket.send_text(json.dumps({
                "type": "echo",
                "original": message
            }))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, survey_id)

@app.websocket("/ws/participant/{survey_id}")
async def websocket_participant(websocket: WebSocket, survey_id: str):
    await manager.connect(websocket, survey_id)
    try:
        await websocket.send_text(json.dumps({
            "type": "connected",
            "role": "participant",
            "survey_id": survey_id
        }))
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            print(f"Received from participant: {message}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, survey_id)
