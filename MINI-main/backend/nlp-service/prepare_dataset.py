"""Convert the source binary symptom dataset to Disease,Symptoms records."""

from pathlib import Path

import pandas as pd


ROOT = Path(__file__).parent
SOURCE = ROOT / "training_data.csv"
OUTPUT = ROOT / "disease_symptoms.csv"


def clean_symptom(name: str) -> str:
    return " ".join(name.strip().replace("_", " ").split())


def main() -> None:
    frame = pd.read_csv(SOURCE)
    label_column = "prognosis"
    if label_column not in frame.columns:
        raise ValueError(f"Expected '{label_column}' in {SOURCE.name}")

    symptom_columns = [column for column in frame.columns if column != label_column]
    records = []
    for _, row in frame.iterrows():
        symptoms = [clean_symptom(column) for column in symptom_columns if int(row[column]) == 1]
        records.append({"Disease": row[label_column].strip(), "Symptoms": ", ".join(symptoms)})

    dataset = pd.DataFrame(records).drop_duplicates().sort_values(["Disease", "Symptoms"])
    dataset.to_csv(OUTPUT, index=False)
    print(f"Created {OUTPUT.name}: {len(dataset)} records across {dataset['Disease'].nunique()} diseases.")


if __name__ == "__main__":
    main()
