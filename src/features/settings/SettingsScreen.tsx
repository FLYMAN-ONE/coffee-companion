import { useRef, type ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { Segmented } from "../../components/ui/Segmented";
import { languages, useI18n } from "../../i18n";
import { useBackup } from "../log/useBackup";
import { PALETTES } from "./palettes";
import { useSettings } from "./settingsStore";

export function SettingsScreen() {
  const { t, lang, setLang } = useI18n();
  const { sound, setSound, palette, setPalette } = useSettings();
  const { exportBackup, importBackup } = useBackup();
  const file = useRef<HTMLInputElement>(null);

  return (
    <div className="flex max-w-[640px] flex-col gap-4">
      <h1 className="mb-1.5 text-[30px] font-bold tracking-tight">{t.settings.title}</h1>
      <Row title={t.settings.language} hint={t.settings.languageHint}>
        <Segmented label={t.settings.language} value={lang} options={languages} onChange={setLang} />
      </Row>
      <Row title={t.settings.palette} hint={t.settings.paletteHint}>
        <div role="radiogroup" aria-label={t.settings.palette} className="flex gap-2">
          {PALETTES.map((p) => {
            const on = p.id === palette;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPalette(p.id)}
                className={`press flex h-14 items-center gap-3 rounded-2xl px-4 text-sm font-semibold ${
                  on
                    ? "bg-raised text-ink shadow-[inset_0_0_0_2px_var(--color-accent)]"
                    : "bg-raised text-mute"
                }`}
              >
                <span className="flex -space-x-1.5" aria-hidden="true">
                  {p.swatches.map((c) => (
                    <i
                      key={c}
                      className="h-5 w-5 rounded-full shadow-[0_0_0_2px_var(--color-raised)]"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                {t.settings.palettes[p.id]}
              </button>
            );
          })}
        </div>
      </Row>
      <Row title={t.settings.sound} hint={t.settings.soundHint}>
        <Segmented
          label={t.settings.sound}
          value={sound ? "on" : "off"}
          options={[
            { id: "on", label: t.settings.on },
            { id: "off", label: t.settings.off },
          ]}
          onChange={(v) => setSound(v === "on")}
        />
      </Row>
      <Row title={t.settings.backup} hint={t.settings.backupHint}>
        <Button icon="download" onClick={exportBackup}>
          {t.settings.export}
        </Button>
        <Button icon="upload" onClick={() => file.current?.click()}>
          {t.settings.import}
        </Button>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) importBackup(await f.text());
            e.target.value = "";
          }}
        />
      </Row>
    </div>
  );
}

function Row({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-[22px] bg-surface px-5 py-[18px]">
      <div className="flex-1">
        <b className="block text-base">{title}</b>
        <span className="text-[13px] text-mute">{hint}</span>
      </div>
      {children}
    </div>
  );
}
