import { Client } from "@/lib/rpc-client";
import type { Control, Evidence, Pdf } from "@chronops/domain";

export const evidenceReactiveKeys = {
  all: ["evidence"],
  detail: (id: Evidence.EvidenceId) => [...evidenceReactiveKeys.all, "detail", id],
  details: () => [...evidenceReactiveKeys.all, "detail"],
  list: (
    page = 1,
    filter?: {
      controlId?: Control.ControlId;
      pdfId?: Pdf.PdfId;
    },
  ) => [...evidenceReactiveKeys.all, "list", page, filter],
  lists: () => [...evidenceReactiveKeys.all, "list"],
} as const;

export const listEvidence = (
  page = 1,
  filter?: {
    controlId?: Control.ControlId;
    pdfId?: Pdf.PdfId;
  },
) =>
  Client.query(
    "EvidenceList",
    {
      page,
      size: 50,
      controlId: filter?.controlId,
      pdfId: filter?.pdfId,
    },
    {
      reactivityKeys: evidenceReactiveKeys.list(page, filter),
    },
  );

export const getEvidenceById = (id: Evidence.EvidenceId) =>
  Client.query(
    "EvidenceById",
    { id },
    {
      reactivityKeys: evidenceReactiveKeys.detail(id),
    },
  );

export const createEvidence = () => Client.mutation("EvidenceCreate");
export const updateEvidence = () => Client.mutation("EvidenceUpdate");
export const removeEvidence = () => Client.mutation("EvidenceRemove");
