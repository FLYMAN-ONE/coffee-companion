import { useRef, type ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { Segmented } from "../../components/ui/Segmented";
import { languages, useI18n } from "../../i18n";
import { useBackup } from "../log/useBackup";
import { useSettings } from "./settingsStore";

export function SettingsScreen() {
  const { t, lang, setLang } = useI18n();
  const { sound, setSound } = useSettings();
  const { exportBackup, importBackup } = useBackup();
  const file = useRef<HTMLInputElement>(null);

  return (
    <div className="flex max-w-[640px] flex-col gap-4">
      <h1 className="mb-1.5 text-[30px] font-bold tracking-tight">{t.settings.title}</h1>
      <Row title={t.settings.language} hint={t.settings.languageHint}>
        <Segmented label={t.settings.language} value={lang} options={languages} onChange={setLang} />
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
