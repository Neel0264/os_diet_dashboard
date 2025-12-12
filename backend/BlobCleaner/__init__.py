import pandas as pd
import logging
from azure.storage.blob import BlobServiceClient
import os
from io import StringIO

def main(inputBlob):
    logging.info("All_Diets.csv updated. Cleaning data...")

    # read original csv
    df = pd.read_csv(StringIO(inputBlob.read().decode("utf-8")))

    # basic cleaning
    df = df.dropna()
    df.columns = [c.strip().lower() for c in df.columns]

    # save cleaned csv
    conn = os.environ["AzureWebJobsStorage"]
    blob_service = BlobServiceClient.from_connection_string(conn)

    container = blob_service.get_container_client("data")
    out_blob = container.get_blob_client("clean_diets.csv")

    out_blob.upload_blob(df.to_csv(index=False), overwrite=True)

    logging.info("clean_diets.csv updated successfully.")

