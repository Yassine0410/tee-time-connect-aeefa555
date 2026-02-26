import { supabase } from "@/integrations/supabase/client";
import type {
  PlayerReview,
  ProfileReputationKpis,
  RoundReviewTarget,
  UpsertReviewInput,
} from "@/types/reputation";

const DEFAULT_RELIABILITY_WINDOW = 20;

function isMissingColumnOrTableError(err: any) {
  if (!err?.message) return false;
  const message = String(err.message).toLowerCase();
  return message.includes("does not exist") || message.includes("column") || message.includes("relation");
}

export async function fetchProfileReputationKpis(
  profileId: string,
  reliabilityWindow = DEFAULT_RELIABILITY_WINDOW
): Promise<ProfileReputationKpis> {
  const base: ProfileReputationKpis = {
    roundsPlayed: 0,
    reliabilityPercent: null,
    reliabilitySampleSize: 0,
    averageRating: null,
    reviewsCount: 0,
  };

  const [
    completedRoundsResult,
    reliabilityResult,
    reviewsResult,
  ] = await Promise.all([
    supabase
      .from("round_players")
      .select("round_id, golf_rounds!inner(status)", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("golf_rounds.status", "completed"),
    supabase
      .from("round_players")
      .select("participation_status, joined_at, golf_rounds!inner(status)")
      .eq("profile_id", profileId)
      .in("participation_status", ["present", "no_show"])
      .eq("golf_rounds.status", "completed")
      .order("joined_at", { ascending: false })
      .limit(reliabilityWindow),
    supabase
      .from("reviews")
      .select("rating")
      .eq("reviewed_user_id", profileId),
  ]);

  if (completedRoundsResult.error && !isMissingColumnOrTableError(completedRoundsResult.error)) {
    throw completedRoundsResult.error;
  }
  if (reliabilityResult.error && !isMissingColumnOrTableError(reliabilityResult.error)) {
    throw reliabilityResult.error;
  }
  if (reviewsResult.error && !isMissingColumnOrTableError(reviewsResult.error)) {
    throw reviewsResult.error;
  }

  base.roundsPlayed = completedRoundsResult.count ?? 0;

  const attendanceRows = (reliabilityResult.data as Array<{ participation_status: "present" | "no_show" }> | null) ?? [];
  const presentCount = attendanceRows.filter((row) => row.participation_status === "present").length;
  const denominator = attendanceRows.length;
  base.reliabilitySampleSize = denominator;
  base.reliabilityPercent = denominator > 0 ? Math.round((presentCount / denominator) * 100) : null;

  const ratings = (reviewsResult.data as Array<{ rating: number }> | null)?.map((row) => row.rating) ?? [];
  if (ratings.length > 0) {
    const average = ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
    base.averageRating = Math.round(average * 10) / 10;
    base.reviewsCount = ratings.length;
  }

  return base;
}

export async function fetchProfileReviews(profileId: string): Promise<PlayerReview[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      round_id,
      rating,
      comment,
      created_at,
      reviewer:profiles!reviews_reviewer_id_fkey(id, name, avatar_url),
      round:golf_rounds!reviews_round_id_fkey(
        id,
        date,
        course:golf_courses!golf_rounds_course_id_fkey(name, location)
      )
    `)
    .eq("reviewed_user_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingColumnOrTableError(error)) return [];
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    roundId: row.round_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    reviewer: {
      id: row.reviewer?.id ?? "",
      name: row.reviewer?.name ?? "Unknown",
      avatarUrl: row.reviewer?.avatar_url ?? null,
    },
    round: row.round
      ? {
          id: row.round.id,
          date: row.round.date,
          courseName: row.round.course?.name ?? null,
          courseLocation: row.round.course?.location ?? null,
        }
      : null,
  }));
}

export async function fetchRoundReviewTargets(roundId: string, reviewerProfileId: string): Promise<RoundReviewTarget[]> {
  const [{ data: participants, error: participantsError }, { data: existingReviews, error: existingError }] =
    await Promise.all([
      supabase
        .from("round_players")
        .select("profile_id, profile:profiles!round_players_profile_id_fkey(id, name, avatar_url)")
        .eq("round_id", roundId),
      supabase
        .from("reviews")
        .select("id, reviewed_user_id, rating, comment")
        .eq("round_id", roundId)
        .eq("reviewer_id", reviewerProfileId),
    ]);

  if (participantsError) throw participantsError;
  if (existingError) {
    if (!isMissingColumnOrTableError(existingError)) throw existingError;
  }

  const existingByUser = new Map<string, { id: string; rating: number; comment: string | null }>();
  (existingReviews ?? []).forEach((review: any) => {
    existingByUser.set(review.reviewed_user_id, {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
    });
  });

  return (participants ?? [])
    .map((row: any) => row.profile)
    .filter((profile: any) => profile && profile.id !== reviewerProfileId)
    .map((profile: any) => {
      const existing = existingByUser.get(profile.id);
      return {
        profileId: profile.id,
        name: profile.name ?? "Unknown",
        avatarUrl: profile.avatar_url ?? null,
        existingReviewId: existing?.id ?? null,
        existingRating: existing?.rating ?? null,
        existingComment: existing?.comment ?? null,
      };
    });
}

export async function upsertRoundReview(input: UpsertReviewInput) {
  const payload = {
    round_id: input.roundId,
    reviewer_id: input.reviewerId,
    reviewed_user_id: input.reviewedUserId,
    rating: input.rating,
    comment: input.comment?.trim() ? input.comment.trim() : null,
  };

  const { data, error } = await supabase
    .from("reviews")
    .upsert(payload, { onConflict: "round_id,reviewer_id,reviewed_user_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export { DEFAULT_RELIABILITY_WINDOW };
