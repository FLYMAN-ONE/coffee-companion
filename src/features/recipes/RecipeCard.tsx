import { useI18n } from "../../i18n";
import { fmtTime } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { GlassCard } from "../../components/ui/GlassCard";
import { Icon } from "../../components/ui/Icon";
import { calculateCoffee } from "../brew-calculator/logic/calculations";
import type { Recipe } from "../../types";

interface RecipeCardProps {
  recipe: Recipe;
  onBrew: () => void;
  onOpen: () => void;
  onEdit: () => void;
  onFavorite: () => void;
}

export function RecipeCard({ recipe, onBrew, onOpen, onEdit, onFavorite }: RecipeCardProps) {
  const { t } = useI18n();
  const totalSec = recipe.steps.reduce((sum, s) => sum + s.seconds, 0);
  const coffee = calculateCoffee(recipe.water, recipe.dose);

  return (
    <GlassCard className="flex flex-col gap-4 !p-5">
      <div className="flex items-start justify-between gap-3">
        <button className="min-w-0 flex-1 text-left" onClick={onOpen}>
          <div className="text-sm text-accent">{t.methods[recipe.method]}</div>
          <div className="truncate text-2xl font-semibold">{recipe.name}</div>
        </button>
        <button
          onClick={onFavorite}
          aria-label={recipe.favorite ? t.recipes.removeFav : t.recipes.addFav}
          aria-pressed={recipe.favorite}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl active:bg-soft"
        >
          <Icon
            name="heart"
            filled={recipe.favorite}
            className={`h-6 w-6 ${recipe.favorite ? "text-accent" : "text-mute"}`}
          />
        </button>
      </div>

      <button onClick={onOpen} className="grid grid-cols-4 gap-2 text-left">
        {[
          [`${coffee}`, t.recipes.gCoffee],
          [`${recipe.water}`, t.recipes.mlWater],
          [`${recipe.tempC}°`, t.recipes.temp],
          [totalSec ? fmtTime(totalSec) : "—", t.recipes.time],
        ].map(([v, l]) => (
          <div key={l} className="rounded-2xl bg-soft px-3 py-2">
            <div className="tabular text-xl font-semibold">{v}</div>
            <div className="text-xs text-mute">{l}</div>
          </div>
        ))}
      </button>

      <div className="mt-auto flex gap-3">
        <Button variant="primary" icon="play" className="flex-1" onClick={onBrew}>
          {t.recipes.brew}
        </Button>
        <Button size="icon" icon="edit" onClick={onEdit} aria-label={t.recipes.editAria} />
      </div>
    </GlassCard>
  );
}
