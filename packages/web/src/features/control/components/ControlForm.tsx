import { Control, Framework } from '@chronops/domain'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export type ControlFormValue = {
  name: string
  description: string
  frameworkId: string
  status: Control.ControlStatus
  testingFrequency: string
}

export function toCreateControlPayload(value: ControlFormValue): Control.CreateControl {
  return {
    name: value.name.trim(),
    description: value.description.trim() ? value.description.trim() : undefined,
    frameworkId: Framework.FrameworkId.make(value.frameworkId),
    status: value.status,
    testingFrequency: value.testingFrequency.trim()
      ? value.testingFrequency.trim()
      : undefined,
  }
}

export function ControlForm({
  value,
  onChange,
  frameworks,
}: {
  value: ControlFormValue
  onChange: (value: ControlFormValue) => void
  frameworks: ReadonlyArray<{ id: string; name: string }>
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.currentTarget.value })}
          placeholder="Access reviews"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="framework">Framework</Label>
        <Select
          id="framework"
          value={value.frameworkId}
          onChange={(e) =>
            onChange({ ...value, frameworkId: e.currentTarget.value })
          }
        >
          <option value="" disabled>
            Select framework
          </option>
          {frameworks.map((fw) => (
            <option key={fw.id} value={fw.id}>
              {fw.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          value={value.status}
          onChange={(e) =>
            onChange({ ...value, status: e.currentTarget.value as Control.ControlStatus })
          }
        >
          <option value="draft">draft</option>
          <option value="active">active</option>
          <option value="deprecated">deprecated</option>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="testingFrequency">Testing frequency</Label>
        <Input
          id="testingFrequency"
          value={value.testingFrequency}
          onChange={(e) =>
            onChange({ ...value, testingFrequency: e.currentTarget.value })
          }
          placeholder="Quarterly"
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
    </div>
  )
}
