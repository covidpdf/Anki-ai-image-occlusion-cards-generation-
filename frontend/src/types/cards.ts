/**
 * Card generation types
 */

export interface OcclusionRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
}

export interface CardContent {
  front: string;
  back: string;
}

export interface GeneratedCard {
  content: CardContent;
  confidence: number;
  model_used: string;
  reasoning?: string;
}

export interface CardGenerationResponse {
  cards: GeneratedCard[];
  ocr_text_summary?: string;
  total_confidence: number;
}

export interface CardGenerationRequest {
  ocr_text: string;
  occlusions: OcclusionRegion[];
  user_prompt?: string;
  card_type?: 'cloze' | 'qa';
}

export interface CardReviewRequest {
  card_id: string;
  approved: boolean;
  corrections?: string;
  notes?: string;
}
