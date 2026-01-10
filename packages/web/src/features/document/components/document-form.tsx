import { Control, Document, Framework } from '@chronops/domain'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

export type DocumentFormValue = {
  name: string
  type: Document.DocumentType
  url: string
  size: string
  frameworkId: string
  controlId: string
}

export function toCreateDocumentPayload(
  value: DocumentFormValue,
): Document.CreateDocument {
  return {
    name: value.name.trim(),
    type: value.type,
    url: value.url.trim(),
    size: value.size.trim() ? Number(value.size) : null,
    frameworkId: value.frameworkId.trim()
      ? Framework.FrameworkId.make(value.frameworkId)
      : null,
    controlId: value.controlId.trim()
      ? Control.ControlId.make(value.controlId)
      : null,
  }
}

export function DocumentForm({
  value,
  onChange,
  frameworks,
  controls,
}: {
  value: DocumentFormValue
  onChange: (value: DocumentFormValue) => void
  frameworks: ReadonlyArray<{ id: string; name: string }>
  controls: ReadonlyArray<{ id: string; name: string }>
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.currentTarget.value })}
          placeholder="Access review evidence"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="type">Type</Label>
        <Select
          id="type"
          value={value.type}
          onChange={(e) =>
            onChange({ ...value, type: e.currentTarget.value as Document.DocumentType })
          }
        >
          <option value="requirement">requirement</option>
          <option value="evidence">evidence</option>
          <option value="clause">clause</option>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={value.url}
          onChange={(e) => onChange({ ...value, url: e.currentTarget.value })}
          placeholder="https://..."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="size">Size (bytes)</Label>
        <Input
          id="size"
          inputMode="numeric"
          value={value.size}
          onChange={(e) => onChange({ ...value, size: e.currentTarget.value })}
          placeholder="Optional"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="framework">Framework (optional)</Label>
        <Select
          id="framework"
          value={value.frameworkId}
          onChange={(e) =>
            onChange({
              ...value,
              frameworkId: e.currentTarget.value,
              controlId: '',
            })
          }
        >
          <option value="">None</option>
          {frameworks.map((fw) => (
            <option key={fw.id} value={fw.id}>
              {fw.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="control">Control (optional)</Label>
        <Select
          id="control"
          value={value.controlId}
          onChange={(e) =>
            onChange({
              ...value,
              controlId: e.currentTarget.value,
            })
          }
          disabled={controls.length === 0}
        >
          <option value="">None</option>
          {controls.map((ctrl) => (
            <option key={ctrl.id} value={ctrl.id}>
              {ctrl.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
