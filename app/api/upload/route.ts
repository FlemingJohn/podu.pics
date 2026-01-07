import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import { uploadToR2 } from '@/lib/r2-client';

// Allowed image MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get original file extension
    const extension = file.name.split('.').pop() || 'jpg';

    // Generate unique ID for the file
    const uniqueId = nanoid(10);
    const fileName = `${uniqueId}.${extension}`;

    // Optimize image using sharp
    let optimizedBuffer: Buffer;
    const contentType = file.type;

    // Process based on file type
    if (file.type === 'image/gif') {
      // Don't optimize GIFs to preserve animation
      optimizedBuffer = buffer;
    } else {
      // Optimize other image formats
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Resize if image is too large (max 4000px on longest side)
      const maxDimension = 4000;
      if (metadata.width && metadata.width > maxDimension || metadata.height && metadata.height > maxDimension) {
        image.resize(maxDimension, maxDimension, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convert to appropriate format and optimize
      if (file.type === 'image/png') {
        optimizedBuffer = await image
          .png({ quality: 90, compressionLevel: 9 })
          .toBuffer();
      } else if (file.type === 'image/webp') {
        optimizedBuffer = await image
          .webp({ quality: 85 })
          .toBuffer();
      } else {
        // JPEG
        optimizedBuffer = await image
          .jpeg({ quality: 85, mozjpeg: true })
          .toBuffer();
      }
    }

    // Upload to R2
    const uploadResult = await uploadToR2(optimizedBuffer, fileName, contentType);

    // Return success response with shareable URL
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
