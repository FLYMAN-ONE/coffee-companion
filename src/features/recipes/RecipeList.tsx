import type { ReactNode } from "react";
import { Icon } from "../../components/ui/Icon";
import { useI18n } from "../../i18n";
import { fmtTime } from "../../lib/format";
import type { Recipe } from "../../types";
import { totalSeconds } from "./logic/recipe";
import { useRecipes } from "./recipesStore";

interface RecipeListProps {
  /** Selected recipe id; null selects the "Free" row when it is shown. */
  selectedId: string | null;
  onPick: (r: Recipe | null) => void;
  /** Show the "Free" row (doses and stopwatch) at the bottom. */
  withFree?: boolean;
  footer?: ReactNode;
}

/** Favorites first, then all recipes; full names, method icon, duration and water. */
export function RecipeList({ selectedId, onPick, withFree = false, footer }: RecipeListProps) {
  const { recipes } = useRecipes();
  const { t } = useI18n();
  const favorites = recipes.filter((r) => r.favorite);
  const rest = recipes.filter((r) => !r.favorite);

  const row = (
    key: string,
    selected: boolean,
    icon: Recipe["method"],
    title: string,
    sub: string,
    onClick: () => void
  ) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`press flex items-center gap-3 rounded-[20px] p-2.5 text-left ${selected ? "bg-raised" : ""}`}
    >
      <span
        className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[14px] transition-colors duration-200 ${
          selected ? "bg-sage/14 text-sage" : "bg-raised text-mute"
        }`}
      >
        <Icon name={icon} className="h-[22px] w-[22px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15.5px] leading-tight font-semibold">{title}</span>
        <span className="num mt-0.5 block text-[12.5px] tracking-normal text-mute">{sub}</span>
      </span>
    </button>
  );

  const recipeRow = (r: Recipe) =>
    row(
      r.id,
      r.id === selectedId,
      r.method,
      r.name,
      `${r.steps.length ? fmtTime(totalSeconds(r)) : t.prepare.noTimer} · ${r.water} ml`,
      () => onPick(r)
    );

  return (
    <nav className="no-scrollbar flex flex-col overflow-y-auto rounded-[28px] bg-surface px-3 py-4.5">
      {favorites.length ? (
        <>
          <h3 className="eyebrow mx-2.5 mt-1.5 mb-2">{t.prepare.favorites}</h3>
          {favorites.map(recipeRow)}
        </>
      ) : null}
      <h3 className={`eyebrow mx-2.5 mb-2 ${favorites.length ? "mt-4.5" : "mt-1.5"}`}>{t.prepare.all}</h3>
      {rest.map(recipeRow)}
      {withFree ? (
        <>
          <h3 className="eyebrow mx-2.5 mt-4.5 mb-2">{t.prepare.noRecipe}</h3>
          {row("free", selectedId === null, "other", t.prepare.free, t.prepare.freeSub, () => onPick(null))}
        </>
      ) : null}
      {footer}
    </nav>
  );
}
