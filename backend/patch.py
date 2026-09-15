from app.detection.ml_classifier import MLClassifier
from app.services.email_parser import EmailParser
import json

classifier = MLClassifier()

print('=== STEP 3: BENIGN SAMPLES ===')
samples_step3 = [
    ('Payment Received', 'From: billing@vendor.com\nTo: user@company.com\nSubject: Payment Received\n\nThank you for your payment.'),
    ('Invoice', 'From: accounting@vendor.com\nTo: user@company.com\nSubject: Invoice #12345\n\nPlease find attached the invoice for last month services.'),
    ('Password Reset', 'From: noreply@auth.company.com\nTo: user@company.com\nSubject: Password Reset Confirmation\n\nYour password for Company Portal was recently reset successfully.'),
    ('Security Policy Update', 'From: security@company.com\nTo: all@company.com\nSubject: Security Policy Update\n\nPlease review the updated annual cybersecurity guidelines on the intranet.'),
    ('Urgent Project Deadline', 'From: manager@company.com\nTo: team@company.com\nSubject: Urgent Project Deadline\n\nHi team, our deadline for the sprint is tomorrow at 5 PM. Please wrap up your PRs.')
]

for name, raw in samples_step3:
    parsed = EmailParser.parse_raw(raw.encode('utf-8'))
    res = classifier.predict_email(parsed)
    print(f'Sample: {name}')
    print(f'  Label: {res["label"]}, Phishing Prob: {res["probabilities"].get("phishing", 0.0):.4f}, Benign Prob: {res["probabilities"].get("benign", 0.0):.4f}')
    top_feats = [f'{f["feature"]}: {f["contribution"]:.3f}' for f in res.get('top_contributing_features', [])[:5]]
    print(f'  Top features: {top_feats}')

print('\n=== STEP 5: CONTROLLED MINIMAL EXAMPLES (A-G) ===')
examples_step5 = [
    ('A', 'Thank you for your payment.'),
    ('B', 'Payment received successfully.'),
    ('C', 'Payment received - Order 9481.'),
    ('D', 'Your payment was received.'),
    ('E', 'Your payment was received. Please contact support if needed.'),
    ('F', 'URGENT payment required.'),
    ('G', 'Click here to verify your payment.')
]

for label_id, text in examples_step5:
    res = classifier.predict(text)
    print(f'Example {label_id} ("{text}"):')
    print(f'  Label: {label_id} -> {res["label"]}, Phishing Prob: {res["probabilities"].get("phishing", 0.0):.4f}, Benign Prob: {res["probabilities"].get("benign", 0.0):.4f}')
    top_feats = [f'{f["feature"]}: {f["contribution"]:.3f}' for f in res.get('top_contributing_features', [])[:5]]
    print(f'  Top features: {top_feats}')

