import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  compact?: boolean;
  className?: string;
}

export function LanguageToggle({ compact = false, className }: LanguageToggleProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!compact && <span className="text-xs text-muted-foreground">{t("language.label")}</span>}
      <div className="inline-flex rounded-lg border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-medium transition-colors",
            language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage("fr")}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-medium transition-colors",
            language === "fr" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          FR
        </button>
      </div>
    </div>
  );
}
