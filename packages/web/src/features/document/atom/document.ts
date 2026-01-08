import { Client } from '@/lib/rpc'
import { Document } from '@chronops/domain'

export const pageSize = 25

export const documentListQuery = (page: number) =>
  Client.query(
    'DocumentList',
    { page, size: pageSize },
    { reactivityKeys: { list: ['document:list', page] } },
  )

export const documentByIdQuery = (id: Document.DocumentId) =>
  Client.query('DocumentById', id, {
    reactivityKeys: { detail: ['document:detail', id] },
  })

export const documentCountQuery = () =>
  Client.query('DocumentCount', undefined, {
    reactivityKeys: { count: ['document:count'] },
  })

export const documentCreateMutation = Client.mutation('DocumentCreate')
export const documentUpdateMutation = Client.mutation('DocumentUpdate')
export const documentRemoveMutation = Client.mutation('DocumentRemove')
