# TWS Recommender

A content-based recommender for True Wireless Stereo (TWS) earbuds under IDR 1,000,000. Users specify a sound signature, minimum battery life, ANC, gaming mode, water resistance, and budget; the backend filters and scores every product in the database, and the UI presents the top 5 matches with per-product reasoning.

Two pieces:

- **`backend/`** — FastAPI + MongoDB. Product CRUD, related-product lookup, and the recommendation engine (constraint filtering + cosine similarity over a 7-dimension feature vector).
- **`frontend/`** — Next.js 16 (App Router), React 19, Tailwind CSS v4. Catalog with search/filter/sort/pagination, preference form, product detail pages, and FAQ.

![Home page](docs/screenshots/beranda.png)

![Recommendation results](docs/screenshots/rekomendasi.png)

## Recommendation scoring

Scoring runs server-side in two stages:

1. **Hard constraints** — products failing any requirement are discarded before scoring:
   - `harga ≤ budget`
   - `battery_hours ≥ min_battery_hours`
   - IP rating parsed live from the `water_resistance` string per IEC 60529 — `basic` requires the water digit ≥ 4; `sport` requires water ≥ 5 **or** dust ≥ 5 with water ≥ 4 (so IP54 qualifies for outdoor use, while IPX4 does not).
2. **Cosine similarity** — surviving products are encoded as a 7-dimension vector and compared against the preference vector. The raw cosine (not the rounded display score) drives ordering, with deterministic tie-breakers (price → brand → name → id) so results never depend on database order.

| Dimension        | Encoding                        | Notes                                                          |
| ---------------- | ------------------------------- | -------------------------------------------------------------- |
| Sound character  | one-hot `[bass, balance, treble]` | single categorical attribute across 3 dimensions             |
| ANC              | binary                          | zeroed when the user did not request it                        |
| Gaming mode      | binary                          | zeroed when the user did not request it                        |
| Battery          | capped min–max to 50 h          | 50+ hours saturates at 1.0                                     |
| Water resistance | water digit ÷ 8                 | zeroed when "none"; dust ≥ 5 with water ≥ 4 scores as level 5  |

Unrequested features are neutralized rather than penalizing the product, so a perfectly matching product can reach a score of 100. Bluetooth version and codec are excluded from scoring and displayed as informational specifications only.

## API

| Method   | Endpoint                      | Description                                                                 |
| -------- | ----------------------------- | --------------------------------------------------------------------------- |
| `GET`    | `/tws`                        | List products. Optional `skip`/`limit` pagination; `limit=0` returns all.   |
| `GET`    | `/tws/{id}`                   | Product detail.                                                             |
| `GET`    | `/tws/{id}/related`           | Related products: same brand first, then same price tier (300k/600k splits). |
| `POST`   | `/tws`                        | Create a product. Rejects duplicate name + brand.                           |
| `PUT`    | `/tws/{id}`                   | Full update. Rejects name + brand collisions with other products.           |
| `DELETE` | `/tws/{id}`                   | Delete a product.                                                           |
| `POST`   | `/recommend?top_n=5`          | Recommendations for a preference payload (`top_n` 1–20). Returns matches with display score (0–100), reason chips, and full specs. |

## Project structure

```
tws-recommender/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app: CRUD, related, recommendation scoring
│   │   ├── models.py          # Pydantic models (TWSModel, UserPreferenceModel)
│   │   ├── config.py          # Environment config (MongoDB, CORS)
│   │   └── database.py        # MongoDB client / collection
│   ├── scripts/seed.py        # Import tws.json into MongoDB
│   └── requirements.txt
├── frontend/
│   ├── app/                   # App Router routes: /, /recommend, /product, /product/[id], /faq
│   ├── components/            # Navbar, Footer, PreferenceForm, RecommendationList
│   ├── lib/                   # API base URL, shared types
│   ├── scripts/visual_qa.py   # Playwright layout checks
│   └── public/images/         # Product images (not tracked)
├── docs/screenshots/          # README screenshots
└── tws.json                   # Product dataset (not tracked)
```

## Getting started

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB running locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Copy `backend/.env.example` to `backend/.env` (defaults match a local MongoDB on `localhost:27017`), then load the dataset and start the server:

```bash
python -m scripts.seed
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env.local` — optional, the app falls back to `http://localhost:8000` — then run:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment variables

**Backend (`backend/.env`)**

| Variable          | Description                          | Default                     |
| ----------------- | ------------------------------------ | --------------------------- |
| `MONGODB_URL`     | MongoDB connection URI               | `mongodb://localhost:27017/` |
| `DB_NAME`         | Database name                        | `tws_recommender`           |
| `COLLECTION_NAME` | Product collection                   | `tws_products`              |
| `CORS_ORIGINS`    | Allowed frontend origins, comma-separated | `http://localhost:3000` |

**Frontend (`frontend/.env.local`)**

| Variable               | Description                                        | Default                 |
| ---------------------- | -------------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL`  | Backend API base URL                               | `http://localhost:8000` |
| `NEXT_PUBLIC_SITE_URL` | Site URL used for absolute metadata/OG links       | `http://localhost:3000` |
| `IMAGE_REMOTE_HOSTS`   | External hosts allowed for `next/image`, comma-separated | empty             |

## Quality checks

```bash
# frontend
npm run lint            # ESLint
npx tsc --noEmit        # type check
npm run build           # production build

# layout baseline (needs both servers running)
python frontend/scripts/visual_qa.py
```

`visual_qa.py` walks `/`, `/recommend`, `/product`, one `/product/[id]` detail page, and `/faq` across four viewports (375, 768, 1024, 1440 px), asserting no horizontal overflow, exactly one `h1` per page, and the site title in the metadata.

## Dataset note

`tws.json` and the product images are intentionally not tracked in this repository. The seed script reads `tws.json` from the project root — the working dataset covers 90 products across 38 brands (IDR 95,000–999,000). To use your own data, provide a JSON array of objects matching `TWSModel` in `backend/app/models.py` and run `python -m scripts.seed`.
