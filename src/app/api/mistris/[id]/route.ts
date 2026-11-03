import { NextRequest, NextResponse } from 'next/server'
import { MISTRI_DIRECTORY } from '../search/route'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const mistri = MISTRI_DIRECTORY.find((m) => m.id === id) || MISTRI_DIRECTORY[0]

  if (!mistri) {
    return NextResponse.json(
      { error: 'Mistri not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: mistri,
  })
}
