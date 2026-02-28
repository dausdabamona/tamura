import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import { db } from '../db/database'
import { formatRp, formatDate, BULAN } from '../utils/format'
import TransactionForm from '../components/TransactionForm'

export default function Finance() {
  const [showForm, setShowForm] = useState(false)

  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

  const transactions = useLiveQuery(
    () => db.transactions.toArray(),
    []
  )

  const monthlyTransactions = useMemo(() => {
    if (!transactions) return []
    return transactions
      .filter(t => t.date >= monthStart && t.date <= monthEnd)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [transactions, monthStart, monthEnd])

  const income = useMemo(() => {
    return monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [monthlyTransactions])

  const expense = useMemo(() => {
    return monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [monthlyTransactions])

  const profit = income - expense

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 16px 0' }}>
        <div style={{
          flex: 1, backgroundColor: '#ecfdf5', borderRadius: 12, padding: 12,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Masuk</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#16a34a' }}>{formatRp(income)}</div>
        </div>
        <div style={{
          flex: 1, backgroundColor: '#fef2f2', borderRadius: 12, padding: 12,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Keluar</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#dc2626' }}>{formatRp(expense)}</div>
        </div>
        <div style={{
          flex: 1, backgroundColor: profit >= 0 ? '#ecfdf5' : '#fef2f2', borderRadius: 12, padding: 12,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Profit</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: profit >= 0 ? '#16a34a' : '#dc2626' }}>
            {formatRp(profit)}
          </div>
        </div>
      </div>

      {/* List header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 16px 8px',
      }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>
          Catatan {BULAN[now.getMonth()]}
        </span>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px',
            fontSize: 14, fontWeight: 700, color: '#fff', backgroundColor: '#0f766e',
            borderRadius: 10, border: 'none', cursor: 'pointer',
          }}
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} /> Catat
        </button>
      </div>

      {/* Transaction list */}
      <div style={{ padding: '0 16px' }}>
        {monthlyTransactions.length === 0 ? (
          <div style={{
            backgroundColor: '#fff', borderRadius: 12, padding: 20,
            textAlign: 'center', color: '#9ca3af', fontSize: 14,
          }}>
            Belum ada catatan bulan ini
          </div>
        ) : (
          monthlyTransactions.map(t => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              backgroundColor: '#fff', borderRadius: 12, padding: 14,
              marginBottom: 6,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: t.type === 'income' ? '#dcfce7' : '#fef2f2',
                flexShrink: 0,
              }}>
                {t.type === 'income'
                  ? <ArrowUpRight size={18} color="#16a34a" />
                  : <ArrowDownRight size={18} color="#dc2626" />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.description}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                  {formatDate(t.date)} · {t.category}
                </div>
              </div>
              <div style={{
                fontSize: 14, fontWeight: 700, flexShrink: 0,
                color: t.type === 'income' ? '#16a34a' : '#dc2626',
              }}>
                {t.type === 'income' ? '+' : '-'}{formatRp(t.amount)}
              </div>
            </div>
          ))
        )}
      </div>

      <TransactionForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
