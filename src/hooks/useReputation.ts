import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/hooks/useGolfData";
import {
  fetchProfileReputationKpis,
  fetchProfileReviews,
  fetchRoundReviewTargets,
  upsertRoundReview,
} from "@/services/reputationService";

export function useProfileReputation(profileId?: string) {
  const { data: currentProfile } = useProfile();
  const targetProfileId = profileId ?? currentProfile?.id;

  return useQuery({
    queryKey: ["profile-reputation", targetProfileId],
    queryFn: () => fetchProfileReputationKpis(targetProfileId!),
    enabled: !!targetProfileId,
  });
}

export function useProfileReviews(profileId?: string) {
  const { data: currentProfile } = useProfile();
  const targetProfileId = profileId ?? currentProfile?.id;

  return useQuery({
    queryKey: ["profile-reviews", targetProfileId],
    queryFn: () => fetchProfileReviews(targetProfileId!),
    enabled: !!targetProfileId,
  });
}

export function useRoundReviewTargets(roundId: string | undefined) {
  const { data: currentProfile } = useProfile();

  return useQuery({
    queryKey: ["round-review-targets", roundId, currentProfile?.id],
    queryFn: () => fetchRoundReviewTargets(roundId!, currentProfile!.id),
    enabled: !!roundId && !!currentProfile?.id,
  });
}

export function useUpsertRoundReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertRoundReview,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["round-review-targets", variables.roundId] });
      queryClient.invalidateQueries({ queryKey: ["profile-reputation", variables.reviewedUserId] });
      queryClient.invalidateQueries({ queryKey: ["profile-reviews", variables.reviewedUserId] });
    },
  });
}
