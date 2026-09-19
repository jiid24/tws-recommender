import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "tws_recommender")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "tws_products")

# Origin frontend yang diizinkan mengakses API (CORS). Bisa memuat beberapa
# origin dipisah koma, mis. "http://localhost:3000,https://tws.example.com".
# Default ke localhost:3000 supaya perilaku pengembangan lokal tidak berubah.
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]