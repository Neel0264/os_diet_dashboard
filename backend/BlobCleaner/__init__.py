import pandas as pd
import logging
from pymongo import MongoClient
import os
from io import StringIO

def main(inputBlob):
    logging.info("All_Diets.csv updated. Cleaning data...")

    try:
        # Read original CSV
        df = pd.read_csv(StringIO(inputBlob.read().decode("utf-8")))

        # Basic cleaning
        df = df.dropna()
        df.columns = [c.strip().lower() for c in df.columns]

        # Connect to Cosmos DB
        conn_string = os.environ["COSMOS_CONN_STRING"]
        db_name = os.environ["COSMOS_DB_NAME"]
        collection_name = os.environ.get("COSMOS_CLEANED_COLLECTION", "cleanedData")

        client = MongoClient(conn_string)
        db = client[db_name]
        collection = db[collection_name]

        # Clear existing data
        collection.delete_many({})

        # Insert cleaned data
        records = df.to_dict(orient="records")
        if records:
            collection.insert_many(records)
            logging.info(f"Inserted {len(records)} records into Cosmos DB")

        logging.info("Data cleaning and upload completed successfully.")

    except Exception as e:
        logging.error(f"Error in BlobCleaner: {str(e)}")
        raise

