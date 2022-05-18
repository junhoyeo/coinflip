import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import Config from "./config";

const CONTRACTS = ["osmosis_coinflip-aarch64"];

async function main() {
  const cfg = await Config.new();
  const [account] = await cfg.wallet.getAccounts();

  console.log(account.address);
  console.log(
    await cfg.cosmwasm.getBalance(account.address, "upebble")
  );

  // upload codes
  const codes: { [contract: string]: number } = {};
  const basePath = join(__dirname, "../artifacts");
  for (const contract of CONTRACTS) {
    const { codeId, transactionHash } = await cfg.cosmwasm.upload(
      account.address,
      readFileSync(join(basePath, `${contract}.wasm`)),
      "auto"
    );
    console.log({ contract, codeId, transactionHash });
    codes[contract.split('-')[0]] = codeId;
  }

  writeFileSync(
    join(__dirname, "./1_upload.json"),
    JSON.stringify(codes, null, 2)
  );
}

main()
  .then(() => console.log("Done"))
  .catch(console.error);
