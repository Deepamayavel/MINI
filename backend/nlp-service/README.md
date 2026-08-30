# MediGuide NLP prediction service

This is a development/demo Flask service. It uses spaCy lemmatization to map natural-language symptom text to a binary feature vector, then ranks disease-symptom records using cosine similarity and selects a disease by majority vote among the top `k` neighbours.

## Dataset

`training_data.csv` is obtained from the public GitHub mirror of the Kaggle **Disease Prediction Using Machine Learning** dataset (Kaushil268). `prepare_dataset.py` converts it into the required `disease_symptoms.csv` with `Disease` and `Symptoms` columns. The source dataset has 132 symptom features and 41 disease labels.

This educational dataset and service must not be used as a clinical diagnosis or treatment system.
