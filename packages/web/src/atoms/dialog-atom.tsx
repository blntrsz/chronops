import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";

type ActiveDialog =
  | "createFramework"
  | "deleteFramework"
  | "createControl"
  | "createAssessmentTemplate"
  | "createAssessmentInstance"
  | "createIssue"
  | "createPolicy"
  | null;

const activeDialogAtom = Atom.make<ActiveDialog>(null);

export const useActiveDialog = () => useAtomValue(activeDialogAtom);
export const useSetActiveDialog = () => useAtomSet(activeDialogAtom);
