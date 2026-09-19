from fastapi import FastAPI, HTTPException, Query
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware
import math

from app.database import tws_collection
from app.config import CORS_ORIGINS
from app.models import UserPreferenceModel, TWSModel


# ─────────────────────────────────────────────
#  KETAHANAN AIR & DEBU (IP Rating, IEC 60529)
# ─────────────────────────────────────────────
#
# Format rating "IPxy": digit pertama = proteksi debu (0–6), digit kedua =
# proteksi air (0–8). Huruf "X" berarti aspek itu tidak diuji/diklaim dan
# diperlakukan sebagai 0.
#   Contoh: "IPX4" → debu 0, air 4 ; "IP54" → debu 5, air 4.
#
# Kedua digit di-parse langsung dari string (satu sumber kebenaran), bukan
# lewat tabel hardcoded, supaya rating baru otomatis dikenali dan tidak ada
# risiko lupa memperbarui tabel. Ini menggantikan pendekatan field ordinal
# water_resistance_level pre-computed yang dipakai di main-onehot.py — di
# sini rating IP tetap jadi satu-satunya sumber kebenaran, sejalan dengan
# standar IEC 60529, sementara karakter suara tetap di-One-Hot Encoding.

# Level tertinggi standar IEC 60529 untuk ketahanan air (IP68 = 8).
# Dipakai sebagai pembagi normalisasi water_tier ke skala [0,1].
WATER_MAX_LEVEL = 8


def _ip_levels(rating: str | None) -> tuple[int, int]:
    """
    Pecah rating IP menjadi (level_debu, level_air) sesuai IEC 60529.
    Digit "X" atau format tak lengkap diperlakukan sebagai 0.
    Contoh: "IP54" → (5, 4), "IPX5" → (0, 5), None → (0, 0).

    Spasi dibuang lebih dulu supaya penulisan seperti "IP 54" tetap terbaca
    benar; tanpa ini digitnya bergeser dan rating salah dinilai.
    """
    body = (rating or "").upper().replace(" ", "").removeprefix("IP")
    if len(body) < 2:
        return (0, 0)
    dust = int(body[0]) if body[0].isdigit() else 0
    water = int(body[1]) if body[1].isdigit() else 0
    return (dust, water)


def _passes_water_requirement(rating: str | None, requirement: str) -> bool:
    """
    Cek apakah produk memenuhi ambang ketahanan air yang diminta user.

      none  : selalu lolos (user tidak butuh).
      basic : tahan keringat/percikan  → level air ≥ 4 (IPX4, IP54, …).
      sport : olahraga & outdoor       → tahan air kuat (air ≥ 5, mis.
              IPX5/IP55) ATAU tahan debu + percikan (debu ≥ 5 dan air ≥ 4,
              mis. IP54).

    Catatan desain: untuk pemakaian luar ruangan, proteksi debu (digit
    pertama) sama pentingnya dengan air. IP54 (debu 5, air 4) karena itu
    layak masuk kategori sport meski digit airnya hanya 4 — justru lebih
    sesuai outdoor dibanding IPX5 yang tanpa proteksi debu sama sekali.
    """
    dust, water = _ip_levels(rating)
    if requirement == "basic":
        return water >= 4
    if requirement == "sport":
        return water >= 5 or (dust >= 5 and water >= 4)
    return True  # "none" atau nilai tak dikenal → tidak memfilter

# Plafon baterai untuk normalisasi (capped min-max). Dipilih 50 jam sebagai
# batas atas praktis: mayoritas produk ada di bawahnya, dan di atas ~50 jam
# perbedaan daya tahan tak lagi terasa signifikan bagi pengguna (produk
# 52–60 jam dianggap setara = 1.00). Contoh: 16 jam → 0.32, 30 jam → 0.60,
# 50 jam → 1.00. Angka ini keputusan desain, bisa di-tune sesuai dataset.
BATTERY_CAP_HOURS = 50.0

app = FastAPI(title="TWS Recommendation API (One-Hot Encoding + Live IP Parsing)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Backend TWS Recommendation API (One-Hot v2) is running"}


@app.get("/tws")
def get_all_tws(
    skip: int = Query(0, ge=0),
    limit: int = Query(0, ge=0, le=500),
):
    """
    Ambil daftar produk.

    Paginasi opsional lewat query `skip` dan `limit`. Nilai default
    `limit=0` mengembalikan seluruh produk — kompatibel dengan katalog
    frontend yang memuat semua data untuk difilter di sisi klien.
    `total_data` selalu berisi jumlah keseluruhan produk di basis data.
    """
    total = tws_collection.count_documents({})
    cursor = tws_collection.find().skip(skip)
    if limit:
        cursor = cursor.limit(limit)
    data = []
    for item in cursor:
        item["_id"] = str(item["_id"])
        data.append(item)
    return {"total_data": total, "returned": len(data), "products": data}


@app.get("/tws/{product_id}")
def get_tws_by_id(product_id: str):
    try:
        product = tws_collection.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Format ID tidak valid.")
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan.")
    product["_id"] = str(product["_id"])
    return product


# Ambang tier harga untuk pengelompokan "produk terkait", menyesuaikan ruang
# lingkup penelitian (produk di bawah Rp1.000.000) dan memakai batas yang sama
# dengan filter harga pada katalog frontend (300rb / 600rb).
def _price_tier(harga: int) -> str:
    if harga <= 300_000:
        return "low"
    if harga <= 600_000:
        return "mid"
    return "high"


@app.get("/tws/{product_id}/related")
def get_related_tws(product_id: str, limit: int = Query(4, ge=1, le=20)):
    """
    Produk terkait untuk halaman detail: utamakan brand yang sama, lalu
    lengkapi dengan produk pada tier harga yang sama (brand berbeda).
    Dihitung di server agar frontend tidak perlu mengunduh seluruh katalog
    hanya untuk menampilkan beberapa produk terkait.
    """
    try:
        detail = tws_collection.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Format ID tidak valid.")
    if not detail:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan.")

    detail_tier = _price_tier(detail["harga"])
    same_brand: list[dict] = []
    same_tier: list[dict] = []
    for product in tws_collection.find({"_id": {"$ne": detail["_id"]}}):
        if product["brand"] == detail["brand"]:
            same_brand.append(product)
        elif _price_tier(product["harga"]) == detail_tier:
            same_tier.append(product)

    related = (same_brand + same_tier)[:limit]
    for item in related:
        item["_id"] = str(item["_id"])
    return {"total": len(related), "products": related}


@app.post("/tws")
def add_tws(product: TWSModel):
    product_dict = product.model_dump()
    existing_product = tws_collection.find_one({
        "nama": product_dict["nama"],
        "brand": product_dict["brand"]
    })
    if existing_product:
        raise HTTPException(status_code=400, detail="Produk dengan nama dan brand tersebut sudah ada.")
    result = tws_collection.insert_one(product_dict)
    return {
        "message": "Produk berhasil ditambahkan",
        "inserted_id": str(result.inserted_id),
        "product": product_dict
    }


@app.put("/tws/{product_id}")
def update_tws(product_id: str, product: TWSModel):
    try:
        existing_product = tws_collection.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Format ID tidak valid.")
    if not existing_product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan.")
    product_dict = product.model_dump()
    duplicate_product = tws_collection.find_one({
        "nama": product_dict["nama"],
        "brand": product_dict["brand"],
        "_id": {"$ne": ObjectId(product_id)}
    })
    if duplicate_product:
        raise HTTPException(status_code=400, detail="Produk lain dengan nama dan brand tersebut sudah ada.")
    tws_collection.update_one({"_id": ObjectId(product_id)}, {"$set": product_dict})
    updated_product = tws_collection.find_one({"_id": ObjectId(product_id)})
    updated_product["_id"] = str(updated_product["_id"])
    return {"message": "Produk berhasil diperbarui", "product": updated_product}


@app.delete("/tws/{product_id}")
def delete_tws(product_id: str):
    try:
        result = tws_collection.delete_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Format ID tidak valid.")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan.")
    return {"message": "Produk berhasil dihapus", "deleted_id": product_id}


# ─────────────────────────────────────────────
#  ENCODING KARAKTER SUARA (One-Hot Encoding)
# ─────────────────────────────────────────────
#
# Karakter suara dikodekan dengan One-Hot Encoding: tiap kategori diwakili
# tiga dimensi [bass, balance, treble], dengan nilai 1 pada kategori yang
# aktif dan 0 pada lainnya. Encoding ini adalah metode baku untuk atribut
# kategorikal — tiap kategori diperlakukan sebagai kelas terpisah yang
# saling tegak lurus (orthogonal).
#
# Tidak ada pembobotan manual (tidak ada koefisien kali yang ditambahkan).
# Namun demikian, karena karakter suara adalah satu-satunya atribut dengan
# tiga pilihan yang saling eksklusif — sedangkan ANC, gaming, dan fitur
# lain bersifat biner (ada/tidak) — ketidakcocokan kategori suara secara
# matematis berpengaruh lebih besar terhadap skor cosine dibandingkan
# hilangnya satu fitur biner. Ini konsekuensi dari cara cosine similarity
# memperlakukan pergantian kategori (magnitude vektor tetap, hanya arah
# yang berubah) dibanding hilangnya fitur biner (magnitude vektor ikut
# menyusut), bukan hasil pembobotan yang disengaja.
SUARA_VEC: dict[str, list[float]] = {
    "bass":    [1.0, 0.0, 0.0],
    "balance": [0.0, 1.0, 0.0],
    "treble":  [0.0, 0.0, 1.0],
}


def _battery_tier(product_hours: float) -> float:
    """
    Normalisasi baterai produk ke skala [0,1] dengan plafon BATTERY_CAP_HOURS.
    Di atas plafon dianggap sama "bagus"-nya (capped min-max normalization).
    """
    if product_hours <= 0:
        return 0.0
    return min(product_hours / BATTERY_CAP_HOURS, 1.0)


def _water_tier(rating: str | None) -> float:
    """
    Normalisasi ketahanan air ke skala [0,1] terhadap level tertinggi
    standar IEC 60529 (air = 8).

    Konsisten dengan _passes_water_requirement: proteksi debu memadai
    (debu >= 5) pada produk tahan percikan (air >= 4) dianggap setara
    perlindungan outdoor level 5 — mis. IP54 dinilai setara IPX5. Tanpa
    penyelarasan ini, produk seperti IP54 yang lolos filter "sport" berkat
    proteksi debunya justru mendapat skor air lebih rendah, sehingga skor
    tidak sinkron dengan filter.

    Hasilnya dibatasi maksimal 1.0 (sama seperti _battery_tier) supaya rating
    di luar skala standar, mis. IPX9, tidak menghasilkan nilai di atas 1 yang
    justru menjauhkan vektor produk dari vektor preferensi.
    """
    dust, water = _ip_levels(rating)
    effective = max(water, 5) if (dust >= 5 and water >= 4) else water
    return min(effective / WATER_MAX_LEVEL, 1.0)


def _build_vector(
    suara: str,
    anc: bool,
    gaming: bool,
    battery_score: float,
    water_score: float,
    water_active: bool,
) -> list[float]:
    """
    Mengubah preferensi user atau atribut produk menjadi vektor 7-dimensi:

      [0..2] : karakter suara [bass, balance, treble]  (one-hot)
      [3]    : ANC                                  (1/0, dinetralkan)
      [4]    : gaming                               (1/0, dinetralkan)
      [5]    : battery_tier                         [0..1]
      [6]    : water_tier                           [0..1], dinetralkan

    Skor hanya dihitung dari preferensi yang benar-benar dipilih user (suara,
    ANC, gaming, baterai, ketahanan air). Bluetooth dan codec TIDAK masuk
    vektor cosine. Konsekuensinya, produk yang memenuhi seluruh preferensi
    user secara sempurna dapat mencapai skor mendekati atau sama dengan 100,
    karena tidak "dihukum" oleh fitur teknis yang tidak pernah diminta user.
    Bluetooth dan codec tetap ditampilkan sebagai informasi spesifikasi.

    Trik netralisasi:
      - ANC & gaming dinetralkan (jadi 0) saat user pilih "Tidak", supaya
        produk tidak dihukum karena punya fitur ekstra yang user tidak butuh.
      - Water dinetralkan saat user pilih "none".
    """
    suara_vec = SUARA_VEC.get(suara, [0.0, 0.0, 0.0])
    return [
        *suara_vec,
        1.0 if anc else 0.0,
        1.0 if gaming else 0.0,
        battery_score,
        water_score if water_active else 0.0,
    ]


# ─────────────────────────────────────────────
#  COSINE SIMILARITY
# ─────────────────────────────────────────────

def _cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    magnitude_a = math.sqrt(sum(a ** 2 for a in vec_a))
    magnitude_b = math.sqrt(sum(b ** 2 for b in vec_b))
    if magnitude_a == 0.0 or magnitude_b == 0.0:
        return 0.0
    return dot_product / (magnitude_a * magnitude_b)


# ─────────────────────────────────────────────
#  PENGHITUNG SKOR PER PRODUK
# ─────────────────────────────────────────────

def _compute_score(
    product: dict,
    preference: UserPreferenceModel,
    user_vector: list[float],
    water_active: bool,
) -> tuple[float, int, list[str]]:
    """
    Hitung kemiripan satu produk vs preferensi user.

    Return: (cosine_raw [0..1], display_score [0..100], alasan)
    """
    product_vector = _build_vector(
        suara=product["karakter_suara"],
        anc=preference.anc and bool(product["anc"]),
        gaming=preference.gaming and bool(product["gaming"]),
        battery_score=_battery_tier(float(product["battery_hours"])),
        water_score=_water_tier(product.get("water_resistance")),
        water_active=water_active,
    )

    cosine_raw = _cosine_similarity(user_vector, product_vector)
    display_score = round(cosine_raw * 100)

    # Alasan berfokus pada KECOCOKAN dengan preferensi user, bukan
    # mengulang data spesifikasi (sudah ditampilkan di spec grid frontend).
    alasan: list[str] = []

    # Karakter suara — selalu tampil sebagai indikator kecocokan
    if product["karakter_suara"] == preference.karakter_suara:
        alasan.append(f"Suara {preference.karakter_suara} sesuai")
    else:
        alasan.append(f"Suara {product['karakter_suara']} (beda preferensimu)")

    # Baterai — konfirmasi produk memenuhi kebutuhan minimal user
    alasan.append(
        f"Baterai {product['battery_hours']} jam "
        f"(memenuhi minimal {int(preference.min_battery_hours)} jam)"
    )

    # ANC — hanya tampil kalau user memang minta
    if preference.anc:
        alasan.append("ANC tersedia" if product["anc"] else "Tanpa ANC")

    # Gaming — hanya tampil kalau user memang minta
    if preference.gaming:
        alasan.append("Mode gaming" if product["gaming"] else "Tanpa mode gaming")

    # Water — hanya tampil kalau user pilih basic/sport (filter sudah lolos)
    if preference.water_resistance != "none":
        alasan.append(f"Tahan air {product.get('water_resistance', '-')}")

    return cosine_raw, display_score, alasan


# ─────────────────────────────────────────────
#  ENDPOINT: Rekomendasi
# ─────────────────────────────────────────────

@app.post("/recommend")
def recommend_tws(
    preference: UserPreferenceModel,
    top_n: int = Query(5, ge=1, le=20),
):
    """
    Rekomendasi TWS.

    Pendekatan: hybrid constraint-based + content-based filtering.

    Hard constraint (filter awal — produk yang gagal langsung dibuang):
      - Budget          (harga ≤ budget)
      - Min battery     (battery_hours ≥ min_battery_hours)
      - Water minimum   (rating IP memenuhi ambang basic/sport, di-parse
                         langsung dari string water_resistance)

    Soft preference (masuk vektor cosine, 7 dimensi, tanpa pembobotan manual):
      - Karakter suara  [3 dim one-hot: bass, balance, treble]
      - ANC             (dinetralkan kalau user tidak butuh)
      - Gaming          (dinetralkan kalau user tidak butuh)
      - Battery tier    (capped min-max ke 50 jam)
      - Water tier      (normalisasi IEC 60529, dinetralkan kalau "none")

    Bluetooth dan codec TIDAK masuk perhitungan skor; keduanya hanya
    ditampilkan sebagai informasi spesifikasi pada hasil rekomendasi.
    """
    products = list(tws_collection.find())

    if not products:
        return {
            "total_ditemukan": 0,
            "total_ditampilkan": 0,
            "recommendations": [],
            "pesan": "Belum ada produk di database."
        }

    water_active = preference.water_resistance != "none"

    user_vector = _build_vector(
        suara=preference.karakter_suara,
        anc=preference.anc,
        gaming=preference.gaming,
        battery_score=1.0,
        water_score=1.0,
        water_active=water_active,
    )

    candidates = []

    for product in products:
        # ── Hard filter 1: Budget ───────────────────────────────────────
        if product["harga"] > preference.budget:
            continue

        # ── Hard filter 2: Baterai minimum ──────────────────────────────
        if product["battery_hours"] < preference.min_battery_hours:
            continue

        # ── Hard filter 3: Water minimum ────────────────────────────────
        if not _passes_water_requirement(
            product.get("water_resistance"), preference.water_resistance
        ):
            continue

        cosine_raw, display_score, alasan = _compute_score(
            product, preference, user_vector, water_active
        )

        candidates.append({
            "id": str(product["_id"]),
            "nama": product["nama"],
            "brand": product["brand"],
            "harga": product["harga"],
            "image_url": product.get("image_url"),
            "skor": display_score,
            "_cosine_raw": cosine_raw,
            "alasan": alasan,
            "spesifikasi": {
                "karakter_suara": product["karakter_suara"],
                "battery_hours": product["battery_hours"],
                "anc": product["anc"],
                "gaming": product["gaming"],
                "bluetooth_version": product.get("bluetooth_version"),
                "codec": product.get("codec"),
                "water_resistance": product.get("water_resistance"),
                "driver_size": product.get("driver_size"),
                "mic_count": product.get("mic_count"),
                "charging_port": product.get("charging_port"),
                "deskripsi": product.get("deskripsi"),
            },
        })

    if not candidates:
        constraint_parts = [
            f"budget Rp{preference.budget:,}",
            f"baterai minimal {preference.min_battery_hours} jam",
        ]
        if preference.water_resistance != "none":
            water_label = {
                "basic": "rating anti keringat (air IPX4+)",
                "sport": "rating olahraga (air IPX5+ atau tahan debu IP54+)",
            }.get(preference.water_resistance, preference.water_resistance)
            constraint_parts.append(water_label)

        return {
            "total_ditemukan": 0,
            "total_ditampilkan": 0,
            "recommendations": [],
            "pesan": (
                "Tidak ada produk yang sesuai dengan "
                + ", ".join(constraint_parts) + "."
            )
        }

    # Urut by cosine mentah (bukan display_score yang sudah dibulatkan).
    # Tie-breaker dibuat lengkap agar hasil tidak bergantung pada urutan MongoDB.
    candidates.sort(
        key=lambda x: (
            -x["_cosine_raw"],
            x["harga"],
            str(x["brand"]).casefold(),
            str(x["nama"]).casefold(),
            str(x["id"]),
        )
    )

    top_recommendations = []
    for item in candidates[:top_n]:
        item.pop("_cosine_raw", None)
        top_recommendations.append(item)

    return {
        "total_ditemukan": len(candidates),
        "total_ditampilkan": len(top_recommendations),
        "recommendations": top_recommendations,
    }
