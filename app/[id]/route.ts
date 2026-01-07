import { NextResponse } from 'next/server';
import { getFromR2 } from '@/lib/r2-client';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const { buffer, contentType } = await getFromR2(id);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Image fetch error:', error);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}
