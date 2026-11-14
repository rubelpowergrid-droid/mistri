import { redirect } from 'next/navigation'

export default async function MistriBookingDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (id) {
    redirect(`/bookings/${id}`)
  }
  redirect('/mistri/bookings')
}
