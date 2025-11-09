import azure.functions as func
import pandas as pd
import json
import io
import requests

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        csv_url = "https://dietanalysisstorageneel.blob.core.windows.net/datasets/All_Diets.csv?sp=r&st=2025-11-08T09:02:15Z&se=2025-11-09T17:17:15Z&spr=https&sv=2024-11-04&sr=b&sig=EAUHHzkEiPTFdb%2BQlTsluLUdOSrW5zrc00DFmrkKDxs%3D"

        response = requests.get(csv_url, allow_redirects=True)
        response.raise_for_status()

        df = pd.read_csv(io.StringIO(response.text))
        df.columns = df.columns.str.strip()

        # Convert nutrient columns to numeric
        for col in ["Protein(g)", "Carbs(g)", "Fat(g)"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        df.fillna(df.mean(numeric_only=True), inplace=True)

        avg_df = df.groupby("Diet_type")[["Protein(g)", "Carbs(g)", "Fat(g)"]].mean()
        avg = avg_df.to_dict()

        high_protein = max(avg["Protein(g)"], key=avg["Protein(g)"].get)

        result = {
            "status": "success",
            "highest_protein_diet": high_protein,
            "averages": avg
        }

        return func.HttpResponse(
            json.dumps(result, indent=4, default=str),
            mimetype="application/json",
            status_code=200
        )

    except Exception as e:
        return func.HttpResponse(
            json.dumps({"status": "error", "message": str(e)}),
            mimetype="application/json",
            status_code=500
        )
