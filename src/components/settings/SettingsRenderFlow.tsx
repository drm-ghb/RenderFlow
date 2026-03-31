"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { patchUser, SettingRow, SectionHeader } from "./SettingsShared";

type BoolField =
  | "allowDirectStatusChange"
  | "allowClientComments"
  | "allowClientAcceptance"
  | "requireClientEmail"
  | "hideCommentCount"
  | "requirePinTitle"
  | "autoClosePinsOnAccept"
  | "autoArchiveOnAccept"
  | "notifyClientOnStatusChange"
  | "notifyClientOnReply"
  | "allowClientVersionRestore";

interface Props {
  initialAllowDirectStatusChange: boolean;
  initialAllowClientComments: boolean;
  initialAllowClientAcceptance: boolean;
  initialRequireClientEmail: boolean;
  initialHideCommentCount: boolean;
  initialRequirePinTitle: boolean;
  initialMaxPinsPerRender: number | null;
  initialAutoClosePinsOnAccept: boolean;
  initialAutoArchiveOnAccept: boolean;
  initialDefaultRenderStatus: string;
  initialDefaultRenderOrder: string;
  initialNotifyClientOnStatusChange: boolean;
  initialNotifyClientOnReply: boolean;
  initialAllowClientVersionRestore: boolean;
}

export function SettingsRenderFlow({
  initialAllowDirectStatusChange,
  initialAllowClientComments,
  initialAllowClientAcceptance,
  initialRequireClientEmail,
  initialHideCommentCount,
  initialRequirePinTitle,
  initialMaxPinsPerRender,
  initialAutoClosePinsOnAccept,
  initialAutoArchiveOnAccept,
  initialDefaultRenderStatus,
  initialDefaultRenderOrder,
  initialNotifyClientOnStatusChange,
  initialNotifyClientOnReply,
  initialAllowClientVersionRestore,
}: Props) {
  const [bools, setBools] = useState<Record<BoolField, boolean>>({
    allowDirectStatusChange: initialAllowDirectStatusChange,
    allowClientComments: initialAllowClientComments,
    allowClientAcceptance: initialAllowClientAcceptance,
    requireClientEmail: initialRequireClientEmail,
    hideCommentCount: initialHideCommentCount,
    requirePinTitle: initialRequirePinTitle,
    autoClosePinsOnAccept: initialAutoClosePinsOnAccept,
    autoArchiveOnAccept: initialAutoArchiveOnAccept,
    notifyClientOnStatusChange: initialNotifyClientOnStatusChange,
    notifyClientOnReply: initialNotifyClientOnReply,
    allowClientVersionRestore: initialAllowClientVersionRestore,
  });

  const [maxPins, setMaxPins] = useState<string>(initialMaxPinsPerRender?.toString() ?? "");
  const [defaultStatus, setDefaultStatus] = useState(initialDefaultRenderStatus);
  const [defaultOrder, setDefaultOrder] = useState(initialDefaultRenderOrder);

  async function toggleBool(field: BoolField) {
    const next = !bools[field];
    const res = await patchUser({ [field]: next });
    if (res.ok) { setBools((s) => ({ ...s, [field]: next })); toast.success("Zapisano"); }
    else toast.error("Błąd podczas zapisywania");
  }

  async function handleMaxPinsSave() {
    const val = maxPins === "" ? null : parseInt(maxPins, 10);
    if (maxPins !== "" && (isNaN(val as number) || (val as number) < 1)) {
      toast.error("Podaj liczbę większą od 0 lub pozostaw puste");
      return;
    }
    const res = await patchUser({ maxPinsPerRender: val });
    if (res.ok) toast.success("Zapisano");
    else toast.error("Błąd podczas zapisywania");
  }

  async function handleDefaultStatusChange(val: string) {
    setDefaultStatus(val);
    const res = await patchUser({ defaultRenderStatus: val });
    if (res.ok) toast.success("Zapisano");
    else toast.error("Błąd podczas zapisywania");
  }

  async function handleDefaultOrderChange(val: string) {
    setDefaultOrder(val);
    const res = await patchUser({ defaultRenderOrder: val });
    if (res.ok) toast.success("Zapisano");
    else toast.error("Błąd podczas zapisywania");
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">RenderFlow</h1>
        <p className="text-sm text-gray-500 mt-1">Ustawienia modułu wizualizacji i feedbacku</p>
      </div>

      {/* ── Uprawnienia klientów ── */}
      <section className="space-y-4">
        <SectionHeader title="Uprawnienia klientów" />
        <div className="bg-card border border-border rounded-2xl p-6 divide-y divide-border">
          <SettingRow
            label="Samodzielne cofanie akceptacji"
            description="Klient może bezpośrednio cofnąć status &quot;Zaakceptowany&quot; bez zatwierdzenia projektanta."
            checked={bools.allowDirectStatusChange}
            onToggle={() => toggleBool("allowDirectStatusChange")}
          />
          <SettingRow
            label="Komentowanie przez klienta"
            description="Klient może dodawać piny i komentarze do renderów."
            checked={bools.allowClientComments}
            onToggle={() => toggleBool("allowClientComments")}
          />
          <SettingRow
            label="Akceptacja przez klienta"
            description="Klient widzi przycisk &quot;Zaakceptuj&quot; i może samodzielnie zaakceptować render."
            checked={bools.allowClientAcceptance}
            onToggle={() => toggleBool("allowClientAcceptance")}
          />
          <SettingRow
            label="Wymagaj podania emaila przez klienta"
            description="Przed pierwszą wizytą klient podaje email (widoczny przy komentarzach)."
            checked={bools.requireClientEmail}
            onToggle={() => toggleBool("requireClientEmail")}
          />
          <SettingRow
            label="Ukryj licznik komentarzy"
            description="Klient nie widzi liczby pinów na liście renderów."
            checked={bools.hideCommentCount}
            onToggle={() => toggleBool("hideCommentCount")}
          />
          <SettingRow
            label="Samodzielne przywracanie wersji przez klienta"
            description="Klient może bezpośrednio przywrócić poprzednią wersję renderu."
            checked={bools.allowClientVersionRestore}
            onToggle={() => toggleBool("allowClientVersionRestore")}
          />
        </div>
      </section>

      {/* ── Komentarze i piny ── */}
      <section className="space-y-4">
        <SectionHeader title="Komentarze i piny" />
        <div className="bg-card border border-border rounded-2xl p-6 divide-y divide-border">
          <SettingRow
            label="Wymagaj tytułu pinu"
            description="Każdy pin musi mieć tytuł — pole &quot;Tytuł&quot; staje się obowiązkowe."
            checked={bools.requirePinTitle}
            onToggle={() => toggleBool("requirePinTitle")}
          />
          <SettingRow
            label="Automatyczne zamknięcie pinów przy akceptacji"
            description="Wszystkie otwarte piny zmieniają status na &quot;Gotowe&quot; gdy render zostanie zaakceptowany."
            checked={bools.autoClosePinsOnAccept}
            onToggle={() => toggleBool("autoClosePinsOnAccept")}
          />
          <SettingRow
            label="Automatyczne archiwizowanie przy akceptacji"
            description="Render jest archiwizowany po zaakceptowaniu przez klienta."
            checked={bools.autoArchiveOnAccept}
            onToggle={() => toggleBool("autoArchiveOnAccept")}
          />
          <div className="py-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Limit pinów na render</p>
                <p className="text-xs text-gray-400 mt-0.5">Maksymalna liczba pinów jaką klient może dodać. Zostaw puste aby nie ograniczać.</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Input
                  type="number"
                  min={1}
                  value={maxPins}
                  onChange={(e) => setMaxPins(e.target.value)}
                  placeholder="∞"
                  className="w-20 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleMaxPinsSave()}
                />
                <Button size="sm" onClick={handleMaxPinsSave} variant="outline">Zapisz</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Nowe rendery ── */}
      <section className="space-y-4">
        <SectionHeader title="Nowe rendery" />
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Domyślny status nowych renderów</p>
              <p className="text-xs text-gray-400 mt-0.5">Status przypisywany automatycznie przy dodawaniu nowego renderu.</p>
            </div>
            <div className="flex gap-1.5 bg-muted rounded-lg p-1 flex-shrink-0">
              {(["REVIEW", "ACCEPTED"] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleDefaultStatusChange(val)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    defaultStatus === val
                      ? val === "ACCEPTED" ? "bg-green-500 text-white shadow-sm" : "bg-blue-500 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {val === "REVIEW" ? "Do weryfikacji" : "Zaakceptowany"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Domyślna kolejność renderów</p>
              <p className="text-xs text-gray-400 mt-0.5">Sposób sortowania renderów na widoku klienta.</p>
            </div>
            <div className="flex gap-1.5 bg-muted rounded-lg p-1 flex-shrink-0">
              {([["order", "Ręczna"], ["name", "Nazwa"], ["newest", "Najnowsze"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleDefaultOrderChange(val)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    defaultOrder === val
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Powiadomienia klientów ── */}
      <section className="space-y-4">
        <SectionHeader title="Powiadomienia klientów" />
        <div className="bg-card border border-border rounded-2xl p-6 divide-y divide-border">
          <SettingRow
            label="Powiadamiaj klienta o zmianie statusu"
            description="Klient otrzymuje powiadomienie gdy projektant zmienia status renderu."
            checked={bools.notifyClientOnStatusChange}
            onToggle={() => toggleBool("notifyClientOnStatusChange")}
          />
          <SettingRow
            label="Powiadamiaj klienta o nowych odpowiedziach"
            description="Klient widzi toast gdy projektant odpowiada na jego komentarz."
            checked={bools.notifyClientOnReply}
            onToggle={() => toggleBool("notifyClientOnReply")}
          />
        </div>
      </section>
    </div>
  );
}
