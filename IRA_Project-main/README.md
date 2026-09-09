# IRA — Student Dropout Risk Intelligence

Predict dropout risk (Low / Medium / High) and academic performance from student attendance, scores, fees, and gender. Three React dashboards share one Node API and saved sklearn pipelines.

## Architecture / data flow

```
React dashboards (Mayuresh :5173, Deepu :5174, Amir :5175)
        │  GET/POST
        ▼
Node.js Express API  (localhost:8080)
        │  spawn python3 ml/infer.py
        ▼
Saved pipelines  ml/artifacts/*.joblib
        │
        ▼
JSON prediction + precomputed analytics/metrics
```

Training is **not** run on each request. Retrain with the notebook or `python3 ml/train.py`.

There is **no database**.

## ML tasks and models

Raw data: `synthetic_student_data_with_risk_30_40_30.csv` (unchanged).

- **Classification** — `dropout_target`: Low Risk / Medium Risk / High Risk  
  Features: attendance, current/previous test & assignment scores, fees, gender  
  Compared: Logistic Regression, Decision Tree, Random Forest, HistGradientBoosting  
  Selected by **F1-macro** on a stratified 80/20 split (`random_state=42`).
- **Regression** — `academic_performance` = mean(current test, current assignment)  
  Features: attendance, previous scores, fees, gender (current scores excluded to avoid leakage)  
  Compared: Linear, Ridge, Decision Tree, Random Forest, HistGradientBoosting  
  Selected by **R²**; also report MAE, MSE, RMSE.

Preprocessing (fit on train only): median/mode impute, RobustScaler, OneHotEncoder, `class_weight='balanced'`. Duplicates dropped on a working copy only.

Notebook: `dkkkk.ipynb` (calls `ml/train.py` and reports saved metrics).

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness |
| GET | `/metadata` | Feature lists and allowed values |
| GET | `/model-info` | Candidate and test metrics |
| GET | `/analytics` | Aggregates for charts (no row dump) |
| POST | `/predict` | Dropout risk + predicted performance |

Example body:

```json
{
  "attendance": 72,
  "current_test_score": 68,
  "current_assignment_score": 70,
  "previous_test_score": 64,
  "previous_assignment_score": 66,
  "fees": "Paid",
  "gender": "Female"
}
```

Scores and attendance must be 0–100. `fees`: Paid | Unpaid. `gender`: Male | Female. Errors are `{ "error": true, "message": "..." }`.

## Dashboard roles

Shared API client lives in `frontend/shared`. Each app has its own layout:

- **Mayuresh** (`:5173`) — dark operations / risk command sidebar
- **Deepu** (`:5174`) — advising studio, banner + two-column layout
- **Amir** (`:5175`) — compact insights lab, charts first

## Setup and run

Python 3.10+ and Node 18+ recommended.

```bash
python3 -m pip install -r requirements.txt
python3 ml/train.py

cd backend && npm install && npm start

cd frontend/mayuresh && npm install && npm run dev
cd frontend/deepu && npm install && npm run dev
cd frontend/amir && npm install && npm run dev
```

## Environment variables

Backend (`backend/.env`, see `.env.example`):

- `PORT` — API port (default `8080`)
- `PYTHON_BIN` — Python executable (default `python3`)
- `FRONTEND_ORIGINS` — comma-separated dashboard origins (CORS, credentials allowed; no `*`)

Frontend (each app `.env`):

- `VITE_API_URL` — API base, default `http://localhost:8080`

## Testing

```bash
# artifacts exist
ls ml/artifacts/dropout_pipeline.joblib ml/artifacts/model_info.json

# API
curl -s http://localhost:8080/health
curl -s http://localhost:8080/metadata
curl -s http://localhost:8080/model-info
curl -s http://localhost:8080/analytics
curl -s -X POST http://localhost:8080/predict -H 'Content-Type: application/json' \
  -d '{"attendance":49,"current_test_score":46,"current_assignment_score":50,"previous_test_score":29,"previous_assignment_score":28,"fees":"Paid","gender":"Male"}'
curl -s -X POST http://localhost:8080/predict -H 'Content-Type: application/json' -d '{}'

# CORS preflight from a dashboard origin
curl -s -D - -o /dev/null -X OPTIONS http://localhost:8080/predict \
  -H 'Origin: http://localhost:5173' -H 'Access-Control-Request-Method: POST'
```

Notebook: run all cells in `dkkkk.ipynb` (re-trains and overwrites artifacts).

## Model usage

- Train: `python3 ml/train.py` → `ml/artifacts/dropout_pipeline.joblib`, `performance_pipeline.joblib`, `model_info.json`, `analytics.json`
- Infer: `python3 ml/infer.py` with JSON on stdin, or POST `/predict`
- Do not ship the raw CSV through the API
