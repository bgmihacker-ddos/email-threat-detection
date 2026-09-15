import re

with open('D:/project/email-threat-detection/backend/tests/test_p15_full_system_red_team.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix BEC
code = code.replace(
    'res["bec_res"]["bec_detected"] is True',
    'res["bec_res"].get("is_bec") is True'
)
code = code.replace(
    'res_a["bec_res"]["bec_detected"] is True',
    'res_a["bec_res"].get("is_bec") is True'
)

# Fix ML Classifier score
code = code.replace(
    'res["ml_res"]["score"] >= 0.40',
    'res["ml_res"].get("probability", res["ml_res"].get("probabilities", {}).get("phishing", 0.0)) >= 0.40'
)
code = code.replace(
    'res_f["ml_res"]["score"] >= 0.40',
    'res_f["ml_res"].get("probability", res_f["ml_res"].get("probabilities", {}).get("phishing", 0.0)) >= 0.40'
)

# Fix Attachment Analyzer count
code = code.replace(
    'res["attachment_analysis"]["summary"]["total_count"] == 1',
    'len(res["attachment_analysis"].get("attachments", res["attachment_analysis"].get("analyzed_attachments", []))) == 1'
)
code = code.replace(
    'res_d["attachment_analysis"]["summary"]["suspicious_count"] > 0',
    'res_d["attachment_analysis"].get("high_risk_count", 0) > 0'
)

# Fix Provenance Class enum
code = code.replace(
    'assert node["provenance"] in ["OBSERVED",',
    'assert str(node["provenance"]).replace("ProvenanceClass.", "") in ["OBSERVED",'
)

with open('D:/project/email-threat-detection/backend/tests/test_p15_full_system_red_team.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Replacement complete.")
