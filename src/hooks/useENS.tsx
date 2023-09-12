import { useState, useEffect } from "react";
import { ethers } from "ethers";

function useENS() {
  const [resolvedName, setResolvedName] = useState("");
  const [error, setError] = useState("");

  const getName = async (address, formattingNumber = undefined) => {
    try {
      // Initialize Ethereum provider
      const provider = new ethers.providers.JsonRpcProvider(
        "YOUR_ETHEREUM_RPC_URL"
      );

      // Resolve ENS name for the given address
      const ensName = await provider.lookupAddress(address);

      if (ensName) {
        // If ENS name is found, set it as the resolved name
        setResolvedName(ensName);

        if (formattingNumber !== undefined) {
          // If formattingNumber is provided, format the resolved name
          // using the formatAddress function (located in helpers.ts)
          const formattedAddress = formatAddress(ensName, formattingNumber);
          return formattedAddress;
        }

        return ensName;
      } else {
        // If ENS name is not found, return the original address
        return address;
      }
    } catch (err) {
      setError(`Error retrieving ENS name: ${err.message}`);
      return address;
    }
  };

  return { resolvedName, error, getName };
}

export default useENS;
