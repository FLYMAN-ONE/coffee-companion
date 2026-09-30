import { useEffect, useState } from "react";
import { useApp } from "../../app/store";
import { getMethod, methods } from "../../data/methods";
import { fmtTime } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { calculateCoffee } from "../brew-calculator/logic/calculations";
import { RecipeCard } from "./RecipeCard";
import { RecipeEditor, blankRecipe } from "./RecipeEditor";
import type { MethodId, Recipe } from "../../types";

export function Recipes() {
  const {
    recipes, saveRecipe, deleteRecipe, toggleFavorite,
    recipeDraft, setRecipeDraft, applyRecipe, toast,
  } = useApp();

  const [editing, setEditing] = useState<Recipe | null>(null);
  const [viewing, setViewing] = useState<Recipe | null>(null);
  const [filter, setFilter] = useState<MethodId | "fav" | "all">("all");

  // A draft coming from the calculator opens straight in the editor.
  useEffect(() => {
    if (recipeDraft) {
      setEditing(recipeDraft);
      setRecipeDraft(null);
    }
  }, [recipeDraft, setRecipeDraft]);

  const usedMethods = methods.filter((m) => recipes.some((r) => r.method === m.id));
  const visible = recipes
    .filter((r) => (filter === "all" ? true : filter === "fav" ? r.favorite : r.method === filter))
    .sort((a, b) => Number(b.favorite) - Number(a.favorite));

  const isNew = editing ? !recipes.some((r) => r.id === editing.id) : false;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Recipes"
        subtitle={`${recipes.length} saved`}
        actions={
          <Button variant="primary" icon="plus" onClick={() => setEditing(blankRecipe())}>
            New recipe
          </Button>
        }
      />

      <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 py-1">
        <Chip selected={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
        <Chip selected={filter === "fav"} onClick={() => setFilter("fav")}>Favorites</Chip>
        {usedMethods.map((m) => (
          <Chip key={m.id} selected={filter === m.id} onClick={() => setFilter(m.id)}>
            {m.label}
          </Chip>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-line py-20 text-center text-lg text-mute">
          Nothing here yet.
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
              onEdit={() => setEditing(r)}
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
                  toast("Loaded into the calculator");
                  setViewing(null);
                }}
              >
                Open in calculator
              </Button>
              <Button
                variant="primary"
                icon="play"
                onClick={() => {
                  applyRecipe(viewing, "timer");
                  setViewing(null);
                }}
              >
                Brew
              </Button>
            </>
          }
        >
          <div className="mb-5 text-accent">{getMethod(viewing.method).label}</div>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              [`${viewing.dose} g/L`, "dose"],
              [`${calculateCoffee(viewing.water, viewing.dose)} g`, "coffee"],
              [`${viewing.water} ml`, "water"],
              [`${viewing.tempC}°C`, "temperature"],
              [viewing.grind, "grind"],
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
            <p className="text-mute">No timer steps. The timer runs as a stopwatch.</p>
          )}
        </Modal>
      ) : null}

      {editing ? (
        <RecipeEditor
          key={editing.id}
          recipe={editing}
          isNew={isNew}
          onClose={() => setEditing(null)}
          onSave={(r) => {
            saveRecipe(r);
            setEditing(null);
            toast("Recipe saved");
          }}
          onDelete={() => {
            deleteRecipe(editing.id);
            setEditing(null);
            toast("Recipe deleted");
          }}
        />
      ) : null}
    </div>
  );
}
