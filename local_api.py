"""
Simple local API server for testing the dashboard
Run this with: python local_api.py
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load CSV data
try:
    df = pd.read_csv('All_Diets.csv')
    print(f"[OK] Loaded {len(df)} recipes from All_Diets.csv")
except Exception as e:
    print(f"[ERROR] Error loading CSV: {e}")
    df = pd.DataFrame()

@app.route('/api/dietapi', methods=['GET'])
def get_recipes():
    # Get query parameters
    diet = request.args.get('diet')
    search = request.args.get('search', '')
    page = int(request.args.get('page', 1))
    pageSize = int(request.args.get('pageSize', 9))

    # Filter by diet type
    filtered_df = df.copy()
    if diet and diet != 'All Diets':
        filtered_df = filtered_df[filtered_df['Diet_type'].str.contains(diet, case=False, na=False)]

    # Search filter
    if search:
        filtered_df = filtered_df[filtered_df.apply(
            lambda row: search.lower() in str(row).lower(), axis=1
        )]

    # Pagination
    start = (page - 1) * pageSize
    end = start + pageSize
    result = filtered_df.iloc[start:end]

    # Convert to JSON
    recipes = result.to_dict(orient='records')

    print(f"[API] Returning {len(recipes)} recipes (page {page}, diet: {diet}, search: '{search}')")

    return jsonify(recipes)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'total_recipes': len(df),
        'message': 'Local API server is running!'
    })

if __name__ == '__main__':
    print("=" * 60)
    print("LOCAL DIET API SERVER")
    print("=" * 60)
    print(f"Server URL: http://localhost:5000")
    print(f"API Endpoint: http://localhost:5000/api/dietapi")
    print(f"Health Check: http://localhost:5000/api/health")
    print(f"Total Recipes Loaded: {len(df)}")
    print("=" * 60)
    print("[OK] Server ready! Your dashboard will fetch data from here.")
    print("=" * 60)
    app.run(debug=True, port=5000)
