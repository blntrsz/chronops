import { Framework } from '@chronops/domain'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type FrameworkFormValue = {
  name: string
  description: string
  version: string
  sourceUrl: string
}

export function toCreateFrameworkPayload(
  value: FrameworkFormValue,
): Framework.CreateFramework {
  return {
    name: value.name.trim(),
    description: value.description.trim() ? value.description.trim() : null,
    version: value.version.trim() ? value.version.trim() : null,
    sourceUrl: value.sourceUrl.trim() ? value.sourceUrl.trim() : null,
  }
}

export function FrameworkForm({
  value,
  onChange,
}: {
  value: FrameworkFormValue
  onChange: (value: FrameworkFormValue) => void
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.currentTarget.value })}
          placeholder="SOC 2"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={value.description}
          onChange={(e) =>
            onChange({ ...value, description: e.currentTarget.value })
          }
          placeholder="Short description"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="version">Version</Label>
        <Input
          id="version"
          value={value.version}
          onChange={(e) =>
            onChange({ ...value, version: e.currentTarget.value })
          }
          placeholder="2024"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="sourceUrl">Source URL</Label>
        <Input
          id="sourceUrl"
          value={value.sourceUrl}
          onChange={(e) =>
            onChange({ ...value, sourceUrl: e.currentTarget.value })
          }
          placeholder="https://..."
        />
      </div>
    </div>
  )
}
