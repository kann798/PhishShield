"""
Root entry point for Render cloud deployment.
Imports Flask application instance from the backend directory.
"""
import sys
import os
import importlib.util

backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

spec = importlib.util.spec_from_file_location("backend_app", os.path.join(backend_dir, "app.py"))
backend_module = importlib.util.module_from_spec(spec)
sys.modules["backend_app"] = backend_module
spec.loader.exec_module(backend_module)

app = backend_module.app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
