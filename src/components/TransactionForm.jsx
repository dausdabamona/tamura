import { useState } from 'react'
import { db } from '../db/database'
import { formatRp } from '../utils/format'
import Modal from './Modal'

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  fontSize: 17,
  border: '2px solid #e5e7eb',
  borderRadius: 14,
  outline: 'none',
  backgroundColor: '#fff',
  minHeight: 52,
}

const labelStyle = {
  display: 'block',
  fontSize: 16,
  fontWeight: 700,
  marginBottom: 8,
  color: '#374151',
}

const groupStyle = { marginBottom: 18 }

const EXPENSE_CATEGORIES = ['Supply', 'Transport', 'Perbaikan', 'Lainnya']
const INCOME_CATEGORIES = ['Booking', 'Trip/Tour', 'Lainnya']

export default function TransactionForm({ open, onClose }) {
  const [type, setType] = useState('income')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const color = type === 'income' ? '#0f766e' : '#dc2626'

  async function handleSave() {
    if (!amount || !description.trim()) return
    setSaving(true)
    try {
      await db.transactions.add({
        date: new Date().toISOString().split('T')[0],
        type,
        amount: Number(amount),
        category: category || categories[0],
        description: description.trim(),
        bookingId: null,
        createdAt: new Date().toISOString(),
      })
      resetForm()
      onClose()
    } catch (e) {
      console.error('Error saving transaction:', e)
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setType('income')
    setAmount('')
    setCategory('')
    setDescription('')
  }

  return (
    <Modal open={open} onClose={() => { resetForm(); onClose() }} title="Catat Transaksi">
      {/* Toggle */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          style={{
            flex: 1, padding: 16, borderRadius: 14, fontSize: 17, fontWeight: 800,
            border: `2px solid ${type === 'income' ? '#0f766e' : '#e5e7eb'}`,
            backgroundColor: type === 'income' ? '#ecfdf5' : '#fff',
            color: type === 'income' ? '#0f766e' : '#6b7280',
            cursor: 'pointer', minHeight: 56,
          }}
          onClick={() => { setType('income'); setCategory('') }}
        >
          Uang Masuk
        </button>
        <button
          style={{
            flex: 1, padding: 16, borderRadius: 14, fontSize: 17, fontWeight: 800,
            border: `2px solid ${type === 'expense' ? '#dc2626' : '#e5e7eb'}`,
            backgroundColor: type === 'expense' ? '#fef2f2' : '#fff',
            color: type === 'expense' ? '#dc2626' : '#6b7280',
            cursor: 'pointer', minHeight: 56,
          }}
          onClick={() => { setType('expense'); setCategory('') }}
        >
          Uang Keluar
        </button>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Jumlah (Rp) *</label>
        <input
          style={inputStyle}
          type="number"
          placeholder="0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        {amount > 0 && (
          <div style={{ fontSize: 15, color: '#6b7280', marginTop: 6 }}>
            = {formatRp(Number(amount))}
          </div>
        )}
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Kategori</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {categories.map(c => (
            <button
              key={c}
              style={{
                padding: '10px 18px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                border: `2px solid ${(category || categories[0]) === c ? color : '#e5e7eb'}`,
                backgroundColor: (category || categories[0]) === c ? (type === 'income' ? '#ecfdf5' : '#fef2f2') : '#fff',
                color: (category || categories[0]) === c ? color : '#6b7280',
                cursor: 'pointer', minHeight: 44,
              }}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle}>Keterangan *</label>
        <input
          style={inputStyle}
          type="text"
          placeholder={type === 'expense' ? 'contoh: Beli beras, ikan, sayur' : 'contoh: Pembayaran tamu'}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <button
        style={{
          width: '100%', padding: 16, fontSize: 18, fontWeight: 800,
          color: '#fff', backgroundColor: saving ? '#9ca3af' : color,
          borderRadius: 14, border: 'none', minHeight: 56,
          cursor: saving ? 'default' : 'pointer',
        }}
        disabled={saving || !amount || !description.trim()}
        onClick={handleSave}
      >
        {saving ? 'Menyimpan...' : 'Simpan'}
      </button>
    </Modal>
  )
}
