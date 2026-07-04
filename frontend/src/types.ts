export type Detection = {
  id?: string;
  person_id: string | null;
  person_name: string;
  camera_name: string | null;
  detected_at: string | null;
  confidence: number;
};

export type AttendanceRow = Detection & {
  image_url?: string | null;
};

export type PersonSummary = {
  id: string;
  name: string;
  appearance_count: number;
  last_seen: string | null;
  created_at: string;
  total_images: number;
  primary_image: string | null;
};

export type PersonImage = {
  id?: string;
  image_path: string;
  image_number: number;
};

export type PersonDetails = {
  person: PersonSummary;
  images: PersonImage[];
};