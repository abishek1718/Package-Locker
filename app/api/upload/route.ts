import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // ⚠️ Vercel Blob requires BLOB_READ_WRITE_TOKEN env var
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.warn('Missing BLOB_READ_WRITE_TOKEN.');
        return NextResponse.json({ error: 'Server configuration error: Missing Blob Token' }, { status: 500 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
        });

        return NextResponse.json(blob);
    } catch (error) {
        console.error('Blob upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
