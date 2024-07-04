// /app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';
import lighthouse from '@lighthouse-web3/sdk';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const image = formData.get('image') as string | null;
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;

    if (!file || !image || !name || !description) {
      return NextResponse.json({ error: 'Incomplete data provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const relativeUploadDir = `/uploads/${Date.now()}`;
    const uploadDir = path.join(os.tmpdir(), relativeUploadDir);

    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    const jsonData = {
      image,
      name,
      description,
      filePath
    };

    // Define the path to the local JSON file where you want to store the data
    const jsonFilePath = path.join(uploadDir, 'data.json');

    // Convert JSON data to a string
    const jsonString = JSON.stringify(jsonData, null, 2); // Pretty print JSON

    // Write the JSON data to the local file
    await writeFile(jsonFilePath, jsonString);

    // Upload JSON file to Lighthouse IPFS
    const apiKey = 'fcbfd699.ae5a55ea035c49afbd948162e1a38f9a'; // Replace with your actual Lighthouse API key
    const uploadResponse = await lighthouse.upload(jsonFilePath, apiKey);

    // Clean up: remove the temporary JSON file
    await unlink(jsonFilePath);

    // Return the IPFS URI
    return NextResponse.json({
      message: 'JSON data and file saved successfully',
      ipfsCid: uploadResponse.data.Hash,
      ipfsUrl: `https://gateway.lighthouse.storage/ipfs/${uploadResponse.data.Hash}`
    });
  } catch (error) {
    console.error('Error saving JSON data:', error);
    return NextResponse.json({ error: 'Error saving JSON data' }, { status: 500 });
  }
}
