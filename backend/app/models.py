from pydantic import BaseModel, Field
from typing import Literal, Optional


class TWSModel(BaseModel):
    nama: str
    brand: str
    harga: int = Field(gt=0)
    karakter_suara: Literal["bass", "treble", "balance"]
    battery_hours: float = Field(gt=0)
    anc: bool
    gaming: bool

    bluetooth_version: Optional[str] = None
    codec: Optional[str] = None
    water_resistance: Optional[str] = None
    driver_size: Optional[str] = None
    mic_count: Optional[int] = None
    charging_port: Optional[str] = None
    deskripsi: Optional[str] = None
    image_url: Optional[str] = None


class UserPreferenceModel(BaseModel):
    karakter_suara: Literal["bass", "treble", "balance"]
    min_battery_hours: float = Field(ge=0)
    anc: bool
    gaming: bool
    budget: int = Field(gt=0)
    water_resistance: Literal["none", "basic", "sport"] = "none"
