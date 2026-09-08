import asyncio
from backend.app.core.database import SessionLocal
from backend.app.api.routes.indicators import get_indicators

async def main():
    db = SessionLocal()
    try:
        res = await get_indicators(limit=5, db=db)
        print("SAMPLE INDICATOR DATA:")
        print(res["data"][0] if res["data"] else "No data")
    finally:
        db.close()

asyncio.run(main())
