import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { Header } from "@/components/Header";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { useProfile, useRound } from "@/hooks/useGolfData";
import { useRoundReviewTargets, useUpsertRoundReview } from "@/hooks/useReputation";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReviewDraft {
  rating: number;
  comment: string;
}

export default function RoundReviews() {
  const { id: roundId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: profile } = useProfile();
  const { data: round, isLoading: roundLoading } = useRound(roundId);
  const { data: targets = [], isLoading: targetsLoading } = useRoundReviewTargets(roundId);
  const upsertReview = useUpsertRoundReview();
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({});

  useEffect(() => {
    if (targets.length === 0) return;
    setDrafts((previous) => {
      const next = { ...previous };
      targets.forEach((target) => {
        if (!next[target.profileId]) {
          next[target.profileId] = {
            rating: target.existingRating ?? 5,
            comment: target.existingComment ?? "",
          };
        }
      });
      return next;
    });
  }, [targets]);

  const hasJoined = useMemo(() => {
    if (!profile || !round) return false;
    return round.players.some((player) => player.id === profile.id);
  }, [profile, round]);

  const canReview = !!profile && !!round && hasJoined && round.status === "completed";

  const updateDraft = (profileId: string, patch: Partial<ReviewDraft>) => {
    setDrafts((previous) => ({
      ...previous,
      [profileId]: {
        rating: patch.rating ?? previous[profileId]?.rating ?? 5,
        comment: patch.comment ?? previous[profileId]?.comment ?? "",
      },
    }));
  };

  const saveReview = async (reviewedUserId: string) => {
    if (!profile || !roundId) return;
    const draft = drafts[reviewedUserId];
    if (!draft || draft.rating < 1 || draft.rating > 5) {
      toast.error(t("roundReview.invalidRating"));
      return;
    }

    try {
      await upsertReview.mutateAsync({
        roundId,
        reviewerId: profile.id,
        reviewedUserId,
        rating: draft.rating,
        comment: draft.comment,
      });
      toast.success(t("roundReview.saveSuccess"));
    } catch (err: any) {
      toast.error(t("roundReview.saveFailed"), { description: err.message });
    }
  };

  if (roundLoading || targetsLoading) {
    return (
      <div className="screen-content">
        <Header title={t("roundReview.title")} showBack />
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="screen-content">
        <Header title={t("roundReview.title")} showBack />
        <div className="golf-card text-center py-10">
          <p className="font-medium text-foreground">{t("roundReview.notAllowedTitle")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("roundReview.notAllowedHint")}</p>
          <button onClick={() => navigate(-1)} className="btn-golf-primary mt-4">
            {t("roundReview.backToRound")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-content">
      <Header title={t("roundReview.title")} subtitle={t("roundReview.subtitle")} showBack />

      {targets.length === 0 ? (
        <div className="golf-card text-center py-10">
          <p className="font-medium text-foreground">{t("roundReview.noTargetsTitle")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("roundReview.noTargetsHint")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {targets.map((target) => {
            const draft = drafts[target.profileId] ?? { rating: target.existingRating ?? 5, comment: target.existingComment ?? "" };
            return (
              <div key={target.profileId} className="golf-card">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar name={target.name} avatarUrl={target.avatarUrl || undefined} size="md" />
                    <div>
                      <p className="font-semibold text-foreground">{target.name}</p>
                      {target.existingReviewId && (
                        <p className="text-xs text-muted-foreground">{t("roundReview.alreadyReviewed")}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">{t("roundReview.ratingLabel")}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateDraft(target.profileId, { rating: value })}
                        className={cn(
                          "w-9 h-9 rounded-lg border flex items-center justify-center transition-colors",
                          draft.rating >= value
                            ? "bg-amber-500/15 border-amber-400 text-amber-500"
                            : "bg-card border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Star size={14} className={draft.rating >= value ? "fill-amber-400 text-amber-400" : ""} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">{t("roundReview.commentLabel")}</p>
                  <textarea
                    value={draft.comment}
                    onChange={(event) => updateDraft(target.profileId, { comment: event.target.value })}
                    placeholder={t("roundReview.commentPlaceholder")}
                    className="golf-input min-h-[90px] resize-none"
                    maxLength={300}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => saveReview(target.profileId)}
                  disabled={upsertReview.isPending}
                  className="btn-golf-primary w-full disabled:opacity-50"
                >
                  {upsertReview.isPending ? t("roundReview.saving") : t("roundReview.save")}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
