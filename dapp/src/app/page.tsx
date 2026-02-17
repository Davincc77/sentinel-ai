import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { Identity, Name, Avatar } from '@coinbase/onchainkit/identity';
import { Swap, SwapAmountInput, SwapButton } from '@coinbase/onchainkit/swap';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function SentinelAIDApp() {
  const { address, isConnected } = useAccount();
  const [alphaContent, setAlphaContent] = useState('Alpha is locked. Hold 10M $CLAW or pay via x402 to unlock.');
  const [burnTotal, setBurnTotal] = useState('7,700,000');

  useEffect(() => {
    // Logic to check $CLAW balance or x402 status would go here
  }, [address]);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <Head>
        <title>Sentinel AI | Terminal</title>
        <meta property="fc:frame" content='{"version":"next","imageUrl":"https://sentinel-ai-29p.pages.dev/splash.png","button":{"title":"LAUNCH_SENTINEL","action":{"type":"launch_frame","name":"SentinelAI","url":"https://sentinel-ai-29p.pages.dev"}}}' />
      </Head>
      
      <header className="flex justify-between items-center border-b border-green-900 pb-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tighter shadow-green-500/50 text-shadow-lg">SENTINEL_AI // TERMINAL</h1>
        <Wallet>
          <ConnectWallet className="bg-green-900 hover:bg-green-800 text-green-100 rounded-none px-4 py-2 border border-green-400">
            {isConnected ? (
              <Identity address={address} className="flex gap-2 items-center">
                <Avatar address={address} />
                <Name address={address} />
              </Identity>
            ) : (
              "CONNECT_IDENTITY"
            )}
          </ConnectWallet>
        </Wallet>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-green-900 bg-zinc-950 p-6">
          <h2 className="text-xl mb-4 border-b border-green-900 pb-2">🛰️ LIVE_ALPHA_FEED</h2>
          <div className="bg-black border border-zinc-800 p-4 min-h-[200px] text-sm overflow-hidden">
            <p className="opacity-70 mb-2 font-bold">[SYSTEM_STATUS: ACTIVE]</p>
            <p className="text-xs mb-4">Targeting Smart Money Elites on Base...</p>
            <p>{alphaContent}</p>
          </div>
          <button 
            className="mt-4 w-full bg-green-500 text-black font-bold py-2 hover:bg-green-400 transition-colors"
            onClick={() => window.open('https://sentinel-ai.enzoc1977.workers.dev', '_blank')}
          >
            UNLOCK_ALPHA_(0.50_USDC)
          </button>
        </div>

        <div className="border border-green-900 bg-zinc-950 p-6">
          <h2 className="text-xl mb-4 border-b border-green-900 pb-2">🔥 SENTINEL_LOOP</h2>
          <div className="flex flex-col items-center justify-center p-8 bg-black border border-zinc-800">
            <span className="text-sm opacity-50 uppercase">Total_Deflated:</span>
            <span className="text-4xl font-bold my-2">{burnTotal}</span>
            <span className="text-xs uppercase tracking-widest">$CLAW permanently removed</span>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm mb-2 opacity-70">REPLENISH_ALPHA_STAKE ($CLAW)</h3>
            <Swap>
              <SwapAmountInput label="Sell" swappableTokens={[]} />
              <SwapAmountInput label="Buy" swappableTokens={[]} />
              <SwapButton className="w-full bg-green-900 hover:bg-green-800 mt-2 text-green-100 py-2 border border-green-400" />
            </Swap>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-center text-[10px] opacity-40 uppercase tracking-[0.2em]">
        Operative: Crypto_Claw // Protocol: OpenClaw x Bankr // Deployer: {address || "0x..."}
      </footer>
    </div>
  );
}
