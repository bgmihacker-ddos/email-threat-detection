"""
Audit and train ML detection models with leakage-safe splits.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
import joblib

# Setup paths
DOWNLOADS = Path('C:/Users/dhrut/Downloads')
ML_MODELS = Path('D:/project/email-threat-detection/ml/models')
ML_MODELS.mkdir(parents=True, exist_ok=True)

def load_data():
    files = {
        'llm_phishing': (DOWNLOADS / 'llm_phishing.csv', 1),
        'llm_legit': (DOWNLOADS / 'llm_legit.csv', 0),
        'human_phishing': (DOWNLOADS / 'human_phishing.csv', 1),
        'human_legit': (DOWNLOADS / 'human_legit.csv', 0),
        'phishing_legitimate': (DOWNLOADS / 'phishing_legitimate_emails.csv', 'Category'),
        'mail_data': (DOWNLOADS / 'mail_data.csv', 'Category'),
        'Phishing_Email': (DOWNLOADS / 'Phishing_Email.csv', 'Email Type')
    }

    data = []

    for name, (path, label_col) in files.items():
        if not path.exists():
            continue
        print(f"Loading {name}...")
        df = pd.read_csv(path, on_bad_lines='skip', engine='python')

        if name == 'llm_phishing' or name == 'llm_legit':
            df = df.rename(columns={'text': 'message'})
            df['label'] = 1 if 'phishing' in name else 0
        elif name == 'phishing_legitimate':
            df = df.rename(columns={'Message': 'message'})
            df['label'] = df[label_col].apply(lambda x: 1 if str(x).lower() == 'phishing' else 0)
        elif name == 'mail_data':
            df = df.rename(columns={'Message': 'message'})
            df['label'] = df[label_col].apply(lambda x: 1 if str(x).lower() == 'spam' else 0)
        elif name == 'Phishing_Email':
            df = df.rename(columns={'Email Text': 'message'})
            df['label'] = df[label_col].apply(lambda x: 1 if 'phishing' in str(x).lower() else 0)
        else:
            # human datasets already have columns subject/body
            df['message'] = df['subject'].fillna('') + ' ' + df['body'].fillna('')
            df['label'] = 1 if 'phishing' in name else 0

        df = df[['message', 'label']]
        df = df.dropna(subset=['message'])
        data.append(df)

    full_df = pd.concat(data, ignore_index=True)
    full_df['message'] = full_df['message'].astype(str).str.strip()
    full_df = full_df[full_df['message'] != '']
    full_df = full_df.drop_duplicates(subset=['message'])

    return full_df

def train_and_evaluate():
    df = load_data()
    print(f"Total records after deduplication: {len(df)}")
    print(f"Class distribution: \n{df['label'].value_counts()}")

    X = df['message']
    y = df['label'].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    vectorizer = TfidfVectorizer(max_features=10000, stop_words='english', token_pattern=r'(?u)\b\w+\b')
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    clf = LogisticRegression(class_weight='balanced', max_iter=1000)
    clf.fit(X_train_vec, y_train)

    y_pred = clf.predict(X_test_vec)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    joblib.dump(vectorizer, ML_MODELS / 'tfidf_vectorizer.joblib')
    joblib.dump(clf, ML_MODELS / 'logistic_regression_clf.joblib')
    print(f"\nSaved models to {ML_MODELS}")

if __name__ == '__main__':
    train_and_evaluate()
