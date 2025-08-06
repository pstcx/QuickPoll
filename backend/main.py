from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid
import json

# SQLAlchemy Imports
from sqlalchemy import create_engine, String, DateTime, Boolean, Integer, Text, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker, Session

# Datenbank Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./survey_tool.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

# SQLAlchemy Models (Datenbank-Tabellen)
class SurveyDB(Base):
    __tablename__ = "surveys"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    response_count: Mapped[int] = mapped_column(Integer, default=0)

class QuestionDB(Base):
    __tablename__ = "questions"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    survey_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)
    options: Mapped[list] = mapped_column(JSON, nullable=True)  # Als JSON gespeichert
    required: Mapped[bool] = mapped_column(Boolean, default=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

class ResponseDB(Base):
    __tablename__ = "responses"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    survey_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    participant_name: Mapped[str] = mapped_column(String, nullable=True)
    answers: Mapped[list] = mapped_column(JSON, nullable=False)  # Als JSON gespeichert
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

# Datenbank-Tabellen erstellen
Base.metadata.create_all(bind=engine)

# Pydantic Models für API (Request/Response)
class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SINGLE_CHOICE = "single_choice"
    TEXT = "text"
    RATING = "rating"
    YES_NO = "yes_no"

class QuestionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    type: QuestionType
    options: Optional[List[str]] = None
    required: bool = True
    description: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: str
    survey_id: str
    order: int
    created_at: datetime

    class Config:
        from_attributes = True

class SurveyBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    is_active: bool = True

class SurveyCreate(SurveyBase):
    questions: List[QuestionCreate] = []

class Survey(SurveyBase):
    id: str
    created_at: datetime
    questions: List[Question] = []
    response_count: int = 0

    class Config:
        from_attributes = True

class AnswerSubmission(BaseModel):
    question_id: str
    answer: Any  # Kann String, List[str], int, bool sein

class ResponseSubmission(BaseModel):
    survey_id: str
    answers: List[AnswerSubmission]
    participant_name: Optional[str] = None

class Response(BaseModel):
    id: str
    survey_id: str
    answers: List[AnswerSubmission]
    participant_name: Optional[str]
    submitted_at: datetime

    class Config:
        from_attributes = True

# Dependency für Datenbankverbindung
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# FastAPI App initialisieren
app = FastAPI(
    title="QuickPool API",
    description="QuickPool API für UNI Umfragen und Feedbacks",
    version="1.0.0"
)

# CORS Middleware für Frontend-Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In Produktion: spezifische URLs angeben
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper Functions
def generate_id() -> str:
    return str(uuid.uuid4())

def get_survey_with_questions(db: Session, survey_id: str) -> Survey:
    """Umfrage mit allen Fragen aus der Datenbank laden"""
    survey_db = db.query(SurveyDB).filter(SurveyDB.id == survey_id).first()
    if not survey_db:
        raise HTTPException(status_code=404, detail="Umfrage nicht gefunden")
    
    questions_db = db.query(QuestionDB).filter(QuestionDB.survey_id == survey_id).order_by(QuestionDB.order).all()
    
    questions = []
    for q_db in questions_db:
        question = Question(
            id=q_db.id,
            survey_id=q_db.survey_id,
            title=q_db.title,
            type=q_db.type,
            options=q_db.options,
            required=q_db.required,
            description=q_db.description,
            order=q_db.order,
            created_at=q_db.created_at
        )
        questions.append(question)
    
    return Survey(
        id=survey_db.id,
        title=survey_db.title,
        description=survey_db.description,
        is_active=survey_db.is_active,
        created_at=survey_db.created_at,
        response_count=survey_db.response_count,
        questions=questions
    )

# Survey Endpoints
@app.post("/surveys/", response_model=Survey, tags=["Surveys"])
async def create_survey(survey_data: SurveyCreate, db: Session = Depends(get_db)):
    """
    Erstellt eine neue Umfrage mit Fragen in der SQLite-Datenbank.
    
    - **title**: Titel der Umfrage (erforderlich)
    - **description**: Beschreibung der Umfrage (optional)
    - **questions**: Liste der Fragen (optional, können später hinzugefügt werden)
    """
    survey_id = generate_id()
    
    # Umfrage in Datenbank speichern
    survey_db = SurveyDB(
        id=survey_id,
        title=survey_data.title,
        description=survey_data.description,
        is_active=survey_data.is_active,
        created_at=datetime.now(),
        response_count=0
    )
    db.add(survey_db)
    
    # Fragen erstellen und speichern
    questions = []
    for i, q_data in enumerate(survey_data.questions):
        question_id = generate_id()
        question_db = QuestionDB(
            id=question_id,
            survey_id=survey_id,
            title=q_data.title,
            type=q_data.type.value,
            options=q_data.options,
            required=q_data.required,
            description=q_data.description,
            order=i,
            created_at=datetime.now()
        )
        db.add(question_db)
        
        question = Question(
            id=question_id,
            survey_id=survey_id,
            title=q_data.title,
            type=q_data.type,
            options=q_data.options,
            required=q_data.required,
            description=q_data.description,
            order=i,
            created_at=datetime.now()
        )
        questions.append(question)
    
    db.commit()
    
    return Survey(
        id=survey_id,
        title=survey_data.title,
        description=survey_data.description,
        is_active=survey_data.is_active,
        created_at=datetime.now(),
        response_count=0,
        questions=questions
    )

@app.get("/surveys/", response_model=List[Survey], tags=["Surveys"])
async def get_all_surveys(db: Session = Depends(get_db)):
    """Alle Umfragen aus der Datenbank abrufen"""
    surveys_db = db.query(SurveyDB).all()
    surveys = []
    
    for survey_db in surveys_db:
        survey = get_survey_with_questions(db, survey_db.id)
        surveys.append(survey)
    
    return surveys

@app.get("/surveys/{survey_id}", response_model=Survey, tags=["Surveys"])
async def get_survey(survey_id: str, db: Session = Depends(get_db)):
    """Eine spezifische Umfrage aus der Datenbank abrufen"""
    return get_survey_with_questions(db, survey_id)

@app.put("/surveys/{survey_id}", response_model=Survey, tags=["Surveys"])
async def update_survey(survey_id: str, survey_data: SurveyBase, db: Session = Depends(get_db)):
    """Umfrage-Details in der Datenbank aktualisieren"""
    survey_db = db.query(SurveyDB).filter(SurveyDB.id == survey_id).first()
    if not survey_db:
        raise HTTPException(status_code=404, detail="Umfrage nicht gefunden")
    
    survey_db.title = survey_data.title
    survey_db.description = survey_data.description
    survey_db.is_active = survey_data.is_active
    
    db.commit()
    return get_survey_with_questions(db, survey_id)

@app.delete("/surveys/{survey_id}", tags=["Surveys"])
async def delete_survey(survey_id: str, db: Session = Depends(get_db)):
    """Umfrage und alle zugehörigen Daten aus der Datenbank löschen"""
    survey_db = db.query(SurveyDB).filter(SurveyDB.id == survey_id).first()
    if not survey_db:
        raise HTTPException(status_code=404, detail="Umfrage nicht gefunden")
    
    # Zugehörige Fragen und Antworten löschen
    db.query(QuestionDB).filter(QuestionDB.survey_id == survey_id).delete()
    db.query(ResponseDB).filter(ResponseDB.survey_id == survey_id).delete()
    db.query(SurveyDB).filter(SurveyDB.id == survey_id).delete()
    
    db.commit()
    return {"message": "Umfrage erfolgreich gelöscht"}

# Question Endpoints
@app.post("/surveys/{survey_id}/questions/", response_model=Question, tags=["Questions"])
async def add_question(survey_id: str, question_data: QuestionCreate, db: Session = Depends(get_db)):
    """Neue Frage zu einer Umfrage in der Datenbank hinzufügen"""
    survey_db = db.query(SurveyDB).filter(SurveyDB.id == survey_id).first()
    if not survey_db:
        raise HTTPException(status_code=404, detail="Umfrage nicht gefunden")
    
    # Aktuelle Anzahl Fragen ermitteln für Order
    question_count = db.query(QuestionDB).filter(QuestionDB.survey_id == survey_id).count()
    
    question_id = generate_id()
    question_db = QuestionDB(
        id=question_id,
        survey_id=survey_id,
        title=question_data.title,
        type=question_data.type.value,
        options=question_data.options,
        required=question_data.required,
        description=question_data.description,
        order=question_count,
        created_at=datetime.now()
    )
    
    db.add(question_db)
    db.commit()
    
    return Question(
        id=question_id,
        survey_id=survey_id,
        title=question_data.title,
        type=question_data.type,
        options=question_data.options,
        required=question_data.required,
        description=question_data.description,
        order=question_count,
        created_at=datetime.now()
    )

@app.put("/surveys/{survey_id}/questions/{question_id}", response_model=Question, tags=["Questions"])
async def update_question(survey_id: str, question_id: str, question_data: QuestionBase, db: Session = Depends(get_db)):
    """Frage in der Datenbank aktualisieren"""
    question_db = db.query(QuestionDB).filter(
        QuestionDB.id == question_id,
        QuestionDB.survey_id == survey_id
    ).first()
    
    if not question_db:
        raise HTTPException(status_code=404, detail="Frage nicht gefunden")
    
    question_db.title = question_data.title
    question_db.type = question_data.type.value
    question_db.options = question_data.options
    question_db.required = question_data.required
    question_db.description = question_data.description
    
    db.commit()
    
    return Question(
        id=question_db.id,
        survey_id=question_db.survey_id,
        title=question_db.title,
        type=question_db.type,
        options=question_db.options,
        required=question_db.required,
        description=question_db.description,
        order=question_db.order,
        created_at=question_db.created_at
    )

@app.delete("/surveys/{survey_id}/questions/{question_id}", tags=["Questions"])
async def delete_question(survey_id: str, question_id: str, db: Session = Depends(get_db)):
    """Frage aus der Datenbank löschen"""
    question_db = db.query(QuestionDB).filter(
        QuestionDB.id == question_id,
        QuestionDB.survey_id == survey_id
    ).first()
    
    if not question_db:
        raise HTTPException(status_code=404, detail="Frage nicht gefunden")
    
    db.query(QuestionDB).filter(QuestionDB.id == question_id).delete()
    db.commit()
    
    return {"message": "Frage erfolgreich gelöscht"}

# Response Endpoints
@app.post("/responses/", response_model=Response, tags=["Responses"])
async def submit_response(response_data: ResponseSubmission, db: Session = Depends(get_db)):
    """
    Antwort auf eine Umfrage in der Datenbank speichern.
    
    - **survey_id**: ID der Umfrage
    - **answers**: Liste der Antworten mit question_id und answer
    - **participant_name**: Name des Teilnehmers (optional)
    """
    # Umfrage existiert?
    survey_db = db.query(SurveyDB).filter(SurveyDB.id == response_data.survey_id).first()
    if not survey_db:
        raise HTTPException(status_code=404, detail="Umfrage nicht gefunden")
    
    # Pflichtfragen validieren
    required_questions = db.query(QuestionDB).filter(
        QuestionDB.survey_id == response_data.survey_id,
        QuestionDB.required == True
    ).all()
    
    required_question_ids = {q.id for q in required_questions}
    answered_question_ids = {a.question_id for a in response_data.answers}
    
    missing_questions = required_question_ids - answered_question_ids
    if missing_questions:
        raise HTTPException(
            status_code=400,
            detail=f"Erforderliche Fragen nicht beantwortet: {missing_questions}"
        )
    
    # Antwort in Datenbank speichern
    response_id = generate_id()
    answers_json = [{"question_id": a.question_id, "answer": a.answer} for a in response_data.answers]
    
    response_db = ResponseDB(
        id=response_id,
        survey_id=response_data.survey_id,
        participant_name=response_data.participant_name,
        answers=answers_json,
        submitted_at=datetime.now()
    )
    
    db.add(response_db)
    
    # Response Count aktualisieren
    survey_db.response_count += 1
    
    db.commit()
    
    return Response(
        id=response_id,
        survey_id=response_data.survey_id,
        participant_name=response_data.participant_name,
        answers=response_data.answers,
        submitted_at=datetime.now()
    )

@app.get("/surveys/{survey_id}/responses/", response_model=List[Response], tags=["Responses"])
async def get_survey_responses(survey_id: str, db: Session = Depends(get_db)):
    """Alle Antworten zu einer Umfrage aus der Datenbank abrufen"""
    responses_db = db.query(ResponseDB).filter(ResponseDB.survey_id == survey_id).all()
    
    responses = []
    for r_db in responses_db:
        answers = [AnswerSubmission(question_id=a["question_id"], answer=a["answer"]) for a in r_db.answers]
        response = Response(
            id=r_db.id,
            survey_id=r_db.survey_id,
            participant_name=r_db.participant_name,
            answers=answers,
            submitted_at=r_db.submitted_at
        )
        responses.append(response)
    
    return responses

@app.get("/responses/{response_id}", response_model=Response, tags=["Responses"])
async def get_response(response_id: str, db: Session = Depends(get_db)):
    """Eine spezifische Antwort aus der Datenbank abrufen"""
    response_db = db.query(ResponseDB).filter(ResponseDB.id == response_id).first()
    if not response_db:
        raise HTTPException(status_code=404, detail="Antwort nicht gefunden")
    
    answers = [AnswerSubmission(question_id=a["question_id"], answer=a["answer"]) for a in response_db.answers]
    
    return Response(
        id=response_db.id,
        survey_id=response_db.survey_id,
        participant_name=response_db.participant_name,
        answers=answers,
        submitted_at=response_db.submitted_at
    )

# Analytics Endpoints
@app.get("/surveys/{survey_id}/analytics/", tags=["Analytics"])
async def get_survey_analytics(survey_id: str, db: Session = Depends(get_db)):
    """
    Grundlegende Analyse-Daten für eine Umfrage aus der Datenbank.
    Zeigt Antwortverteilung für Multiple-Choice-Fragen.
    """
    survey_db = db.query(SurveyDB).filter(SurveyDB.id == survey_id).first()
    if not survey_db:
        raise HTTPException(status_code=404, detail="Umfrage nicht gefunden")
    
    questions_db = db.query(QuestionDB).filter(QuestionDB.survey_id == survey_id).all()
    responses_db = db.query(ResponseDB).filter(ResponseDB.survey_id == survey_id).all()
    
    analytics = {
        "survey_id": survey_id,
        "total_responses": len(responses_db),
        "questions_analytics": {}
    }
    
    for question in questions_db:
        question_responses = []
        for response in responses_db:
            for answer_data in response.answers:
                if answer_data["question_id"] == question.id:
                    question_responses.append(answer_data["answer"])
        
        if question.type in ["multiple_choice", "single_choice"]:
            # Antwortverteilung für Choice-Fragen
            answer_counts = {}
            for answer in question_responses:
                if isinstance(answer, list):
                    for choice in answer:
                        answer_counts[choice] = answer_counts.get(choice, 0) + 1
                else:
                    answer_counts[answer] = answer_counts.get(answer, 0) + 1
            
            analytics["questions_analytics"][question.id] = {
                "question_title": question.title,
                "question_type": question.type,
                "answer_distribution": answer_counts,
                "total_answers": len(question_responses)
            }
        
        elif question.type == "rating":
            # Durchschnittsbewertung für Rating-Fragen
            ratings = [int(r) for r in question_responses if isinstance(r, (int, str)) and str(r).isdigit()]
            avg_rating = sum(ratings) / len(ratings) if ratings else 0
            
            analytics["questions_analytics"][question.id] = {
                "question_title": question.title,
                "question_type": question.type,
                "average_rating": round(avg_rating, 2),
                "total_ratings": len(ratings),
                "rating_distribution": {str(i): ratings.count(i) for i in range(1, 6)}
            }
    
    return analytics

# Health Check
@app.get("/health/", tags=["Health"])
async def health_check(db: Session = Depends(get_db)):
    """API Gesundheitsstatus mit Datenbankstatistiken"""
    surveys_count = db.query(SurveyDB).count()
    responses_count = db.query(ResponseDB).count()
    
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "database": "SQLite",
        "surveys_count": surveys_count,
        "responses_count": responses_count
    }

# Root Endpoint
@app.get("/", tags=["Root"])
async def root():
    """Willkommen bei der QuickPool API"""
    return {
        "message": "Willkommen bei der QuickPoll API!",
        "database": "SQLite",
        "docs": "/docs",
        "redoc": "/redoc",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) #Hier wird später der Port angepasst