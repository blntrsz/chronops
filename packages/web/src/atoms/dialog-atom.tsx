import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";

type ActiveDialog = "createFramework" | "createDocument" | "createControl" | null;

const activeDialogAtom = Atom.make<ActiveDialog>(null);

export const useActiveDialog = () => useAtomValue(activeDialogAtom);
export const useSetActiveDialog = () => useAtomSet(activeDialogAtom);
