import { useState } from "react";
import { useNavigation } from "../../app/navigation";
import { useToast } from "../../app/toast";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
import { newRecipe } from "../../data/factories";
import { useI18n } from "../../i18n";
import { fmtDec, fmtTime } from "../../lib/format";
import type { Recipe } from "../../types";
import { usePrepare } from "../prepare/prepareStore";
import { splitNotes } from "./logic/notes";
import { RecipeEditor } from "./RecipeEditor";
import { totalSeconds } from "./logic/recipe";
import { RecipeList } from "./RecipeList";
import { useRecipes } from "./recipesStore";

/** Recipes: list on the left, detail (or the inline editor) on the right. */
export function RecipesScreen() {
  const { recipes, saveRecipe, deleteRecipe, editing, openEditor, closeEditor } = useRecipes();
  const { pickRecipe } = usePrepare();
  const { go } = useNavigation();
  const toast = useToast();
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = recipes.find((r) => r.id === selectedId) ?? recipes[0] ?? null;
  const isNew = editing ? !recipes.some((r) => r.id === editing.id) : false;

  return (
    <div className="grid h-full grid-cols-[300px_minmax(0,1fr)] gap-6">
      <RecipeList
        selectedId={editing?.id ?? selected?.id ?? null}
        onPick={(r) => {
          closeEditor();
          if (r) setSelectedId(r.id);
        }}
        footer={
          <div className="px-1 pt-3.5 pb-1">
            <Button icon="plus" className="w-full" onClick={() => openEditor(newRecipe())}>
              {t.recipes.newRecipe}
            </Button>
          </div>
        }
      />
      <section className="no-scrollbar min-w-0 overflow-y-auto rounded-[28px] bg-surface px-8 py-7">
        {editing ? (
          <RecipeEditor
            key={editing.id}
            recipe={editing}
            isNew={isNew}
            onCancel={closeEditor}
            onSave={(r) => {
              saveRecipe(r);
              setSelectedId(r.id);
              closeEditor();
              toast(t.recipes.toastSaved);
            }}
            onDelete={() => {
              deleteRecipe(editing.id);
              setSelectedId(null);
              closeEditor();
              toast(t.recipes.toastDeleted);
            }}
          />
        ) : selected ? (
          <RecipeDetail
            recipe={selected}
            onEdit={() => openEditor(selected)}
            onBrew={() => {
              pickRecipe(selected);
              go("prepare");
            }}
          />
        ) : null}
      </section>
    </div>
  );
}

function RecipeDetail({
  recipe: r,
  onEdit,
  onBrew,
}: {
  recipe: Recipe;
  onEdit: () => void;
  onBrew: () => void;
}) {
  const { t, lang } = useI18n();
  const { points, source } = splitNotes(r.notes, t.recipes.sourcePrefixes);
  const pours = r.steps.map((s, i) => s.waterPct > (i ? r.steps[i - 1].waterPct : 0));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-sage/14 text-sage">
          <Icon name={r.method} className="h-[30px] w-[30px]" />
        </span>
        <div className="min-w-0 flex-1 pl-1.5">
          <h2 className="text-[28px] leading-tight font-bold tracking-tight">{r.name}</h2>
          <p className="mt-1 text-sm text-mute">
            {t.methods[r.method]} · {t.grinds[r.grind]} · <span className="num">{r.tempC} °C</span>
          </p>
        </div>
        <Button icon="edit" onClick={onEdit}>
          {t.common.edit}
        </Button>
        <Button variant="primary" icon="play" onClick={onBrew}>
          {t.recipes.brew}
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {[
          [`${fmtDec((r.water * r.dose) / 1000, 1, lang)} g`, t.recipes.coffee],
          [`1:${fmtDec(1000 / r.dose, 1, lang)}`, t.recipes.ratio],
          [`${r.water} ml`, t.recipes.water],
          [r.steps.length ? fmtTime(totalSeconds(r)) : "—", t.recipes.duration],
        ].map(([v, l]) => (
          <div key={l} className="rounded-[18px] bg-raised px-3.5 py-3">
            <b className="num block text-[22px] font-medium">{v}</b>
            <span className="text-[12.5px] text-mute">{l}</span>
          </div>
        ))}
      </div>

      {points.length ? (
        <div className="flex flex-col gap-2">
          <div className="eyebrow">{t.recipes.keyPoints}</div>
          <ul className="flex max-w-[62ch] flex-col gap-2 text-[15px] leading-relaxed text-[#ddd5c8]">
            {points.map((p, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-sage" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
          {source ? <p className="text-[12.5px] text-faint">{source}</p> : null}
        </div>
      ) : null}

      {r.steps.length ? (
        <div className="flex flex-col gap-2">
          <div className="eyebrow">{t.recipes.steps}</div>
          <ol className="flex flex-col gap-1.5">
            {r.steps.map((s, i) => (
              <li key={s.id} className="flex items-center gap-3.5 rounded-2xl bg-raised px-3.5 py-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sage/14 text-[13px] font-bold text-sage">
                  {i + 1}
                </span>
                <span className="flex-1 font-semibold">{s.label}</span>
                <span className="num text-water">
                  {pours[i] ? `${Math.round((s.waterPct / 100) * r.water)} ml` : ""}
                </span>
                <span className="num w-13 text-right text-mute">{fmtTime(s.seconds)}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p className="text-mute">{t.recipes.noSteps}</p>
      )}
    </div>
  );
}
