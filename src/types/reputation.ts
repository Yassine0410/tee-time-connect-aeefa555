export type ParticipationStatus = "joined" | "present" | "no_show" | "left";

export interface ProfileReputationKpis {
  roundsPlayed: number;
  reliabilityPercent: number | null;
  reliabilitySampleSize: number;
  averageRating: number | null;
  reviewsCount: number;
}

export interface ReviewSummary {
  averageRating: number | null;
  reviewsCount: number;
}

export interface ReviewAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface ReviewRoundInfo {
  id: string;
  date: string;
  courseName: string | null;
  courseLocation: string | null;
}

export interface PlayerReview {
  id: string;
  roundId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: ReviewAuthor;
  round: ReviewRoundInfo | null;
}

export interface RoundReviewTarget {
  profileId: string;
  name: string;
  avatarUrl: string | null;
  existingReviewId: string | null;
  existingRating: number | null;
  existingComment: string | null;
}

export interface UpsertReviewInput {
  roundId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment?: string | null;
}
