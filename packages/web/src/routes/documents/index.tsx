// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router'

import { DocumentListPage } from '@/features/document/components/DocumentListPage'

export const Route = createFileRoute('/documents')({
  component: DocumentListPage,
})
