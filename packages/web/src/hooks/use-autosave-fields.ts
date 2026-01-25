import React from "react";

type SaveStatus = "saved" | "saving" | "unsaved" | "invalid" | "error";

type UseAutosaveFieldsArgs = {
  id: string | null;
  name: string | null | undefined;
  description: string | null | undefined;
  onSave: (payload: { name: string; description: string | null }) => Promise<void>;
  onSaved?: () => void;
  debounceMs?: number;
};

export function useAutosaveFields({
  id,
  name,
  description,
  onSave,
  onSaved,
  debounceMs = 800,
}: UseAutosaveFieldsArgs) {
  const [valueName, setValueName] = React.useState("");
  const [valueDescription, setValueDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("saved");
  const saveCalledRef = React.useRef(0);
  const timerRef = React.useRef<number | null>(null);
  const lastIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    if (lastIdRef.current !== id) {
      lastIdRef.current = id;
      setValueName(name ?? "");
      setValueDescription(description ?? "");
      setSaveStatus("saved");
    }
  }, [id, name, description]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const dirty = id
    ? valueName !== (name ?? "") || valueDescription !== (description ?? "")
    : false;
  const isValid = valueName.trim() !== "";

  React.useEffect(() => {
    if (!dirty) {
      setSaveStatus("saved");
      return;
    }
    if (!isValid) {
      setSaveStatus("invalid");
      return;
    }

    setSaveStatus("unsaved");
    timerRef.current = window.setTimeout(async () => {
      const callId = ++saveCalledRef.current;
      setSaving(true);
      setSaveStatus("saving");
      try {
        const nextName = valueName.trim();
        const nextDescription = valueDescription.trim();
        await onSave({
          name: nextName,
          description: nextDescription === "" ? null : nextDescription,
        });
        if (callId === saveCalledRef.current) {
          onSaved?.();
          setSaveStatus("saved");
        }
      } catch {
        if (callId === saveCalledRef.current) setSaveStatus("error");
      } finally {
        if (callId === saveCalledRef.current) setSaving(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [dirty, isValid, valueName, valueDescription, onSave, onSaved, debounceMs]);

  const statusLabel = saving
    ? "Saving..."
    : saveStatus === "saved"
      ? "Saved"
      : saveStatus === "invalid"
        ? "Name required"
        : saveStatus === "error"
          ? "Save failed"
          : "Unsaved";

  return {
    name: valueName,
    setName: setValueName,
    description: valueDescription,
    setDescription: setValueDescription,
    saving,
    saveStatus,
    statusLabel,
    dirty,
    isValid,
  };
}
