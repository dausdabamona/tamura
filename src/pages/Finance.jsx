import { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import { db } from '../db/database'
import { formatRp, formatDate, BULAN } from '../utils/format'
import { useDexieQuery } from '../hooks/useDexieQuery'
import TransactionForm from '../components/TransactionForm'

export default function Finance() {
  const [showForm, setShowForm] = useState(false)

  const now = new Date()
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

  const transactions = useDexieQuery(
    () => db.transactions.toArray(),
    [],
    ['transactions']
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
    <div style={{ paddingBottom: 90 }}>
      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 10, padding: '20px 20px 0' }}>
        <div style={{
          flex: 1, backgroundColor: '#ecfdf5', borderRadius: 16, padding: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>Masuk</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>{formatRp(income)}</div>
        </div>
        <div style={{
          flex: 1, backgroundColor: '#fef2f2', borderRadius: 16, padding: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>Keluar</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#dc2626' }}>{formatRp(expense)}</div>
        </div>
      </div>

      {/* Profit card */}
      <div style={{ padding: '10px 20px 0' }}>
        <div style={{
          backgroundColor: profit >= 0 ? '#ecfdf5' : '#fef2f2', borderRadius: 16, padding: 16,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', marginBottom: 6 }}>Keuntungan Bulan Ini</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: profit >= 0 ? '#16a34a' : '#dc2626' }}>
            {formatRp(profit)}
          </div>
        </div>
      </div>

      {/* List header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 20px 12px',
      }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>
          Catatan {BULAN[now.getMonth()]}
        </span>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px',
            fontSize: 16, fontWeight: 800, color: '#fff', backgroundColor: '#0f766e',
            borderRadius: 14, border: 'none', cursor: 'pointer', minHeight: 52,
          }}
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} /> Catat
        </button>
      </div>

      {/* Transaction list */}
      <div style={{ padding: '0 20px' }}>
        {monthlyTransactions.length === 0 ? (
          <div style={{
            backgroundColor: '#fff', borderRadius: 16, padding: 28,
            textAlign: 'center', color: '#9ca3af', fontSize: 16,
          }}>
            Belum ada catatan bulan ini
          </div>
        ) : (
          monthlyTransactions.map(t => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              backgroundColor: '#fff', borderRadius: 16, padding: 16,
              marginBottom: 8,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: t.type === 'income' ? '#dcfce7' : '#fef2f2',
                flexShrink: 0,
              }}>
                {t.type === 'income'
                  ? <ArrowUpRight size={22} color="#16a34a" />
                  : <ArrowDownRight size={22} color="#dc2626" />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.description}
                </div>
                <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 2 }}>
                  {formatDate(t.date)} · {t.category}
                </div>
              </div>
              <div style={{
                fontSize: 16, fontWeight: 800, flexShrink: 0,
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
