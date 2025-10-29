import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchQuotation } from '@/store/slices/quotationsSlice';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { StatusPill } from '@/components/StatusPill';

export default function QuotationPrint() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentQuotation, loading } = useAppSelector((state) => state.quotations);

  useEffect(() => {
    if (id) {
      dispatch(fetchQuotation(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    // Auto-print when loaded
    if (currentQuotation && !loading) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [currentQuotation, loading]);

  if (!id) {
    navigate('/');
    return null;
  }

  if (loading || !currentQuotation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const quotation = currentQuotation;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  };

  return (
    <div className="print-container max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QUOTATION</h1>
            <p className="text-sm text-gray-600 mt-1">Pactle - Quotation Management System</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Quotation ID</p>
            <p className="text-xl font-bold text-gray-900">{quotation.id}</p>
          </div>
        </div>
      </div>

      {/* Client & Status Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Client</p>
          <p className="text-lg font-bold">{quotation.client}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Status</p>
          <StatusPill status={quotation.status} />
        </div>
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Last Updated</p>
          <p className="text-sm">{formatDate(quotation.last_updated)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Grand Total</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(quotation.amount)}</p>
        </div>
      </div>

      {/* Description */}
      {quotation.description && (
        <div className="mb-6">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Description</p>
          <p className="text-sm">{quotation.description}</p>
        </div>
      )}

      {/* Line Items */}
      {quotation.lineItems && quotation.lineItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3">Line Items</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Sr</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Item</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">SKU</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold">Qty</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Unit</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold">Rate</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {quotation.lineItems.map((item) => (
                <tr key={item.sr}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{item.sr}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{item.item}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-mono">{item.sku}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right">{item.qty}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{item.unit}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right">{formatCurrency(item.rate)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="mt-4 ml-auto" style={{ width: '300px' }}>
            {quotation.subtotal && (
              <div className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(quotation.subtotal)}</span>
              </div>
            )}
            {quotation.gst && (
              <div className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">GST (18%):</span>
                <span className="font-medium">{formatCurrency(quotation.gst)}</span>
              </div>
            )}
            {quotation.freight && (
              <div className="flex justify-between py-1 text-sm">
                <span className="text-gray-600">Freight:</span>
                <span className="font-medium">{formatCurrency(quotation.freight)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 text-base font-bold border-t-2 border-gray-800 mt-2">
              <span>Grand Total:</span>
              <span>{formatCurrency(quotation.amount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {quotation.status === 'Rejected' && quotation.rejectionReason && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-900 uppercase font-semibold mb-1">Rejection Reason</p>
          <p className="text-sm text-red-800">{quotation.rejectionReason}</p>
        </div>
      )}

      {/* Status History */}
      {quotation.statusHistory && quotation.statusHistory.length > 0 && (
        <div className="mb-6 page-break-before">
          <h2 className="text-lg font-bold mb-3">Status History</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Status</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Changed By</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Date & Time</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody>
              {quotation.statusHistory.map((entry, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-medium">{entry.status}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{entry.changedBy}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{formatDate(entry.changedAt)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{entry.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-600">
        <p>Generated by Pactle Quotation Management System</p>
        <p className="mt-1">Printed on {new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</p>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print-container {
            max-width: 100%;
            padding: 20mm;
          }
          .page-break-before {
            page-break-before: always;
          }
          @page {
            margin: 15mm;
          }
        }
        @media screen {
          .print-container {
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            margin: 2rem auto;
          }
        }
      `}</style>
    </div>
  );
}

