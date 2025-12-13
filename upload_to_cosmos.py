import pandas as pd
from pymongo import MongoClient
import time
import os
import json

def upload_data():
    print("Reading CSV file...")
    df = pd.read_csv('All_Diets.csv')

    print(f"Loaded {len(df)} rows")

    # Clean data
    print("Cleaning data...")
    df = df.dropna()
    df.columns = [c.strip().lower() for c in df.columns]

    print(f"After cleaning: {len(df)} rows")

    # Get connection details from environment or local.settings.json
    print("Loading configuration...")
    conn_string = os.environ.get("COSMOS_CONN_STRING")
    db_name = os.environ.get("COSMOS_DB_NAME", "dietDB")
    collection_name = os.environ.get("COSMOS_CLEANED_COLLECTION", "cleanedData")

    if not conn_string:
        # Try to read from local.settings.json
        try:
            with open('backend/local.settings.json', 'r') as f:
                settings = json.load(f)
                conn_string = settings['Values']['COSMOS_CONN_STRING']
                db_name = settings['Values'].get('COSMOS_DB_NAME', db_name)
                collection_name = settings['Values'].get('COSMOS_CLEANED_COLLECTION', collection_name)
        except Exception as e:
            print(f"Error reading local.settings.json: {e}")
            print("Please set COSMOS_CONN_STRING environment variable or ensure backend/local.settings.json exists")
            return

    # Connect to Cosmos DB
    print("Connecting to Cosmos DB...")

    client = MongoClient(conn_string)
    db = client[db_name]
    collection = db[collection_name]

    # Check if collection has data
    count = collection.count_documents({})
    print(f"Current documents in collection: {count}")

    # Insert cleaned data in batches
    print("Inserting data into Cosmos DB in batches...")
    records = df.to_dict(orient="records")
    batch_size = 100
    total_inserted = 0

    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        try:
            collection.insert_many(batch)
            total_inserted += len(batch)
            print(f"Inserted {total_inserted}/{len(records)} records")
            time.sleep(0.5)  # Small delay between batches
        except Exception as e:
            print(f"Error inserting batch {i//batch_size + 1}: {e}")
            # Try with smaller batch
            for record in batch:
                try:
                    collection.insert_one(record)
                    total_inserted += 1
                    time.sleep(0.1)
                except Exception as e2:
                    print(f"Error inserting record: {e2}")

    print(f"Upload completed! Inserted {total_inserted} records")
    print(f"Total documents in collection: {collection.count_documents({})}")

if __name__ == "__main__":
    upload_data()
