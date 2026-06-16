import sys
import os

# Add frontend/api to python path
sys.path.insert(0, "frontend/api")

print("Attempting to import index.py...")
try:
    import index
    print("SUCCESS: index imported successfully")
except Exception as e:
    import traceback
    print("FAILED: Import failed with exception:")
    traceback.print_exc()
