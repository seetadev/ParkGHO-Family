import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import os from 'os';
import lighthouse from '@lighthouse-web3/sdk';
import { unlink } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const relativeUploadDir = `/uploads/${Date.now()}`;
    const uploadDir = path.join(os.tmpdir(), relativeUploadDir);

    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    const apiKey = "fcbfd699.ae5a55ea035c49afbd948162e1a38f9a";
    if (!apiKey) {
      return NextResponse.json({ error: 'Lighthouse API key not configured' }, { status: 500 });
    }

    const uploadResponse = await lighthouse.upload(filePath, apiKey);

    // Clean up: remove the temporary file
    await unlink(filePath);

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileName: file.name,
      ipfsCid: uploadResponse.data.Hash,
      ipfsUrl: `https://gateway.lighthouse.storage/ipfs/${uploadResponse.data.Hash}`
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Error uploading file to IPFS' }, { status: 500 });
  }
}



// import { NextResponse } from "next/server";

// // To handle a GET request to /api
// export async function GET(request:any) {
//   // Do whatever you want
//   return NextResponse.json({ message: "Hello World" }, { status: 200 });
// }

