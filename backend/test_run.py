import asyncio
from app.database.session import SessionLocal
from app.api.routes.analysis import analyze_email
from fastapi import UploadFile
import io

async def main():
    db = SessionLocal()
    with open("test_req.eml", "rb") as f:
        content = f.read()

    file = UploadFile(filename="test_req.eml", file=io.BytesIO(content))
    try:
        res = await analyze_email(raw_content=None, file=file, db=db)
        print("Success! Result ID:", res.analysis_id)
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
