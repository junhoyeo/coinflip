import { join } from "path";

import Config from "./config";
import { InstantiateResult, UploadResult } from "./types";
import { writeFileSync } from "fs";

async function main() {
  const cfg = await Config.new();
  const [account] = await cfg.wallet.getAccounts();

  console.log(account.address);
  console.log(
    await Promise.all([
      cfg.cosmwasm.getBalance(account.address, "uosmo"),
      cfg.cosmwasm.getBalance(account.address, "uion"),
    ])
  );

  const codes = require(join(__dirname, "1_upload")) as UploadResult;

  // instantiate
  const { contractAddress: contractAddress, transactionHash } =
    await cfg.cosmwasm.instantiate(
      account.address,
      codes.osmosis_coinflip,
      {
        name: "Osmosis Coinflip",
        description: "Flip your coins in Osmosis",
      },
      "Osmosis Coinflip Contract",
      "auto"
    );

  console.log({ contractAddress, transactionHash });

  // const configResp = await cfg.cosmwasm.queryContractSmart(
  //   contractAddress,
  //   {
  //     get_config: {},
  //   }
  // );

  writeFileSync(
    join(__dirname, "2_instantiate.json"),
    JSON.stringify(
      {
        osmosis_coinflip: contractAddress,
      } as InstantiateResult,
      null,
      2
    )
  );
}

main()
  .then(() => console.log("Done"))
  .catch(console.error);
