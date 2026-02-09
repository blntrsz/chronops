import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  getQuestionerInstanceById,
  getQuestionerTemplateById,
  listQuestionerInstances,
  submitQuestionerInstance,
  updateQuestionerInstance,
} from "@/features/questioner/_atom";
import { OrgListLayout } from "@/widgets/layout/org-list-layout";
import { useAppHeaderSlots } from "@/widgets/header/app-header-slots";
import { Result, useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";

function InstanceSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export const Route = createFileRoute("/org/$slug/assessment/questioner-instance/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const inst = useAtomValue(getQuestionerInstanceById(id as never));
  const instModel = Result.getOrElse(inst, () => null);
  const templateId = instModel?.templateId;
  const template = useAtomValue(getQuestionerTemplateById(templateId ?? ("" as never)));
  const templateModel = Result.getOrElse(template, () => null);
  const mutate = useAtomSet(updateQuestionerInstance(), { mode: "promise" });
  const submit = useAtomSet(submitQuestionerInstance(), { mode: "promise" });
  const refreshDetail = useAtomRefresh(getQuestionerInstanceById(id as never));
  const refreshList = useAtomRefresh(listQuestionerInstances(1));

  const [name, setName] = React.useState(instModel?.name ?? "");
  const [responses, setResponses] = React.useState<Record<string, unknown>>({});
  const [pending, setPending] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!instModel) return;
    setName(instModel.name ?? "");
    const initial: Record<string, unknown> = {};
    (instModel.responses ?? []).forEach((resp) => {
      initial[resp.questionId] = resp.value;
    });
    setResponses(initial);
  }, [instModel]);

  const isSubmitted = instModel?.workflowStatus === "submitted";

  const headerRight = React.useMemo(
    () => <div className="text-xs text-muted-foreground">{instModel?.workflowStatus ?? ""}</div>,
    [instModel],
  );

  useAppHeaderSlots({ right: headerRight }, [headerRight]);

  if (inst._tag === "Initial") {
    return <InstanceSkeleton />;
  }

  if (Result.isFailure(inst)) {
    return <FieldDescription>Failed loading instance</FieldDescription>;
  }

  if (!instModel) {
    return <FieldDescription>Instance not found</FieldDescription>;
  }

  if (!templateId) {
    return <FieldDescription>Template not found</FieldDescription>;
  }

  if (template._tag === "Initial") {
    return <InstanceSkeleton />;
  }

  if (Result.isFailure(template)) {
    return <FieldDescription>Failed loading template</FieldDescription>;
  }

  if (!templateModel) {
    return <FieldDescription>Template not found</FieldDescription>;
  }

  const questions = templateModel.questions ?? [];

  async function onSaveName() {
    if (!instModel) return;
    if (name.trim() === instModel.name) return;
    await mutate({
      payload: {
        id: instModel.id as never,
        data: {
          name: name.trim(),
        },
      },
    });
    refreshDetail();
    refreshList();
  }

  async function onSubmit() {
    if (!instModel || isSubmitted) return;
    setFormError(null);

    const requiredMissing = questions.find((q) => {
      if (!q.required) return false;
      const value = responses[q.id];
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === "boolean") return false;
      if (typeof value === "number") return Number.isNaN(value);
      return value === undefined || value === null || value === "";
    });
    if (requiredMissing) {
      setFormError("Answer all required questions");
      return;
    }

    const payloadResponses = questions.map((q) => {
      const value = responses[q.id];
      if (q.type === "number") {
        return {
          questionId: q.id,
          type: q.type,
          value: typeof value === "number" ? value : value === "" ? null : Number(value),
        };
      }
      if (q.type === "multiselect") {
        return {
          questionId: q.id,
          type: q.type,
          value: Array.isArray(value) ? value : [],
        };
      }
      if (q.type === "boolean") {
        return {
          questionId: q.id,
          type: q.type,
          value: Boolean(value),
        };
      }
      return {
        questionId: q.id,
        type: q.type,
        value: typeof value === "string" ? value : value ? String(value) : null,
      };
    });

    setPending(true);
    try {
      await mutate({
        payload: {
          id: instModel.id as never,
          data: { responses: payloadResponses, workflowStatus: "active" },
        },
      });
      await submit({ payload: { id: instModel.id as never } });
      refreshDetail();
      refreshList();
    } finally {
      setPending(false);
    }
  }

  return (
    <OrgListLayout
      title="Questioner instance"
      action={
        <Button type="button" onClick={onSubmit} disabled={pending || isSubmitted}>
          {isSubmitted ? "Submitted" : "Submit"}
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={onSaveName}
          className="h-auto w-full min-w-0 p-0 text-2xl font-semibold focus-visible:ring-0"
          disabled={isSubmitted}
        />

        {questions.length === 0 ? (
          <FieldDescription>No questions found for this template</FieldDescription>
        ) : (
          <div className="flex flex-col gap-4">
            {questions.map((q) => (
              <div key={q.id} className="rounded-lg border p-4 space-y-2">
                <div className="text-sm font-medium">
                  {q.prompt}
                  {q.required ? <span className="text-destructive"> *</span> : null}
                </div>
                {q.helpText ? (
                  <div className="text-xs text-muted-foreground">{q.helpText}</div>
                ) : null}

                {q.type === "textarea" ? (
                  <Textarea
                    value={(responses[q.id] as string) ?? ""}
                    onChange={(e) => setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder={q.placeholder ?? ""}
                    disabled={isSubmitted}
                  />
                ) : q.type === "select" ? (
                  <NativeSelect
                    value={(responses[q.id] as string) ?? ""}
                    onChange={(e) => setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    disabled={isSubmitted}
                  >
                    <option value="">Select...</option>
                    {(q.options ?? []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </NativeSelect>
                ) : q.type === "multiselect" ? (
                  <div className="grid gap-2">
                    {(q.options ?? []).map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={
                            Array.isArray(responses[q.id])
                              ? (responses[q.id] as string[]).includes(opt)
                              : false
                          }
                          onCheckedChange={(checked) => {
                            const current = Array.isArray(responses[q.id])
                              ? (responses[q.id] as string[])
                              : [];
                            const next =
                              checked === true
                                ? [...current, opt]
                                : current.filter((item) => item !== opt);
                            setResponses((prev) => ({ ...prev, [q.id]: next }));
                          }}
                          disabled={isSubmitted}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : q.type === "boolean" ? (
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={Boolean(responses[q.id])}
                      onCheckedChange={(checked) =>
                        setResponses((prev) => ({ ...prev, [q.id]: checked === true }))
                      }
                      disabled={isSubmitted}
                    />
                    {q.placeholder ?? "Yes"}
                  </label>
                ) : (
                  <Input
                    type={q.type === "number" ? "number" : q.type === "date" ? "date" : "text"}
                    value={(responses[q.id] as string) ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setResponses((prev) => ({
                        ...prev,
                        [q.id]: q.type === "number" ? (raw === "" ? null : Number(raw)) : raw,
                      }));
                    }}
                    placeholder={q.placeholder ?? ""}
                    disabled={isSubmitted}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {formError ? <div className="text-sm text-destructive">{formError}</div> : null}
      </div>
    </OrgListLayout>
  );
}
