export type KarakterSuara = "bass" | "treble" | "balance";

export type Product = {
  _id?: string;
  id?: string;
  nama: string;
  brand: string;
  harga: number;
  image_url?: string;
  karakter_suara: KarakterSuara;
  battery_hours: number;
  anc: boolean;
  gaming: boolean;
  bluetooth_version?: string;
  codec?: string;
  water_resistance?: string;
  driver_size?: string;
  mic_count?: number;
  charging_port?: string;
  deskripsi?: string;
};
