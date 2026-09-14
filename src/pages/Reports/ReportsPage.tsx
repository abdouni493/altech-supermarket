import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReactToPrint } from 'react-to-print'
import { format, startOfMonth } from 'date-fns'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { BarChart3, Printer, Loader2, TrendingUp, TrendingDown, ShoppingCart, Wallet, HardHat, Boxes, Users, Tags, Landmark, Percent } from 'lucide-react'
import { PageHeader } from '@/components/ui/Misc'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useSalesStore } from '@/store/useSalesStore'
import { usePurchaseStore } from '@/store/usePurchaseStore'
import { useExpenseStore } from '@/store/useExpenseStore'
import { useWorkerStore } from '@/store/useWorkerStore'
import { useProductStore } from '@/store/useProductStore'
import { useClientStore } from '@/store/useClientStore'
import { useSupplierStore } from '@/store/useSupplierStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useCaisseStore } from '@/store/useCaisseStore'
import { useTranslation } from '@/i18n/useTranslation'
import { formatMoney } from '@/utils/helpers'
import {
  sumSales,
  sumPurchases,
  sumExpenses,
  sumSalaries,
  topProducts,
  topClients,
  clientStats,
  supplierStats,
  remaining,
  caissePeriodStats,
  categoryBreakdown,
  periodSoldProducts,
  productSalesAnalysis,
} from '@/utils/calculations'

// Categorical palette — validated for CVD separation and contrast (dataviz skill).
const CAT_COLORS = ['#0369A1', '#B45309', '#0891B2', '#15803D', '#7C3AED', '#BE185D', '#0D9488', '#9F1239']

const SummaryCard = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) => (
  <div className="card-wood rounded-2xl p-4">
    <div className="flex items-center justify-between">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${color}`}>{icon}</div>
    </div>
    <p className="mt-3 text-xs text-wood-medium">{label}</p>
    <p className="text-mono text-xl font-bold text-wood-dark">{formatMoney(value)}</p>
  </div>
)

export const ReportsPage = () => {
  const { t } = useTranslation()
  const sales = useSalesStore((s) => s.sales)
  const purchases = usePurchaseStore((s) => s.purchases)
  const expenses = useExpenseStore((s) => s.expenses)
  const workers = useWorkerStore((s) => s.workers)
  const products = useProductStore((s) => s.products)
  const clients = useClientStore((s) => s.clients)
  const suppliers = useSupplierStore((s) => s.suppliers)
  const settings = useSettingsStore((s) => s.settings)
  const transactions = useCaisseStore((s) => s.transactions)

  const [from, setFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<ReturnType<typeof buildReport> | null>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({ content: () => printRef.current })

  function buildReport() {
    const start = new Date(from)
    const end = new Date(to + 'T23:59:59')
    const inRange = (d: string) => new Date(d) >= start && new Date(d) <= end

    const periodSales = sales.filter((s) => inRange(s.date))
    const periodPurchases = purchases.filter((p) => inRange(p.date))
    const periodExpenses = expenses.filter((e) => inRange(e.date))

    const totalSales = sumSales(sales, start, end)
    const totalPurchases = sumPurchases(purchases, start, end)
    const totalExpenses = sumExpenses(expenses, start, end)
    const totalSalaries = sumSalaries(workers, start, end)

    // Product margin / velocity analysis over the period
    const soldProducts = periodSoldProducts(sales, products, start, end)
    const grossMargin = soldProducts.reduce((s, r) => s + r.gain, 0)
    const cogs = soldProducts.reduce((s, r) => s + r.cost, 0)
    const unitsSold = soldProducts.reduce((s, r) => s + r.quantity, 0)
    const velocity = productSalesAnalysis(sales, products, start, end)
    const bestSellers = velocity.filter((r) => r.quantity > 0).slice(0, 8)
    const slowMovers = [...velocity].sort((a, b) => a.quantity - b.quantity).slice(0, 8)
    const cats = categoryBreakdown(sales, purchases, products, start, end)
    const caisse = caissePeriodStats(transactions, sales, purchases, expenses, workers, start, end)
    const marginPct = totalSales > 0 ? (grossMargin / totalSales) * 100 : 0

    return {
      start,
      end,
      totalSales,
      totalPurchases,
      totalExpenses,
      totalSalaries,
      netProfit: totalSales - totalPurchases - totalExpenses - totalSalaries,
      periodSales,
      periodPurchases,
      periodExpenses,
      topProducts: topProducts(periodSales, 10),
      topClients: topClients(periodSales, 10),
      soldProducts,
      grossMargin,
      cogs,
      unitsSold,
      marginPct,
      bestSellers,
      slowMovers,
      cats,
      caisse,
      clientDebts: clients.map((c) => ({ ...c, ...clientStats(c.id, sales) })).filter((c) => c.totalDebt > 0),
      supplierDebts: suppliers.map((s) => ({ ...s, ...supplierStats(s.id, purchases) })).filter((s) => s.totalDebt > 0),
      lowStock: products.filter((p) => p.quantity <= p.minQuantity),
      salaryPayments: workers.flatMap((w) => w.payments.filter((p) => inRange(p.date)).map((p) => ({ ...p, worker: w.fullName }))),
    }
  }

  const generate = () => {
    setLoading(true)
    setReport(null)
    setTimeout(() => {
      setReport(buildReport())
      setLoading(false)
    }, 700)
  }

  return (
    <div>
      <PageHeader
        title={t('reports')}
        actions={report && <Button variant="gold" onClick={handlePrint}><Printer size={16} />{t('printReport')}</Button>}
      />

      <div className="card-wood mb-5 flex flex-wrap items-end gap-3 rounded-2xl p-4">
        <div>
          <label className="label-wood">{t('from')}</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-wood" />
        </div>
        <div>
          <label className="label-wood">{t('to')}</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-wood" />
        </div>
        <Button onClick={generate}><BarChart3 size={16} />{t('generateReport')}</Button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="animate-spin text-wood-warm" size={40} />
            <p className="text-sm text-wood-medium">{t('loading')}</p>
          </motion.div>
        ) : report ? (
          <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} ref={printRef} className="print-area space-y-6">
            {/* Print header */}
            <div className="hidden print:block">
              <h1 className="text-display text-2xl font-bold text-wood-dark">{settings.name}</h1>
              <p className="text-sm text-wood-medium">{t('reports')} — {format(report.start, 'dd/MM/yyyy')} → {format(report.end, 'dd/MM/yyyy')}</p>
            </div>

            {/* Financial summary */}
            <section>
              <h2 className="mb-3 text-display text-xl font-bold text-wood-dark">{t('financialSummary')}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <SummaryCard label={t('totalSales')} value={report.totalSales} color="bg-sage" icon={<TrendingUp size={18} />} />
                <SummaryCard label={t('totalPurchasesReport')} value={report.totalPurchases} color="bg-wood-warm" icon={<ShoppingCart size={18} />} />
                <SummaryCard label={t('totalExpenses')} value={report.totalExpenses} color="bg-terracotta" icon={<Wallet size={18} />} />
                <SummaryCard label={t('totalSalaries')} value={report.totalSalaries} color="bg-gold" icon={<HardHat size={18} />} />
                <SummaryCard label={t('grossMargin')} value={report.grossMargin} color="bg-cyan-700" icon={<Percent size={18} />} />
                <div className="card-wood rounded-2xl bg-wood-btn p-4 text-white">
                  <p className="text-xs opacity-90">{t('netProfit')}</p>
                  <p className="text-mono mt-2 text-xl font-bold">{formatMoney(report.netProfit)}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="card-wood rounded-xl p-3"><p className="text-[11px] text-wood-medium">{t('unitsSold')}</p><p className="text-mono text-lg font-bold text-wood-dark">{report.unitsSold}</p></div>
                <div className="card-wood rounded-xl p-3"><p className="text-[11px] text-wood-medium">{t('cogs')}</p><p className="text-mono text-lg font-bold text-wood-dark">{formatMoney(report.cogs)}</p></div>
                <div className="card-wood rounded-xl p-3"><p className="text-[11px] text-wood-medium">{t('marginRate')}</p><p className="text-mono text-lg font-bold text-sage">{report.marginPct.toFixed(1)} %</p></div>
                <div className="card-wood rounded-xl p-3"><p className="text-[11px] text-wood-medium">{t('avgBasket')}</p><p className="text-mono text-lg font-bold text-wood-dark">{formatMoney(report.periodSales.length ? report.totalSales / report.periodSales.length : 0)}</p></div>
              </div>
            </section>

            {/* Caisse / treasury summary */}
            <section className="card-wood rounded-2xl p-5">
              <h2 className="mb-3 flex items-center gap-2 text-display text-lg font-bold text-wood-dark"><Landmark size={18} className="text-wood-warm" />{t('caisse')} — {t('financialSummary')}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { l: t('cashIn'), v: report.caisse.cashIn, c: 'text-sage' },
                  { l: t('cashOut'), v: report.caisse.cashOut, c: 'text-terracotta' },
                  { l: t('netFlow'), v: report.caisse.netFlow, c: report.caisse.netFlow >= 0 ? 'text-sage' : 'text-terracotta' },
                  { l: `${t('collected')} ${t('sales')}`, v: report.caisse.salesCollected, c: 'text-wood-dark' },
                  { l: `${t('paid')} ${t('purchase')}`, v: report.caisse.purchasesPaid, c: 'text-wood-dark' },
                  { l: t('salariesPaid'), v: report.caisse.salaries, c: 'text-wood-dark' },
                ].map((x) => (
                  <div key={x.l} className="rounded-xl bg-wood-cream/40 p-3">
                    <p className="truncate text-[11px] text-wood-medium">{x.l}</p>
                    <p className={`text-mono text-base font-bold ${x.c}`}>{formatMoney(x.v)}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Product sales analysis — fast & slow movers */}
            <section className="card-wood rounded-2xl p-5">
              <h2 className="mb-4 flex items-center gap-2 text-display text-lg font-bold text-wood-dark"><BarChart3 size={18} className="text-wood-warm" />{t('salesAnalysis')}</h2>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-sage"><TrendingUp size={16} />{t('bestSellers')}</h3>
                  {report.bestSellers.length > 0 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={report.bestSellers} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#0EA5E940" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 9, fill: '#64748B' }} />
                        <Tooltip formatter={(v: number) => `${v}`} contentStyle={{ borderRadius: 12, border: '1px solid #0369A140' }} />
                        <Bar dataKey="quantity" name={t('qtySold')} fill="#0369A1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  <ReportTable
                    head={[t('productName'), t('qtySold'), t('sales'), t('margin')]}
                    rows={report.bestSellers.map((p) => [p.name, `${p.quantity}`, formatMoney(p.revenue), formatMoney(p.gain)])}
                  />
                </div>
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-terracotta"><TrendingDown size={16} />{t('slowMovers')}</h3>
                  <ReportTable
                    head={[t('productName'), t('category'), t('qtySold'), t('sales')]}
                    rows={report.slowMovers.map((p) => [p.name, p.category, `${p.quantity}`, formatMoney(p.revenue)])}
                  />
                  <p className="mt-2 text-xs text-wood-medium/70">{t('slowMoversHint')}</p>
                </div>
              </div>
            </section>

            {/* Category analysis */}
            <section className="card-wood rounded-2xl p-5">
              <h2 className="mb-4 flex items-center gap-2 text-display text-lg font-bold text-wood-dark"><Tags size={18} className="text-wood-warm" />{t('categoryAnalysis')}</h2>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {report.cats.length > 0 && (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={report.cats} dataKey="salesRevenue" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={(e) => e.category}>
                        {report.cats.map((_, i) => (
                          <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatMoney(v)} contentStyle={{ borderRadius: 12, border: '1px solid #0369A140' }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <ReportTable
                  head={[t('category'), t('sales'), t('purchase'), t('netProfit')]}
                  rows={report.cats.map((c) => [c.category, formatMoney(c.salesRevenue), formatMoney(c.purchasesCost), formatMoney(c.gain)])}
                />
              </div>
            </section>

            {/* Sales detail */}
            <section className="card-wood rounded-2xl p-5">
              <h2 className="mb-3 flex items-center gap-2 text-display text-lg font-bold text-wood-dark"><TrendingUp size={18} className="text-sage" />{t('salesDetailed')}</h2>
              {report.topProducts.length > 0 && (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={report.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0EA5E940" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #0369A140' }} />
                    <Bar dataKey="quantity" name={t('quantity')} fill="#0369A1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              <ReportTable
                head={[t('reference'), t('client'), t('date'), t('total'), t('status')]}
                rows={report.periodSales.map((s) => [s.reference, s.clientName, format(new Date(s.date), 'dd/MM/yyyy'), formatMoney(s.total), s.paid >= s.total ? t('statusPaid') : t('inDebt')])}
              />
            </section>

            {/* Top clients */}
            <section className="card-wood rounded-2xl p-5">
              <h2 className="mb-3 flex items-center gap-2 text-display text-lg font-bold text-wood-dark"><Users size={18} className="text-wood-warm" />{t('topClients')}</h2>
              <ReportTable head={['#', t('client'), t('amount')]} rows={report.topClients.map((c, i) => [`${i + 1}`, c.name, formatMoney(c.amount)])} />
            </section>

            {/* Purchases detail */}
            <section className="card-wood rounded-2xl p-5">
              <h2 className="mb-3 flex items-center gap-2 text-display text-lg font-bold text-wood-dark"><ShoppingCart size={18} className="text-wood-medium" />{t('purchasesDetailed')}</h2>
              <ReportTable
                head={[t('reference'), t('supplier'), t('date'), t('total'), t('paid'), t('remaining')]}
                rows={report.periodPurchases.map((p) => [p.reference, p.supplierName, format(new Date(p.date), 'dd/MM/yyyy'), formatMoney(p.total), formatMoney(p.paid), formatMoney(remaining(p.total, p.paid))])}
              />
            </section>

            {/* Debts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="card-wood rounded-2xl p-5">
                <h2 className="mb-3 text-display text-lg font-bold text-wood-dark">{t('clientDebts')}</h2>
                <ReportTable head={[t('client'), t('totalDebt')]} rows={report.clientDebts.map((c) => [c.name, formatMoney(c.totalDebt)])} />
              </section>
              <section className="card-wood rounded-2xl p-5">
                <h2 className="mb-3 text-display text-lg font-bold text-wood-dark">{t('supplierDebts')}</h2>
                <ReportTable head={[t('supplier'), t('totalDebt')]} rows={report.supplierDebts.map((s) => [s.name, formatMoney(s.totalDebt)])} />
              </section>
            </div>

            {/* Expenses + salaries */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="card-wood rounded-2xl p-5">
                <h2 className="mb-3 flex items-center gap-2 text-display text-lg font-bold text-wood-dark"><Wallet size={18} className="text-terracotta" />{t('expenses')}</h2>
                <ReportTable head={[t('name'), t('date'), t('amount')]} rows={report.periodExpenses.map((e) => [e.name, format(new Date(e.date), 'dd/MM/yyyy'), formatMoney(e.amount)])} />
              </section>
              <section className="card-wood rounded-2xl p-5">
                <h2 className="mb-3 flex items-center gap-2 text-display text-lg font-bold text-wood-dark"><HardHat size={18} className="text-gold" />{t('totalSalaries')}</h2>
                <ReportTable head={[t('workers'), t('period'), t('amount')]} rows={report.salaryPayments.map((p) => [p.worker, p.period, formatMoney(p.amount)])} />
              </section>
            </div>

            {/* Stock */}
            <section className="card-wood rounded-2xl p-5">
              <h2 className="mb-3 flex items-center gap-2 text-display text-lg font-bold text-wood-dark"><Boxes size={18} className="text-wood-warm" />{t('stockReport')} — {t('stockAlerts')}</h2>
              {report.lowStock.length === 0 ? (
                <div className="py-4 text-center"><Badge tone="paid">{t('inStock')}</Badge></div>
              ) : (
                <ReportTable head={[t('productName'), t('quantity'), t('minQuantity')]} rows={report.lowStock.map((p) => [p.name, `${p.quantity}`, `${p.minQuantity}`])} />
              )}
            </section>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-wood flex flex-col items-center gap-3 rounded-2xl py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-wood-cream text-wood-light"><BarChart3 size={40} /></div>
            <p className="text-sm text-wood-medium">{t('selectPeriod')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ReportTable = ({ head, rows }: { head: string[]; rows: string[][] }) => {
  const { t } = useTranslation()
  if (rows.length === 0) return <p className="py-4 text-center text-sm text-wood-medium">{t('noData')}</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-wood-light/40 text-start text-xs uppercase text-wood-medium">
            {head.map((h, i) => (
              <th key={i} className={`py-2 ${i === 0 ? 'text-start' : i >= 3 ? 'text-end' : 'text-start'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-wood-cream">
              {row.map((cell, j) => (
                <td key={j} className={`py-2 ${j === 0 ? 'font-medium text-wood-dark' : j >= 3 ? 'text-mono text-end' : 'text-wood-medium'}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
