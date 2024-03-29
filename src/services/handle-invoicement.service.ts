import { Client } from '@notionhq/client'
import { NotionRowType } from '../@types/jobs/notion-database'
import moment from 'moment'

const getNotionResultsPaginated = async (
  notion: Client,
  databaseId: string,
  notionResults: NotionRowType[] = [],
  nextCursor?: string | null
) => {
  const { results, has_more, next_cursor } = await notion.databases.query({
    database_id: databaseId,
    ...(nextCursor && { start_cursor: nextCursor }),
    filter: {
      and: [
        {
          property: 'data',
          date: {
            after: moment().startOf('month').toISOString(),
            before: moment().endOf('month').toISOString()
          }
        }
      ]
    }
  })

  // @ts-ignore
  notionResults = [...notionResults, ...results] as NotionRowType[]

  if (has_more) {
    await getNotionResultsPaginated(
      notion,
      databaseId,
      notionResults,
      next_cursor
    )
  }

  return notionResults
}

export default {
  getNotionResultsPaginated
}
