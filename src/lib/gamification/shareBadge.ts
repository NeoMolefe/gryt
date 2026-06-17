export async function shareBadge(name: string, description: string): Promise<'shared' | 'copied'> {
  const text = `I just unlocked the "${name}" badge on GRYT! ${description}\nBREAK. BUILD. BECOME.`

  if (navigator.share) {
    await navigator.share({ title: 'GRYT Badge Unlocked', text })
    return 'shared'
  }

  await navigator.clipboard.writeText(text)
  return 'copied'
}
