import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import prisma from '@/lib/db';
import { fetchFileFromS3 } from '@/utils/fetchFiles';
import { getFileExtension } from '@/utils/fileTypes';

function streamToBuffer(stream: PassThrough): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    );
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err) => reject(err));
  });
}

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'No file IDs provided' },
        { status: 400 }
      );
    }

    const files = await prisma.learningMaterial.findMany({
      where: { id: { in: ids } },
      select: { title: true, filePath: true, fileType: true },
    });

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files found for the provided IDs' },
        { status: 404 }
      );
    }

    const headers = new Headers();

    if (files.length === 1) {
      const file = files[0];
      const { fileStream, contentType } = await fetchFileFromS3(file.filePath!);
      const sanitizedTitle = (file.title ?? 'untitled').replace(/\s+/g, '-');
      const fileName = `${sanitizedTitle}.${getFileExtension(contentType!)}`;

      headers.set('Content-Type', contentType!);
      headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

      const fileBuffer = await streamToBuffer(fileStream);
      return new NextResponse(fileBuffer, { headers });
    } else {
      const zipStream = new PassThrough();
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.pipe(zipStream);
      headers.set('Content-Type', 'application/zip');
      headers.set(
        'Content-Disposition',
        'attachment; filename="learning-materials.zip"'
      );

      for (const file of files) {
        const { fileStream, contentType } = await fetchFileFromS3(
          file.filePath!
        );
        const sanitizedTitle = (file.title ?? 'untitled').replace(/\s+/g, '-');
        archive.append(fileStream, {
          name: `${sanitizedTitle}.${getFileExtension(contentType!)}`,
        });
      }

      archive.finalize();

      const zipBuffer = await streamToBuffer(zipStream);
      return new NextResponse(zipBuffer, { headers });
    }
  } catch (error) {
    console.error('Error processing the request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
