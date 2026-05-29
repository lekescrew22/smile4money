import React from 'react';
import { ClaimBurn } from './components/claim-burn';
import { useStellarWallet } from './hooks/useStellarWallet';

export function App() {
  const wallet = useStellarWallet();

  async function handleClaim(amount: string) {
    const addr = wallet.address;
    if (!addr) throw new Error('Wallet not connected');
    console.log(`Claiming ${amount} XLM for ${addr}`);
    await new Promise((r) => setTimeout(r, 1000));
    wallet.refreshBalance();
  }

  async function handleBurn(amount: string) {
    const addr = wallet.address;
    if (!addr) throw new Error('Wallet not connected');
    console.log(`Burning ${amount} XLM from ${addr}`);
    await new Promise((r) => setTimeout(r, 1000));
    wallet.refreshBalance();
  }

  return (
    <main>
      <ClaimBurn
        walletState={{
          status: wallet.status,
          address: wallet.address,
          error: wallet.error,
          balance: wallet.balance,
          network: wallet.network,
        }}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        onClaim={handleClaim}
        onBurn={handleBurn}
      />
    </main>
  );
}
