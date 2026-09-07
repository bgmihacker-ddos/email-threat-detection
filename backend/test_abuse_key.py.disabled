import asyncio
from app.integrations.abuseipdb import AbuseIPDBService

async def test_key():
    print("Testing AbuseIPDB integration...")
    service = AbuseIPDBService()

    if not service.api_key:
        print("Error: ABUSEIPDB_API_KEY is not configured in .env")
        return

    # Using Google DNS as a test IP
    result = await service.get_ip_reputation("8.8.8.8")

    if result:
        print("Success! Integration works.")
        print(f"Reputation result snippet: {result}")
    else:
        print("Failure: Could not retrieve reputation data. Check API key and service logs.")

if __name__ == "__main__":
    asyncio.run(test_key())
