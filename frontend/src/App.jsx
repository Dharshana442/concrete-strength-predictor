
import { useState, useEffect } from "react";
import { Activity, Beaker, Droplets, Layers, Mountain, Waves, Clock, RotateCcw } from "lucide-react";
import "./App.css";

const fields = [
  { name: "Cement", icon: Beaker, unit: "kg/m³" },
  { name: "Blast Furnace Slag", icon: Layers, unit: "kg/m³" },
  { name: "Fly Ash", icon: Mountain, unit: "kg/m³" },
  { name: "Water", icon: Droplets, unit: "kg/m³" },
  { name: "Superplasticizer", icon: Waves, unit: "kg/m³" },
  { name: "Coarse Aggregate", icon: Layers, unit: "kg/m³" },
  { name: "Fine Aggregate", icon: Beaker, unit: "kg/m³" },
  { name: "Age", icon: Clock, unit: "Days" }
];

const initialValues = Object.fromEntries(
  fields.map(field => [field.name, ""])
);

function App() {
  const [values, setValues] = useState(initialValues);
  const [prediction, setPrediction] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/health")
      .then(response => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(() => setConnected(true))
      .catch(() => setConnected(false));
  }, []);

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };

  const handleReset = () => {
    setValues(initialValues);
    setPrediction(null);
    setError("");
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setError("");
    setPrediction(null);

    for (const field of fields) {
      const value = values[field.name];

      if (
        value === "" ||
        !Number.isFinite(Number(value)) ||
        Number(value) < 0
      ) {
        setError(`Please enter a valid value for ${field.name}`);
        return;
      }
    }

    if (Number(values.Age) <= 0) {
      setError("Age must be greater than zero.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(
            Object.fromEntries(
              Object.entries(values).map(([key, value]) => [
                key,
                Number(value)
              ])
            )
          )
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Prediction failed");
      }

      setPrediction(data.prediction);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <Activity size={27} />
          </div>
          <div>
            <h2>Concrete<span>IQ</span></h2>
            <p>STRENGTH PREDICTION SYSTEM</p>
          </div>
        </div>

        <div className="connection">
          <span className={connected ? "dot online" : "dot offline"}></span>
          {connected ? "Backend Connected" : "Backend Disconnected"}
        </div>
      </header>

      <main className="container">

        <section className="hero">
          <span className="eyebrow">MACHINE LEARNING · MULTIPLE LINEAR REGRESSION</span>

          <h1>
            Predict concrete.<br />
            <span>Build stronger.</span>
          </h1>

          <p>
            Predict concrete compressive strength using eight material
            properties and a trained Multiple Linear Regression model.
          </p>
        </section>

        <section className="workspace">

          <div className="form-card">

            <div className="section-heading">
              <div>
                <span className="small-label">INPUT PARAMETERS</span>
                <h2>Concrete Composition</h2>
                <p>Enter all eight material properties.</p>
              </div>

              <button className="reset-button" onClick={handleReset}>
                <RotateCcw size={15} /> Reset
              </button>
            </div>

            <form onSubmit={handlePredict}>

              <div className="input-grid">
                {fields.map(field => {
                  const Icon = field.icon;

                  return (
                    <div className="input-group" key={field.name}>
                      <label>
                        <Icon size={17} />
                        {field.name}
                      </label>

                      <div className="input-wrapper">
                        <input
                          type="number"
                          name={field.name}
                          value={values[field.name]}
                          onChange={handleChange}
                          placeholder="Enter value"
                          min="0"
                          step="any"
                          required
                        />
                        <span>{field.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && <div className="error">{error}</div>}

              <button
                className="predict-button"
                type="submit"
                disabled={!connected || loading}
              >
                {loading ? "Predicting..." : "Predict Compressive Strength"}
                <Activity size={19} />
              </button>

              {!connected && (
                <p className="help-text">
                  Please start the Python Flask backend.
                </p>
              )}

            </form>
          </div>

          <div className="result-card">
            <div className="result-icon">
              <Activity size={28} />
            </div>

            <span className="small-label">PREDICTION RESULT</span>

            <h2>Compressive<br />Strength</h2>

            <div className="result-value">
              {prediction !== null ? prediction : "--"}
              <span>MPa</span>
            </div>

            <div className="result-divider"></div>

            <p>
              {prediction !== null
                ? "Prediction completed successfully!"
                : "Your predicted concrete strength will appear here."}
            </p>

            <div className="result-info">
              <strong>Algorithm:</strong> Multiple Linear Regression
              <br />
              <strong>Dataset:</strong> UCI Concrete Strength
              <br />
              <strong>Features:</strong> 8 Variables
            </div>
          </div>

        </section>

        <footer>
          ConcreteIQ | Machine Learning Project | UCI Dataset
        </footer>

      </main>
    </div>
  );
}

export default App;
