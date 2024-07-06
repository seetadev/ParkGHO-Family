import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import os from "os";
import lighthouse from "@lighthouse-web3/sdk";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Retrieve all fields
    const incidentType = formData.get("incidentType") as string | null;
    const date = formData.get("date") as string | null;
    const time = formData.get("time") as string | null;
    const severity = formData.get("severity") as string | null;
    const name = formData.get("name") as string | null;
    const contactInfo = formData.get("contactInfo") as string | null;
    const vehicleType = formData.get("vehicleType") as string | null;
    const licensePlate = formData.get("licensePlate") as string | null;
    const insuranceInfo = formData.get("insuranceInfo") as string | null;
    const description = formData.get("description") as string | null;
    const weather = formData.get("weather") as string | null;
    const roadConditions = formData.get("roadConditions") as string | null;
    const trafficConditions = formData.get("trafficConditions") as string | null;
    const image = formData.get("image") as string | null;

    // Validate required fields
    if (
      !incidentType ||
      !date ||
      !time ||
      !severity ||
      !name ||
      !contactInfo ||
      !vehicleType ||
      !licensePlate ||
      !insuranceInfo ||
      !description ||
      !weather ||
      !roadConditions ||
      !trafficConditions ||
      !image
    ) {
      return NextResponse.json(
        { error: "Incomplete data provided" },
        { status: 400 }
      );
    }

    const relativeUploadDir = `/uploads/${Date.now()}`;
    const uploadDir = path.join(os.tmpdir(), relativeUploadDir);

    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Construct JSON data
    const jsonData: Record<string, any> = {
      incidentType,
      date,
      time,
      severity,
      name,
      contactInfo,
      vehicleType,
      licensePlate,
      insuranceInfo,
      description,
      weather,
      roadConditions,
      trafficConditions,
      image,
    };

    // Define the path to the local JSON file where you want to store the data
    const jsonFilePath = path.join(uploadDir, "data.json");

    // Write the JSON data to the local file
    await writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2));

    // Upload JSON file to Lighthouse IPFS
    const apiKey = "fcbfd699.ae5a55ea035c49afbd948162e1a38f9a"; // Replace with your actual Lighthouse API key
    const uploadResponse = await lighthouse.upload(jsonFilePath, apiKey);

    // Clean up: remove the temporary JSON file
    await unlink(jsonFilePath);

    // Return the IPFS URI
    return NextResponse.json({
      message: "Data and file saved successfully",
      ipfsCid: uploadResponse.data.Hash,
      ipfsUrl: `https://gateway.lighthouse.storage/ipfs/${uploadResponse.data.Hash}`,
    });
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json({ error: "Error saving data" }, { status: 500 });
  }
}
