import { run, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const file = path.join(__dirname, `../deployments/${network.name}.json`);
  if (!fs.existsSync(file)) throw new Error(`No deployment for ${network.name}. Run deploy.ts first.`);
  const d = JSON.parse(fs.readFileSync(file, "utf-8"));

  for (const [name, info] of Object.entries(d.contracts) as any) {
    console.log(`Verifying ${name} at ${info.address}`);
    try {
      await run("verify:verify", { address: info.address, constructorArguments: info.constructorArgs });
      console.log(`${name} verified`);
    } catch (e: any) {
      if (e.message.includes("Already Verified")) console.log(`${name} already verified`);
      else console.error(`${name} failed:`, e.message);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
