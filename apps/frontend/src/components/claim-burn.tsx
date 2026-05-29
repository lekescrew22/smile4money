import React, { useState } from 'react';
import '../styles/claim-burn.css';

type Mode = 'claim' | 'burn';

type WalletState = 'checking' | 'notInstalled' | 'disconnected' | 'connecting' | 'connected' | 'wrongNetwork';

interface ClaimBurnProps {
  walletState?: WalletState;
  onConnect?: () => void;
  onClaim?: (amount: string) => Promise<void>;
  onBurn?: (amount: string) => Promise<void>;
  onSwitchNetwork?: () => void;
  publicKey?: string | null;
  expectedNetwork?: string;
}

export function ClaimBurn({
  walletState = 'disconnected',
  onConnect,
  onClaim,
  onBurn,
  onSwitchNetwork,
  publicKey,
  expectedNetwork = 'testnet',
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

  function renderNotInstalled() {
    return (
      <div className="wallet-state" data-testid="wallet-not-installed">
        <div className="wallet-state-icon">&#9888;&#65039;</div>
        <h3 className="wallet-state-title">Freighter Not Found</h3>
        <p className="wallet-state-message">
          Please install the{' '}
          <a href="https://freighter.app" target="_blank" rel="noopener noreferrer">
            Freighter wallet extension
          </a>{' '}
          to continue.
        </p>
      </div>
    );
  }

  function renderDisconnected() {
    return (
      <div className="wallet-state" data-testid="wallet-disconnected">
        <div className="wallet-state-icon">&#128188;</div>
        <h3 className="wallet-state-title">Connect Your Wallet</h3>
        <p className="wallet-state-message">
          Connect your Freighter wallet to claim rewards or burn tokens.
        </p>
        <button className="btn btn-connect" onClick={onConnect} data-testid="connect-wallet-btn">
          Connect Wallet
        </button>
      </div>
    );
  }

  function renderConnecting() {
    return (
      <div className="wallet-state" data-testid="wallet-connecting">
        <div className="spinner" />
        <p className="wallet-state-message">Connecting to Freighter&hellip;</p>
      </div>
    );
  }

  function renderWrongNetwork() {
    return (
      <div className="wallet-state" data-testid="wallet-wrong-network">
        <div className="wallet-state-icon">&#127760;</div>
        <h3 className="wallet-state-title">Wrong Network</h3>
        <p className="wallet-state-message">
          Please switch your Freighter wallet to <strong>{expectedNetwork}</strong>.
        </p>
        <button
          className="btn btn-switch-network"
          onClick={onSwitchNetwork}
          data-testid="switch-network-btn"
        >
          Switch to {expectedNetwork}
        </button>
      </div>
    );
  }

  function renderForm() {
    return (
      <>
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

        {publicKey && (
          <div className="wallet-info" data-testid="wallet-info">
            <span className="wallet-info-label">Connected</span>
            <span className="wallet-info-address">
              {publicKey.slice(0, 4)}&hellip;{publicKey.slice(-4)}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} data-testid="claim-burn-form">
          <label htmlFor="amount">
            {mode === 'claim' ? 'Claim amount' : 'Burn amount'} (XLM)
          </label>
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
            {status === 'pending' ? 'Processing\u2026' : mode === 'claim' ? 'Claim' : 'Burn'}
          </button>
        </form>

        <div aria-live="polite" aria-atomic="true">
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
      </>
    );
  }

  const stateMap: Record<WalletState, React.ReactNode> = {
    checking: renderConnecting(),
    notInstalled: renderNotInstalled(),
    disconnected: renderDisconnected(),
    connecting: renderConnecting(),
    wrongNetwork: renderWrongNetwork(),
    connected: renderForm(),
  };

  return (
    <div className="claim-burn" data-testid="claim-burn">
      <h2 className="claim-burn-title">Claim &amp; Burn</h2>
      {stateMap[walletState]}
    </div>
  );
}
