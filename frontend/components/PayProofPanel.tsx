'use client';

import { useState, useCallback } from 'react';
import { FileText, Mail, AlertTriangle } from 'lucide-react';
import PaymentReceipt from './PaymentReceipt';
import type { PayPageInvoice } from './pay-page.types';

interface PayProofPanelProps {
  invoice: PayPageInvoice;
  onDownload: () => void;
  onEmail: () => void;
  onError?: (error: Error) => void;
}

export default function PayProofPanel({ invoice, onDownload, onEmail, onError }: PayProofPanelProps) {
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleDownloadClick = useCallback(() => {
    try {
      setDownloadError(null);
      onDownload();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download proof';
      setDownloadError(message);
      onError?.(error instanceof Error ? error : new Error(message));
    }
  }, [onDownload, onError]);

  const handleEmailClick = useCallback(() => {
    try {
      if (!invoice.customerEmail) {
        throw new Error('Client email is required to send proof');
      }
      setEmailError(null);
      onEmail();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send email';
      setEmailError(message);
      onError?.(error instanceof Error ? error : new Error(message));
    }
  }, [invoice.customerEmail, onEmail, onError]);

  const canEmail = invoice.customerEmail && invoice.status === 'PAID';

  return (
    <section aria-label="Payment proof" className="space-y-4">
      <PaymentReceipt invoice={invoice} />

      {(downloadError || emailError) && (
        <div role="alert" className="card bg-red-50 border border-red-200 p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-red-800 text-xs mt-1">{downloadError || emailError}</p>
          </div>
        </div>
      )}

      <div className="card flex gap-2 print:hidden">
        <button
          type="button"
          onClick={handleDownloadClick}
          className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          aria-label="Download payment proof"
        >
          <FileText className="w-4 h-4" aria-hidden="true" /> Download Proof
        </button>
        <button
          type="button"
          onClick={handleEmailClick}
          disabled={!canEmail}
          aria-disabled={!canEmail}
          aria-label={canEmail ? 'Email payment proof' : 'Email not available for this invoice'}
          className="btn btn-outline px-4"
        >
          <Mail className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
