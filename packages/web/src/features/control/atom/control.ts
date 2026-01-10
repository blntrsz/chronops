import { Client } from '@/lib/rpc'
import { Control, Framework } from '@chronops/domain'

export const pageSize = 25

export const controlListQuery = (page: number) =>
  Client.query(
    'ControlList',
    { page, size: pageSize },
    { reactivityKeys: { list: ['control:list', page] } },
  )

export const controlByIdQuery = (id: Control.ControlId) =>
  Client.query('ControlById', { id }, {
    reactivityKeys: { detail: ['control:detail', id] },
  })

export const controlsByFrameworkQuery = (frameworkId: Framework.FrameworkId) =>
  Client.query('ControlByFramework', { frameworkId }, {
    reactivityKeys: { byFramework: ['control:byFramework', frameworkId] },
  })

export const controlCountQuery = () =>
  Client.query('ControlCount', undefined, {
    reactivityKeys: { count: ['control:count'] },
  })

export const controlCreateMutation = Client.mutation('ControlCreate')
export const controlUpdateMutation = Client.mutation('ControlUpdate')
export const controlRemoveMutation = Client.mutation('ControlRemove')
