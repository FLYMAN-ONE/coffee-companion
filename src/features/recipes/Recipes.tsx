import { useState } from "react";
import { useToast } from "../../app/toast";
import { useApplyRecipe } from "../../app/useApplyRecipe";
import { newRecipe } from "../../data/factories";
import { methods } from "../../data/methods";
import { useI18n } from "../../i18n";
import { fmtTime } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { calculateCoffee } from "../brew-calculator/logic/calculations";
import { RecipeCard } from "./RecipeCard";
import { RecipeEditor } from "./RecipeEditor";
import { useRecipes } from "./recipesStore";
import type { MethodId, Recipe } from "../../types";

export function Recipes() {
  const { recipes, saveRecipe, deleteRecipe, toggleFavorite, editing, openEditor, closeEditor } =
    useRecipes();
  const applyRecipe = useApplyRecipe();
  const toast = useToast();

  const { t } = useI18n();
  const [viewing, setViewing] = useState<Recipe | null>(null);
  const [filter, setFilter] = useState<MethodId | "fav" | "all">("all");

  const usedMethods = methods.filter((m) => recipes.some((r) => r.method === m.id));
  const visible = recipes
    .filter((r) => (filter === "all" ? true : filter === "fav" ? r.favorite : r.method === filter))
    .sort((a, b) => Number(b.favorite) - Number(a.favorite));

  const isNew = editing ? !recipes.some((r) => r.id === editing.id) : false;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t.recipes.title}
        subtitle={t.recipes.saved(recipes.length)}
        actions={
          <Button variant="primary" icon="plus" onClick={() => openEditor(newRecipe())}>
            {t.recipes.newRecipe}
          </Button>
        }
      />

      <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 py-1">
        <Chip selected={filter === "all"} onClick={() => setFilter("all")}>
          {t.recipes.all}
        </Chip>
        <Chip selected={filter === "fav"} onClick={() => setFilter("fav")}>
          {t.recipes.favorites}
        </Chip>
        {usedMethods.map((m) => (
          <Chip key={m.id} selected={filter === m.id} onClick={() => setFilter(m.id)}>
            {t.methods[m.id]}
          </Chip>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-line py-20 text-center text-lg text-mute">
          {t.recipes.empty}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              onBrew={() => {
                applyRecipe(r, "timer");
              }}
              onOpen={() => setViewing(r)}
              onEdit={() => openEditor(r)}
              onFavorite={() => toggleFavorite(r.id)}
            />
          ))}
        </div>
      )}

      {viewing ? (
        <Modal
          title={viewing.name}
          onClose={() => setViewing(null)}
          footer={
            <>
              <Button
                onClick={() => {
                  applyRecipe(viewing, "brew");
                  toast(t.recipes.loaded);
                  setViewing(null);
                }}
              >
                {t.recipes.openInCalc}
              </Button>
              <Button
                variant="primary"
                icon="play"
                onClick={() => {
                  applyRecipe(viewing, "timer");
                  setViewing(null);
                }}
              >
                {t.recipes.brew}
              </Button>
            </>
          }
        >
          <div className="mb-5 text-accent">{t.methods[viewing.method]}</div>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              [`${viewing.dose} g/L`, t.recipes.dose],
              [`${calculateCoffee(viewing.water, viewing.dose)} g`, t.recipes.coffee],
              [`${viewing.water} ml`, t.recipes.water],
              [`${viewing.tempC}°C`, t.recipes.temperature],
              [t.grinds[viewing.grind], t.recipes.grind],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-soft px-4 py-3">
                <div className="text-lg font-semibold">{v}</div>
                <div className="text-sm text-mute">{l}</div>
              </div>
            ))}
          </div>
          {viewing.notes ? <p className="mb-6 text-lg leading-relaxed text-ink/90">{viewing.notes}</p> : null}
          {viewing.steps.length ? (
            <ol className="flex flex-col gap-2">
              {viewing.steps.map((s, i) => (
                <li key={s.id} className="flex items-center gap-4 rounded-2xl bg-soft px-4 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-lg">{s.label}</span>
                  <span className="tabular text-mute">
                    {Math.round((s.waterPct / 100) * viewing.water)} ml · {fmtTime(s.seconds)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-mute">{t.recipes.noStepsView}</p>
          )}
        </Modal>
      ) : null}

      {editing ? (
        <RecipeEditor
          key={editing.id}
          recipe={editing}
          isNew={isNew}
          onClose={closeEditor}
          onSave={(r) => {
            saveRecipe(r);
            closeEditor();
            toast(t.recipes.toastSaved);
          }}
          onDelete={() => {
            deleteRecipe(editing.id);
            closeEditor();
            toast(t.recipes.toastDeleted);
          }}
        />
      ) : null}
    </div>
  );
}
