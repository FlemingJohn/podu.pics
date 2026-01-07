import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import { uploadToR2 } from '@/lib/r2-client';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSION = 4000;

async function optimizeImage(buffer: Buffer, type: string): Promise<Buffer> {
  if (type === 'image/gif') return buffer;

  const image = sharp(buffer);
  const { width, height } = await image.metadata();

  if ((width && width > MAX_DIMENSION) || (height && height > MAX_DIMENSION)) {
    image.resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  if (type === 'image/png') {
    return image.png({ quality: 90, compressionLevel: 9 }).toBuffer();
  }

  if (type === 'image/webp') {
    return image.webp({ quality: 85 }).toBuffer();
  }

  return image.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const optimizedBuffer = await optimizeImage(buffer, file.type);
    const uploadResult = await uploadToR2(optimizedBuffer, nanoid(10), file.type);

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      key: uploadResult.key,
      originalSize: file.size,
      optimizedSize: optimizedBuffer.length,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    );
  }
}
