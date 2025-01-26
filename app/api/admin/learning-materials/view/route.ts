// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/db';
// import { fetchFileFromS3 } from '@/utils/fetchFiles';
// import { getFileExtension } from '@/utils/fileTypes';
// import { PassThrough } from 'stream';

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get('id');

//     if (!id) {
//       return NextResponse.json(
//         { error: 'No file ID provided' },
//         { status: 400 }
//       );
//     }

//     const file = await prisma.learningmaterials.findUnique({
//       where: { id },
//       select: { title: true, filePath: true, fileType: true },
//     });

//     if (!file) {
//       return NextResponse.json({ error: 'File not found' }, { status: 404 });
//     }

//     const { fileStream, contentType } = await fetchFileFromS3(file.filePath!);

//     const headers = new Headers();
//     const sanitizedTitle = (file.title ?? 'untitled').replace(/\s+/g, '-');
//     const fileName = `${sanitizedTitle}.${getFileExtension(contentType!)}`;

//     headers.set('Content-Type', contentType!);
//     headers.set('Content-Disposition', `inline; filename="${fileName}"`);

//     // Convert stream to buffer before sending the response
//     const fileBuffer = await streamToBuffer(fileStream);
//     return new NextResponse(fileBuffer, { headers });
//   } catch (error) {
//     console.error('Error processing the request:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // Utility function to convert stream to buffer
// function streamToBuffer(stream: PassThrough): Promise<Buffer> {
//   return new Promise((resolve, reject) => {
//     const chunks: Buffer[] = [];
//     stream.on('data', (chunk: any) =>
//       chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
//     );
//     stream.on('end', () => resolve(Buffer.concat(chunks)));
//     stream.on('error', (err: Error) => reject(err));
//   });
// }
