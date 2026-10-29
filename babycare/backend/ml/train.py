"""
BabyCare System Check — 5-condition model training.

Run (backend/ folder se):
    python ml/train.py

Output:
    ml/model.pkl     → {"model", "features", "cards", "numeric", "classes", ...}
    ml/accuracy.png  → CV + test accuracy comparison chart
"""
from pathlib import Path
import time

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ML_DIR = Path(__file__).resolve().parent
DATA = ML_DIR / "babycare_5conditions_dataset.csv"
CARDS = ["fever", "cold_cough", "teething_pain", "diarrhea", "sleep_issues"]
NUMERIC = ["age_months", "duration_days"]
FEATURES = CARDS + NUMERIC
LABEL = "condition"
CLASSES = ["Fever", "Cold & Cough", "Teething", "Diarrhea", "Sleep Issues"]
SEED = 42


def build_models():
    # age/duration StandardScaler se, 5 cards (0/1) as-is
    logreg = Pipeline([
        ("prep", ColumnTransformer(
            [("num", StandardScaler(), NUMERIC)],
            remainder="passthrough",
        )),
        ("clf", LogisticRegression(max_iter=2000)),
    ])
    rf = RandomForestClassifier(n_estimators=300, min_samples_leaf=2, n_jobs=-1, random_state=SEED)
    return {"LogisticRegression": logreg, "RandomForest": rf}


def main():
    print(f"scikit-learn {sklearn.__version__}")
    df = pd.read_csv(DATA)
    X, y = df[FEATURES], df[LABEL]
    assert set(y.unique()) == set(CLASSES), f"unexpected classes: {sorted(y.unique())}"
    print(f"Rows: {len(df)} | features: {FEATURES}")
    print(f"Class counts: {y.value_counts().to_dict()}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=SEED
    )
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)

    results = {}
    for name, model in build_models().items():
        t = time.time()
        cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="accuracy", n_jobs=-1)
        model.fit(X_train, y_train)
        test_acc = accuracy_score(y_test, model.predict(X_test))
        results[name] = {"model": model, "cv_mean": cv_scores.mean(), "cv_std": cv_scores.std(), "test": test_acc}
        print(f"\n{name}: CV {cv_scores.mean():.4f} ± {cv_scores.std():.4f} | "
              f"test {test_acc:.4f} | {time.time() - t:.1f}s")

    for name, r in results.items():
        pred = r["model"].predict(X_test)
        print(f"\n═══ Classification report — {name} ═══")
        print(classification_report(y_test, pred, labels=CLASSES, digits=3))
        print("Confusion matrix (rows = actual, cols = predicted):", CLASSES)
        print(confusion_matrix(y_test, pred, labels=CLASSES))

    # Barabar ho to LogReg (simple + calibrated probabilities)
    best_name = max(results, key=lambda n: (round(results[n]["test"], 3), n == "LogisticRegression"))
    best = results[best_name]["model"]
    print(f"\n★ Best model: {best_name}")

    # Final model: poore data par refit (test score upar report ho chuka)
    best.fit(X, y)
    joblib.dump({
        "model": best,
        "model_name": best_name,
        "features": FEATURES,
        "cards": CARDS,
        "numeric": NUMERIC,
        "classes": CLASSES,
        "sklearn_version": sklearn.__version__,
        "test_accuracy": results[best_name]["test"],
        "cv_accuracy": results[best_name]["cv_mean"],
    }, ML_DIR / "model.pkl")
    print(f"Saved {ML_DIR / 'model.pkl'}")

    # Accuracy chart
    names = list(results)
    cv_means = [results[n]["cv_mean"] * 100 for n in names]
    cv_stds = [results[n]["cv_std"] * 100 for n in names]
    tests = [results[n]["test"] * 100 for n in names]
    x = range(len(names))
    fig, ax = plt.subplots(figsize=(7, 5))
    b1 = ax.bar([i - 0.2 for i in x], cv_means, 0.4, yerr=cv_stds, capsize=4, label="5-fold CV", color="#2a9d5c")
    b2 = ax.bar([i + 0.2 for i in x], tests, 0.4, label="Test (20%)", color="#1a6e3f")
    ax.bar_label(b1, fmt="%.1f%%", padding=3, fontsize=9)
    ax.bar_label(b2, fmt="%.1f%%", padding=3, fontsize=9)
    ax.set_xticks(list(x), names)
    ax.set_ylabel("Accuracy (%)")
    ax.set_ylim(min(cv_means + tests) - 10, 100)
    ax.set_title(f"BabyCare 5-condition model (best: {best_name})")
    ax.legend(loc="lower right")
    ax.spines[["top", "right"]].set_visible(False)
    fig.tight_layout()
    fig.savefig(ML_DIR / "accuracy.png", dpi=130)
    print(f"Saved {ML_DIR / 'accuracy.png'}")


if __name__ == "__main__":
    main()
