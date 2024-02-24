export type NotionRowType = {
  properties: {
    nubank_id: {
      id: string
      type: 'rich_text'
      rich_text: {
        plain_text: string
      }[]
    }
    valor: { id: string; type: 'number'; number: number }
    ID: { id: string; type: 'rich_text'; rich_text: string[] }
    data: {
      id: string
      type: 'date'
      date: { start: Date | string; end: Date | null; time_zone: Date | null }
    }
    tags: {
      id: string
      type: 'select'
      select: { id: string; name: 'Entrada' | 'Saida'; color: 'green' | 'red' }
    }
    Gastos: { id: 'title'; type: 'title'; title: any }
  }
}
