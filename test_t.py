import asyncio
from app.integrations.threatfox import ThreatFoxService
from app.integrations.urlhaus import URLhausService

async def main():
    tf = ThreatFoxService()
    uh = URLhausService()
    t = await tf.get_recent_ioc()
    u = await uh.get_recent_urls()
    print("TF First Item:", t.get("data", [])[0] if getattr(t, "get", None) and t.get("data") else "None")
    print("UH First Item:", u.get("data", [])[0] if getattr(u, "get", None) and u.get("data") else "None")

asyncio.run(main())
