
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import json

app = Flask(__name__)
CORS(app)

# Load trained MLR model
model = joblib.load("concrete_model.pkl")

# Load evaluation metrics
with open("metrics.json", "r") as file:
    metrics = json.load(file)

FEATURES = [
    "Cement",
    "Blast Furnace Slag",
    "Fly Ash",
    "Water",
    "Superplasticizer",
    "Coarse Aggregate",
    "Fine Aggregate",
    "Age"
]

@app.route("/")
def home():
    return jsonify({
        "message": "Concrete Strength Prediction API is running!"
    })

@app.route("/api/health")
def health():
    return jsonify({"status": "connected"})

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        values = []

        for feature in FEATURES:
            value = float(data[feature])

            if not np.isfinite(value) or value < 0:
                return jsonify({"error": f"Invalid value: {feature}"}), 400

            values.append(value)

        if values[7] <= 0:
            return jsonify({"error": "Age must be greater than zero"}), 400

        input_data = pd.DataFrame([values], columns=FEATURES)

        prediction = model.predict(input_data)[0][0]

        return jsonify({
            "prediction": round(float(prediction), 2),
            "unit": "MPa"
        })

    except (KeyError, TypeError, ValueError):
        return jsonify({"error": "Please enter all eight valid values"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/metrics")
def get_metrics():
    return jsonify(metrics)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
