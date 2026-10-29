import { describe, expect, it } from 'vitest'
import { parseTickAndNote } from './parse'

const valid = {
  type: 'tick_and_note',
  price: 65000.5,
  note: { pitch: 'Eb3', velocity: 80, duration_ms: 250, timestamp_ms: 1_700_000_000_000 },
}

describe('parseTickAndNote', () => {
  it('accepts a valid message', () => {
    expect(parseTickAndNote(JSON.stringify(valid))).toEqual(valid)
  })

  it.each([
    ['not json', 'nope'],
    ['a json array', '[1]'],
    ['another message type', JSON.stringify({ ...valid, type: 'hello' })],
    ['a missing note', JSON.stringify({ type: 'tick_and_note', price: 1 })],
    ['a string price', JSON.stringify({ ...valid, price: '65000' })],
    ['a note missing a field', JSON.stringify({ ...valid, note: { pitch: 'C3 ' } })],
  ])('rejects %s', (_label, text) => {
    expect(parseTickAndNote(text)).toBeNull()
  })
})
