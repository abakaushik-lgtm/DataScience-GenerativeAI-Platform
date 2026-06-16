import urllib.request
import json
import urllib.error

base_url = "http://127.0.0.1:8000"

endpoints = [
    {"path": "/health", "method": "GET", "data": None},
    {"path": "/api/insights/generate", "method": "POST", "data": {"db_type": "mock"}},
    {"path": "/api/advanced-ml/ab-test", "method": "POST", "data": {"control_conversions": 100, "control_size": 1000, "treatment_conversions": 150, "treatment_size": 1000}},
    {"path": "/api/forecasting/predict", "method": "POST", "data": {"db_type": "mock", "time_col": "date", "target_col": "sales", "periods": 12, "algorithm": "Prophet"}},
    {"path": "/api/automl/train", "method": "POST", "data": {"db_type": "mock", "task_type": "Classification", "target_col": "target"}},
    {"path": "/api/analyst/query", "method": "POST", "data": {"question": "What is the revenue?", "schema_info": "CREATE TABLE sales (revenue FLOAT);", "db_type": "mock"}}
]

for ep in endpoints:
    url = base_url + ep["path"]
    req = urllib.request.Request(url, method=ep["method"], headers={'User-Agent': 'Mozilla/5.0'})
    if ep["data"]:
        req.add_header('Content-Type', 'application/json')
        data = json.dumps(ep["data"]).encode('utf-8')
        req.data = data
    
    try:
        response = urllib.request.urlopen(req)
        body = response.read().decode('utf-8')
        print(f"[OK] {ep['method']} {ep['path']}")
    except urllib.error.HTTPError as e:
        print(f"[FAIL] {ep['method']} {ep['path']} -> {e.code} {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"[ERROR] {ep['method']} {ep['path']} -> {e}")
