import React, { useState } from 'react';

type Mode = 'claim' | 'burn';

type WalletState = 'disconnected' | 'connecting' | 'connected';

interface ClaimBurnProps {
  walletState?: WalletState;
  onConnect?: () => void;
  onClaim?: (amount: string) => Promise<void>;
  onBurn?: (amount: string) => Promise<void>;
}

export function ClaimBurn({
  walletState = 'disconnected',
  onConnect,
  onClaim,
  onBurn,
}: ClaimBurnProps) {
  const [mode, setMode] = useState<Mode>('claim');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setStatus('pending');
    setErrorMsg('');
    try {
      if (mode === 'claim') {
        await onClaim?.(amount);
      } else {
        await onBurn?.(amount);
      }
      setStatus('success');
      setAmount('');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Transaction failed');
    }
  }

  if (walletState === 'disconnected') {
    return (
      <div className="claim-burn" data-testid="claim-burn">
        <p className="wallet-prompt">Connect your wallet to continue</p>
        <button
          className="btn btn-connect"
          onClick={onConnect}
          data-testid="connect-wallet-btn"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (walletState === 'connecting') {
    return (
      <div className="claim-burn" data-testid="claim-burn">
        <p className="wallet-connecting" data-testid="connecting-msg">
          Connecting…
        </p>
      </div>
    );
  }

  return (
    <div className="claim-burn" data-testid="claim-burn">
      {/* Toggle */}
      <div className="toggle" role="group" aria-label="Select mode">
        <button
          className={`toggle-btn${mode === 'claim' ? ' active' : ''}`}
          onClick={() => { setMode('claim'); setStatus('idle'); }}
          aria-pressed={mode === 'claim'}
          data-testid="toggle-claim"
        >
          Claim
        </button>
        <button
          className={`toggle-btn${mode === 'burn' ? ' active' : ''}`}
          onClick={() => { setMode('burn'); setStatus('idle'); }}
          aria-pressed={mode === 'burn'}
          data-testid="toggle-burn"
        >
          Burn
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} data-testid="claim-burn-form">
        <label htmlFor="amount">Amount (XLM)</label>
        <input
          id="amount"
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setStatus('idle'); }}
          placeholder="0.00"
          disabled={status === 'pending'}
          data-testid="amount-input"
        />
        <button
          type="submit"
          className={`btn btn-${mode}`}
          disabled={status === 'pending' || !amount || Number(amount) <= 0}
          data-testid="submit-btn"
        >
          {status === 'pending' ? 'Processing…' : mode === 'claim' ? 'Claim' : 'Burn'}
        </button>
      </form>

      {/* Feedback */}
      {status === 'success' && (
        <p className="feedback success" role="status" data-testid="success-msg">
          {mode === 'claim' ? 'Claimed successfully!' : 'Burned successfully!'}
        </p>
      )}
      {status === 'error' && (
        <p className="feedback error" role="alert" data-testid="error-msg">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
