from fastapi import FastAPI
from typing import Optional
from pydantic import BaseModel
import uvicorn
app = FastAPI()


@app.get("/blog")
def index(limit: int = 123, published : bool = True, sort : Optional[str] = None):
    if published:
        return {'data': f'{limit} published blogs from the db'}
    else:
        return {'data': f'{limit} unpublished blogs from the db'}

@app.get("/blog/unpublished")
def get_unpublished_blogs():
    return {'data': 'all unpublished blogs'}

@app.get("/blog/{id}")
def show(id: int):
    return {'data': id}


class Blog(BaseModel):
    title: str
    body: str
    published: Optional[bool]


@app.post("/blog")
def create_blog(request: Blog):
    test = 1234,
    body_1 = request.body
    return {"data": f'blog is created with title as {request.title}'}



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)
