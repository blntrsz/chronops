import { useActiveDialog, useSetActiveDialog } from "@/atoms/dialog-atom";
import { GhostInput, GhostTextArea } from "@/components/ghost-input";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { createQuestionerTemplate, listQuestionerTemplates } from "@/features/questioner/_atom";
import { cn } from "@/lib/utils";
import { QuestionerTemplate } from "@chronops/domain";
import { useAtomRefresh, useAtomSet } from "@effect-atom/atom-react";
import { Schema } from "effect";
import React from "react";

const QuestionDraftSchema = Schema.Struct({
  id: Schema.String,
  prompt: Schema.String,
  type: QuestionerTemplate.QuestionerQuestionType,
  required: Schema.optional(Schema.Boolean),
  options: Schema.optional(Schema.Array(Schema.String)),
  helpText: Schema.optional(Schema.String),
  placeholder: Schema.optional(Schema.String),
  optionsInput: Schema.optional(Schema.String),
});

const CreateTemplateSchema = Schema.Struct({
  name: Schema.String,
  description: Schema.NullOr(Schema.String),
  questions: Schema.Array(QuestionDraftSchema),
});

type QuestionDraft = Schema.Schema.Type<typeof QuestionDraftSchema>;

type CreateTemplateInput = Schema.Schema.Type<typeof CreateTemplateSchema>;

const listRefreshAtom = listQuestionerTemplates(1);

const defaultQuestion = (): QuestionDraft => ({
  id: `q_${Math.random().toString(36).slice(2, 10)}`,
  prompt: "",
  type: "text",
  required: true,
  options: [],
  optionsInput: "",
});

function parseOptions(input?: string) {
  if (!input) return [] as string[];
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function CreateTemplateForm() {
  const setActiveDialog = useSetActiveDialog();
  const mutate = useAtomSet(createQuestionerTemplate(), { mode: "promise" });
  const refreshTemplates = useAtomRefresh(listRefreshAtom);

  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [values, setValues] = React.useState<CreateTemplateInput>({
    name: "",
    description: null,
    questions: [defaultQuestion()],
  });

  const addQuestion = React.useCallback(() => {
    setValues((prev) => ({
      ...prev,
      questions: [...prev.questions, defaultQuestion()],
    }));
  }, []);

  const removeQuestion = React.useCallback((index: number) => {
    setValues((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== index),
    }));
  }, []);

  const updateQuestion = React.useCallback((index: number, patch: Partial<QuestionDraft>) => {
    setValues((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) => (idx === index ? { ...q, ...patch } : q)),
    }));
  }, []);

  async function onSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    e.stopPropagation();

    setFormError(null);

    const normalizedQuestions = values.questions.map((question) => ({
      ...question,
      prompt: question.prompt.trim(),
      options: question.options ?? parseOptions(question.optionsInput),
    }));

    const hasMissingOptions = normalizedQuestions.some(
      (question) =>
        (question.type === "select" || question.type === "multiselect") &&
        (!question.options || question.options.length === 0),
    );
    if (hasMissingOptions) {
      setFormError("Add options for select questions");
      return;
    }

    const validation = Schema.validateEither(CreateTemplateSchema)({
      name: values.name.trim(),
      description: values.description,
      questions: normalizedQuestions,
    });
    if (validation._tag === "Left") {
      setFormError(validation.left.message || "Invalid input");
      return;
    }

    if (normalizedQuestions.length === 0) {
      setFormError("Add at least one question");
      return;
    }

    setPending(true);
    try {
      await mutate({
        payload: {
          name: values.name.trim(),
          description: values.description,
          questions: normalizedQuestions.map(
            ({ optionsInput: _optionsInput, ...question }) => question,
          ),
        },
      });

      setActiveDialog(null);
      setValues({ name: "", description: null, questions: [defaultQuestion()] });
      refreshTemplates();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <ResponsiveDialogContent className="max-w-3xl">
      <form onSubmit={onSubmit} className="flex flex-col">
        <ResponsiveDialogBody>
          <GhostInput
            id="name"
            name="name"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            placeholder="Questioner name"
            aria-label="Name"
            className="w-full text-3xl font-semibold leading-tight tracking-tight placeholder:text-muted-foreground/40"
            disabled={pending}
            required
            autoFocus
          />
          <GhostTextArea
            id="description"
            name="description"
            value={values.description ?? ""}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                description: e.target.value,
              }))
            }
            placeholder="Add description..."
            aria-label="Description"
            className="mt-3 w-full min-h-24 text-lg leading-relaxed placeholder:text-muted-foreground/40"
            disabled={pending}
          />

          <div className="mt-5 pb-2 text-xs uppercase text-muted-foreground tracking-wider">
            Questions
          </div>

          <div className="pb-2 flex flex-col gap-4">
            {values.questions.map((question, idx) => (
              <div key={question.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    value={question.prompt}
                    onChange={(e) => updateQuestion(idx, { prompt: e.target.value })}
                    placeholder={`Question ${idx + 1}`}
                    aria-label="Prompt"
                    disabled={pending}
                  />
                  <Select
                    value={question.type}
                    onValueChange={(value) =>
                      updateQuestion(idx, {
                        type: value as QuestionerTemplate.QuestionerQuestionType,
                        options:
                          value === "select" || value === "multiselect" ? question.options : [],
                      })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="multiselect">Multiselect</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                      checked={question.required ?? false}
                      onCheckedChange={(checked) =>
                        updateQuestion(idx, { required: checked === true })
                      }
                      disabled={pending}
                    />
                    Required
                  </label>
                </div>

                {(question.type === "select" || question.type === "multiselect") && (
                  <Input
                    value={question.optionsInput ?? question.options?.join(", ") ?? ""}
                    onChange={(e) => updateQuestion(idx, { optionsInput: e.target.value })}
                    placeholder="Options (comma separated)"
                    disabled={pending}
                  />
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    value={question.helpText ?? ""}
                    onChange={(e) => updateQuestion(idx, { helpText: e.target.value })}
                    placeholder="Help text"
                    disabled={pending}
                  />
                  <Input
                    value={question.placeholder ?? ""}
                    onChange={(e) => updateQuestion(idx, { placeholder: e.target.value })}
                    placeholder="Placeholder"
                    disabled={pending}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(idx)}
                    disabled={pending || values.questions.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addQuestion} disabled={pending}>
              Add question
            </Button>
          </div>

          {formError ? (
            <div role="alert" className="text-sm text-destructive">
              {formError}
            </div>
          ) : null}
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button type="submit" disabled={pending || !values.name.trim()}>
            {pending ? (
              <>
                <Spinner className="mr-2" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </ResponsiveDialogFooter>
      </form>
    </ResponsiveDialogContent>
  );
}

export function CreateQuestionerTemplate({
  className,
  trigger,
  ...props
}: React.ComponentProps<"div"> & {
  trigger?: React.ReactNode;
}) {
  const activeDialog = useActiveDialog();
  const setActiveDialog = useSetActiveDialog();

  const open = activeDialog === "createQuestionerTemplate";
  const triggerNode = trigger || <Button type="button">Create questioner</Button>;

  return (
    <div className={cn("flex", className)} {...props}>
      <ResponsiveDialog
        open={open}
        onOpenChange={(isOpen) => setActiveDialog(isOpen ? "createQuestionerTemplate" : null)}
      >
        {trigger && <ResponsiveDialogTrigger asChild>{triggerNode}</ResponsiveDialogTrigger>}
        <CreateTemplateForm />
      </ResponsiveDialog>
    </div>
  );
}
