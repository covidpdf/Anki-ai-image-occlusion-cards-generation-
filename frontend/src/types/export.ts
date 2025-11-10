/** Types for the Anki export functionality */
export interface OcclusionMask {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageOcclusionCard {
  id: string;
  image_path?: string;
  image_data?: string;
  occlusions: OcclusionMask[];
  question?: string;
  answer?: string;
  tags: string[];
}

export interface DeckExportRequest {
  deck_name: string;
  deck_description?: string;
  cards: ImageOcclusionCard[];
  tags: string[];
}

export interface ExportResponse {
  success: boolean;
  message: string;
  deck_id?: string;
}

export interface ExportInfo {
  supported_formats: string[];
  model_id: number;
  features: string[];
  limitations: {
    max_cards_per_deck: number;
    max_image_size: string;
    supported_image_formats: string[];
  };
}