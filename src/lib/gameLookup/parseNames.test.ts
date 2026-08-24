import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseGameNameList } from './parseNames'

describe('parseGameNameList', () => {
  it('reads one name per line and drops blanks and duplicates', () => {
    assert.deepEqual(
      parseGameNameList('Wingspan\n\nCatan\nwingspan\nTicket to Ride'),
      ['Wingspan', 'Catan', 'Ticket to Ride'],
    )
  })

  it('keeps commas in pasted names', () => {
    assert.deepEqual(parseGameNameList('Ticket to Ride, Europe'), [
      'Ticket to Ride, Europe',
    ])
  })

  it('uses a name column when a CSV header is present', () => {
    const csv = 'name,year\nWingspan,2019\nCatan,1995'
    assert.deepEqual(parseGameNameList(csv), ['Wingspan', 'Catan'])
  })

  it('uses the first column for headerless CSV uploads', () => {
    const csv = 'Wingspan,2019\n"Ticket to Ride, Europe",2005'
    assert.deepEqual(parseGameNameList(csv, { csv: true }), [
      'Wingspan',
      'Ticket to Ride, Europe',
    ])
  })
})
