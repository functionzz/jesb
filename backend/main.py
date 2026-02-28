import os
import uuid as uuid_lib
from typing import Annotated, Any

from auth0_fastapi.auth.auth_client import AuthClient
from auth0_fastapi.config import Auth0Config
from auth0_fastapi.server.routes import register_auth_routes, router
from dotenv import load_dotenv
from pydantic import BaseModel, ConfigDict
from fastapi import Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlmodel import Field, Relationship, Session, SQLModel, create_engine, select
from datetime import datetime, timezone
from sqlalchemy import Column, JSON
from starlette.middleware.sessions import SessionMiddleware

load_dotenv()


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)

class CanvasCreate(BaseModel):
    name: str

class Canvas(SQLModel, table=True):
    id: str = Field(
        default_factory=lambda: str(uuid_lib.uuid4()),
        primary_key=True,
        unique=True,
    )
    name: str
    shapes: list["Shape"] = Relationship(back_populates="canvas")

class TLShape(BaseModel):
    id: str
    type: str

    model_config = ConfigDict(extra="allow")

class Shape(SQLModel, table=True):
    id: str = Field(primary_key=True)

    canvas_id: str = Field(foreign_key="canvas.id", index=True)

    document_id: str | None = Field(default=None, index=True)
    type: str = Field(index=True)

    data: dict = Field(
        sa_column=Column(JSON, nullable=False)
    )

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    canvas: Canvas = Relationship(back_populates="shapes")



sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]

app = FastAPI(title="Auth0 FastAPI Example")
frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")

session_secret = os.getenv("SESSION_SECRET")
if not session_secret:
    raise RuntimeError("Missing SESSION_SECRET in environment variables.")

app.add_middleware(SessionMiddleware, secret_key=session_secret)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

config = Auth0Config(
    domain=os.getenv("AUTH0_DOMAIN"),
    client_id=os.getenv("AUTH0_CLIENT_ID"),
    client_secret=os.getenv("AUTH0_CLIENT_SECRET"),
    app_base_url=os.getenv("APP_BASE_URL", "http://localhost:8000"),
    secret=session_secret,
    authorization_params={"scope": "openid profile email"},
)

auth_client = AuthClient(config)

app.state.config = config
app.state.auth_client = auth_client

register_auth_routes(router, config)
app.include_router(router)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# User CRUD

@app.post("/users/")
def create_user(user: User, session: SessionDep) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@app.get("/users/")
def read_users(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[User]:
    users = session.exec(select(User).offset(offset).limit(limit)).all()
    return users


@app.get("/users/{user_id}")
def read_user(user_id: int, session: SessionDep) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.delete("/users/{user_id}")
def delete_user(user_id: int, session: SessionDep):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"ok": True}


# Canvas CRUD
@app.post("/canvas/", response_model=Canvas)
def create_canvas(canvas_in: CanvasCreate, session: SessionDep) -> Canvas:
    canvas = Canvas(name=canvas_in.name)
    session.add(canvas)
    session.commit()
    session.refresh(canvas)
    return canvas


@app.get("/canvas/", response_model=list[Canvas])
def read_canvases(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Canvas]:
    canvases = session.exec(select(Canvas).offset(offset).limit(limit)).all()
    return canvases


@app.get("/canvas/{canvas_id}", response_model=Canvas)
def read_canvas(canvas_id: str, session: SessionDep) -> Canvas:
    canvas = session.get(Canvas, canvas_id)
    if not canvas:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return canvas


@app.delete("/canvas/{canvas_id}")
def delete_canvas(canvas_id: str, session: SessionDep):
    canvas = session.get(Canvas, canvas_id)
    if not canvas:
        raise HTTPException(status_code=404, detail="Canvas not found")

    shapes = session.exec(select(Shape).where(Shape.canvas_id == canvas_id)).all()
    for shape in shapes:
        session.delete(shape)

    session.delete(canvas)
    session.commit()
    return {"ok": True}


# Shape CRUD

# Get shapes for a specific canvas
@app.get("/canvas/{canvas_id}/shapes")
def read_shapes(canvas_id: str, session: SessionDep) -> list[Shape]:
    shapes = session.exec(select(Shape).where(Shape.canvas_id == canvas_id)).all()

    return shapes


# Saves all shapes via Save button - deletes all existing shapes and recreates them
@app.post("/canvas/{canvas_id}/shapes")
def batch_save_shape(canvas_id: str, shapes: list[TLShape], session: SessionDep):
    # Delete all existing shapes for this canvas
    existing = session.exec(select(Shape).where(Shape.canvas_id == canvas_id)).all()
    for shape in existing:
        session.delete(shape)

    # Create new shapes
    db_shapes = []
    for shape in shapes:
        db_shape = Shape(
            id=shape.id,
            canvas_id=canvas_id,
            type=shape.type,
            data=shape.model_dump(),
        )
        session.add(db_shape)
        db_shapes.append(db_shape)

    session.commit()
    return db_shapes



@app.get("/")
def root() -> dict[str, str]:
    return {
        "message": "Backend is running.",
        "auth": "Visit /auth/login to start Auth0 login.",
    }


@app.get("/post-login")
def post_login(next: str = "/canvas"):
    safe_next = next if next.startswith("/") else "/canvas"
    return RedirectResponse(url=f"{frontend_base_url}{safe_next}")


@app.get("/post-logout")
def post_logout(next: str = "/login"):
    safe_next = next if next.startswith("/") else "/login"
    return RedirectResponse(url=f"{frontend_base_url}{safe_next}")


@app.get("/profile")
async def profile(
    request: Request,
    response: Response,
    session: dict[str, Any] = Depends(auth_client.require_session),
):
    store_options = {"request": request, "response": response}
    user = await auth_client.client.get_user(store_options=store_options)
    return {"message": "Your Profile", "user": user, "session_details": session}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=3000)