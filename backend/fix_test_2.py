import re

with open('D:/project/email-threat-detection/backend/tests/test_p15_full_system_red_team.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix double counting
code = code.replace(
    '        "iocs": extracted_iocs,\n        "urls": url_analysis,',
    '        "iocs": {"urls": [u["value"] for u in extracted_iocs.get("iocs", []) if u["type"] == "url"], "domains": [d["value"] for d in extracted_iocs.get("iocs", []) if d["type"] == "domain"], "ips": [ip["value"] for ip in extracted_iocs.get("iocs", []) if ip["type"] in ["ip", "ipv4", "ipv6"]], "original": extracted_iocs},\n        "urls": url_analysis,'
)
with open('D:/project/email-threat-detection/backend/tests/test_p15_full_system_red_team.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done fixing tests")
