
# train.py

from ucimlrepo import fetch_ucirepo
import pandas as pd
import numpy as np
import joblib
import json

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score
)

print("Downloading UCI Concrete Dataset...")

# 1. Download dataset
concrete = fetch_ucirepo(id=165)

# 2. Separate input and output
X = concrete.data.features
y = concrete.data.targets

# 3. Display dataset information
df = pd.concat([X, y], axis=1)

print("\nFirst five rows:")
print(df.head())

print("\nDataset shape:", df.shape)
print("\nMissing values:")
print(df.isnull().sum())

# 4. Split training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# 5. Create MLR model
model = LinearRegression()

# 6. Train model
model.fit(X_train, y_train)

# 7. Predict test data
y_pred = model.predict(X_test)

# 8. Evaluate model
mse = mean_squared_error(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("\n----- MLR RESULTS -----")
print("MSE:", mse)
print("MAE:", mae)
print("R2 Score:", r2)

# 9. Display coefficients
print("\nRegression Coefficients:")
print("Intercept:", model.intercept_[0])

for name, coef in zip(X.columns, model.coef_[0]):
    print(name, ":", coef)

# 10. Save trained model
joblib.dump(model, "concrete_model.pkl")

# 11. Save evaluation results
metrics = {
    "mse": float(mse),
    "mae": float(mae),
    "r2": float(r2),
    "actual": y_test.values.flatten().tolist()[:50],
    "predicted": y_pred.flatten().tolist()[:50]
}

with open("metrics.json", "w") as file:
    json.dump(metrics, file)

print("\nMODEL TRAINED SUCCESSFULLY!")
print("Model saved as concrete_model.pkl")
