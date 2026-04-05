export async function checkPremiumStatus(email: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.PREMIUM_API_URL}?email=${encodeURIComponent(email)}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PREMIUM_API_SECRET}`,
        },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return false
    const data = await res.json()
    return data.active === true
  } catch {
    return false
  }
}
