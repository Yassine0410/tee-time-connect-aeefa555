import { format, parseISO } from "date-fns";
import { MessageSquare, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { useProfile } from "@/hooks/useGolfData";
import { useProfileReputation, useProfileReviews } from "@/hooks/useReputation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Reviews() {
  const { data: profile } = useProfile();
  const { t, dateLocale } = useLanguage();
  const { data: reputation, isLoading: reputationLoading } = useProfileReputation(profile?.id);
  const { data: reviews = [], isLoading: reviewsLoading } = useProfileReviews(profile?.id);

  return (
    <div className="screen-content">
      <Header title={t("reviews.title")} subtitle={t("reviews.subtitle")} showBack />

      <div className="golf-card mb-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/35 p-3">
            <p className="text-xs text-muted-foreground">{t("reviews.averageLabel")}</p>
            <p className="text-2xl font-bold text-foreground">
              {reputationLoading
                ? "..."
                : reputation?.averageRating !== null
                ? `${reputation.averageRating.toFixed(1)} ★`
                : t("reviews.noRating")}
            </p>
          </div>
          <div className="rounded-xl bg-muted/35 p-3">
            <p className="text-xs text-muted-foreground">{t("reviews.totalLabel")}</p>
            <p className="text-2xl font-bold text-foreground">
              {reputationLoading ? "..." : reputation?.reviewsCount ?? 0}
            </p>
          </div>
        </div>
      </div>

      {reviewsLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="golf-card text-center py-10">
          <MessageSquare size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">{t("reviews.emptyTitle")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("reviews.emptyHint")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="golf-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <PlayerAvatar
                    name={review.reviewer.name || t("common.unknown")}
                    avatarUrl={review.reviewer.avatarUrl || undefined}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{review.reviewer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(review.createdAt), "PP", { locale: dateLocale })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={14}
                      className={
                        index < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                      }
                    />
                  ))}
                </div>
              </div>

              {review.round && (
                <p className="text-xs text-muted-foreground mt-3">
                  {t("reviews.roundMeta", {
                    course: review.round.courseName || t("common.unknown"),
                    date: format(parseISO(review.round.date), "PP", { locale: dateLocale }),
                  })}
                </p>
              )}

              {review.comment && <p className="text-sm text-foreground/90 mt-2">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
