import type { FC } from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import type { Transaction } from '../types/budget';

interface TransactionsViewProps {
  transactions: Transaction[];
}

export const TransactionsView: FC<TransactionsViewProps> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">All Transactions</h2>
      <div className="space-y-3">
        {transactions.map(t => (
          <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                {t.type === 'income' ? <ArrowUpRight size={16} className="text-green-600" /> : <ArrowDownLeft size={16} className="text-red-600" />}
              </div>
              <div>
                <p className="font-medium">{t.description}</p>
                <p className="text-sm text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
              </div>
            </div>
            <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};