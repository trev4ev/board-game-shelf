export function gameCountLabel(count: number) {
  return `${count} ${count === 1 ? 'game' : 'games'}`
}

export function memberCountLabel(count: number) {
  return `${count} ${count === 1 ? 'member' : 'members'}`
}
