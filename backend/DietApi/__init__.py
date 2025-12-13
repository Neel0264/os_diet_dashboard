import azure.functions as func
import json
import os
from pymongo import MongoClient
import logging

def main(req: func.HttpRequest):
    try:
        # Connect to Cosmos DB (MongoDB API)
        conn_string = os.environ["COSMOS_CONN_STRING"]
        db_name = os.environ["COSMOS_DB_NAME"]
        collection_name = os.environ.get("COSMOS_CLEANED_COLLECTION", "cleanedData")

        client = MongoClient(conn_string)
        db = client[db_name]
        collection = db[collection_name]

        # Query params
        diet = req.params.get("diet")
        search = req.params.get("search", "")
        page = int(req.params.get("page", 1))
        pageSize = int(req.params.get("pageSize", 9))

        # Build query filter
        query = {}

        if diet and diet != "All Diets":
            query["diet_type"] = {"$regex": diet, "$options": "i"}

        if search:
            query["$or"] = [
                {"recipe_name": {"$regex": search, "$options": "i"}},
                {"diet_type": {"$regex": search, "$options": "i"}},
                {"cuisine_type": {"$regex": search, "$options": "i"}}
            ]

        # Calculate pagination
        skip = (page - 1) * pageSize

        # Query database
        results = list(collection.find(query).skip(skip).limit(pageSize))

        # Transform results to match Dashboard field name expectations
        transformed_results = []
        for item in results:
            transformed = {
                "Recipe_name": item.get("recipe_name", ""),
                "Diet_type": item.get("diet_type", ""),
                "Cuisine_type": item.get("cuisine_type", ""),
                "Protein(g)": item.get("protein(g)", 0),
                "Carbs(g)": item.get("carbs(g)", 0),
                "Fat(g)": item.get("fat(g)", 0),
                "Extraction_day": item.get("extraction_day", ""),
                "Extraction_time": item.get("extraction_time", "")
            }
            transformed_results.append(transformed)

        return func.HttpResponse(
            json.dumps(transformed_results),
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

    except Exception as e:
        logging.error(f"Error in DietApi: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

