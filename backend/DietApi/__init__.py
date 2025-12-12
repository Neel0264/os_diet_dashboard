import azure.functions as func
import pandas as pd
import json
import os
from azure.storage.blob import BlobServiceClient
from io import StringIO

def main(req: func.HttpRequest):

    # connect to Azure Blob Storage
    conn = os.environ["AzureWebJobsStorage"]
    blob_service = BlobServiceClient.from_connection_string(conn)

    container = blob_service.get_container_client("data")
    blob = container.get_blob_client("clean_diets.csv")

    csv_data = blob.download_blob().readall().decode("utf-8")
    df = pd.read_csv(StringIO(csv_data))

    # query params
    diet = req.params.get("diet")
    search = req.params.get("search", "")
    page = int(req.params.get("page", 1))
    pageSize = int(req.params.get("pageSize", 5))

    if diet:
        df = df[df["Diet_type"].str.contains(diet, case=False, na=False)]

    if search:
        df = df[df.apply(lambda r: search.lower() in str(r).lower(), axis=1)]

    start = (page - 1) * pageSize
    end = start + pageSize

    result = df.iloc[start:end].to_dict(orient="records")

    return func.HttpResponse(
        json.dumps(result),
        mimetype="application/json"
    )

