// Dashboard.tsx
let cachedData: BranchCashData[] | null = null;

import { useEffect, useState } from "react";
import {
    BranchesService,
    CashSessionService,
    type BranchModel,
    type CashSessionModel,
    type CashSessionDetailsModel,
} from "../api/branchesService";

interface BranchCashData {
    branch: BranchModel;
    session: CashSessionModel | null;
    details: CashSessionDetailsModel | null;
    loading: boolean;
    error: string | null;
}

const fmt = (n: number | null | undefined) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    }).format(n ?? 0);

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });

function SectionCard({
    title,
    rows,
    total,
    totalLabel = "Total",
}: {
    title: string;
    rows: { label: string; value: number | null | undefined; sub?: { label: string; value: number | null | undefined } }[];
    total: number | null | undefined;
    totalLabel?: string;
}) {
    return (
        <div className="scs-card">
            <div className="scs-card__title">{title}</div>
            <div className="scs-card__body">
                <div className="scs-rows">
                    {rows.map((r, i) => (
                        <div key={i} className="scs-row-group">
                            <div className="scs-row">
                                <span className="scs-row__label">{r.label}</span>
                                <span className="scs-row__value">{fmt(r.value)}</span>
                            </div>
                            {r.sub && (
                                <div className="scs-row scs-row--sub">
                                    <span className="scs-row__label">{r.sub.label}</span>
                                    <span className="scs-row__value">{fmt(r.sub.value)}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="scs-divider" />
                <div className="scs-row scs-row--total">
                    <span className="scs-row__label">{totalLabel}</span>
                    <span className="scs-row__value">{fmt(total)}</span>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="scs-detail-row">
            <span className="scs-detail-row__label">{label}</span>
            <span className="scs-detail-row__value">{value}</span>
        </div>
    );
}

function BranchCashPanel({ data }: { data: BranchCashData }) {
    const { branch, session, details, loading, error } = data;

    const totalCashOutflowsWithoutPersonal = details
        ? (details.totalSuppliers ?? 0) + (details.totalTransport ?? 0) +
        (details.totalEmployees ?? 0) + (details.totalOther ?? 0)
        : 0;

    const subTotalCashExpensesV2 = details
        ? (details.cashExpensesLocal ?? 0) + (details.cashExpensesEmployee ?? 0) +
        (details.cashExpensesServices ?? 0) + (details.cashExpensesTransports ?? 0) +
        (details.cashExpensesCounter ?? 0) + (details.cashExpensesAFIP ?? 0) +
        (details.cashExpensesBags ?? 0) + (details.cashExpensesTrips ?? 0) +
        (details.cashExpensesOther ?? 0) + (details.cashExpensesRemodeling ?? 0)
        : 0;

    return (
        <div className="scs-branch-panel">
            <div className="scs-branch-panel__header">
                <div className="scs-branch-panel__header-left">
                    <h2 className="scs-branch-panel__name">{branch.name}</h2>
                    {branch.address && (
                        <span className="scs-branch-panel__address">{branch.address}</span>
                    )}
                </div>
                {session && (
                    <span className="scs-branch-panel__date">
                        Caja abierta: {fmtDate(session.openedAt)}
                    </span>
                )}
            </div>

            {loading && (
                <div className="scs-state scs-state--loading">
                    <div className="scs-spinner" />
                    <span>Cargando datos de caja…</span>
                </div>
            )}

            {error && (
                <div className="scs-state scs-state--error">
                    <span>⚠ {error}</span>
                </div>
            )}

            {!loading && !error && !details && (
                <div className="scs-state scs-state--empty">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <path d="M21 8L12 3L3 8v8l9 5 9-5V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M12 3v13M3 8l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M7.5 5.5L16.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <p>No hay caja abierta en esta sucursal</p>
                </div>
            )}

            {!loading && !error && details && (
                <div className="scs-panel-grid">
                    {/* Fila 1: 4 cards */}
                    <SectionCard
                        title="Ventas totales"
                        totalLabel="Total con recargos"
                        total={details.totalSales}
                        rows={[
                            { label: "Efectivo", value: details.totalCash },
                            { label: "Transferencia", value: details.totalTransfer },
                            { label: "Tarjeta de crédito", value: details.totalCreditCard },
                            { label: "Tarjeta de débito", value: details.totalDebitCard },
                            { label: "Vouchers", value: details.totalVentaVouchers },
                            { label: "Saldo a favor", value: details.totalClientBalanceInFavor },
                            { label: "Saldo deudor", value: details.totalClientDebitBalance },
                        ]}
                    />
                    <SectionCard
                        title="Egresos"
                        total={totalCashOutflowsWithoutPersonal}
                        rows={[
                            { label: "Retiros personales", value: details.totalPersonalRetreat },
                            { label: "Caja chica", value: details.totalSuppliers },
                            { label: "Retiros para el local", value: details.totalTransport },
                            { label: "Retiros del empleado", value: details.totalEmployees },
                            { label: "Otros", value: details.totalOther },
                        ]}
                    />
                    <SectionCard
                        title="Dinero en caja"
                        total={details.totalCashAvailable}
                        rows={[
                            { label: "Dinero inicial", value: details.initialCashRegister },
                            { label: "Depósitos", value: details.totalCashDeposits },
                            { label: "Venta efectivo", value: details.totalCash },
                            { label: "Venta voucher efectivo", value: details.totalVentaVouchersEfectivo },
                            { label: "Depósito de señas", value: details.cashDeposits },
                            { label: "Pagos de clientes", value: details.cashClientsPayments },
                            { label: "Total retiros", value: -(details.totalCashOutflows ?? 0) },
                            { label: "Total gastos", value: -subTotalCashExpensesV2 },
                        ]}
                    />
                    <SectionCard
                        title="Señas"
                        total={details.totalDeposits}
                        rows={[
                            { label: "En efectivo", value: details.cashDeposits },
                            { label: "En transferencia", value: details.transferDeposits },
                        ]}
                    />

                    {/* Fila 2: 3 cards */}
                    <SectionCard
                        title="Pagos de clientes"
                        total={details.clientsPayments}
                        rows={[
                            { label: "Efectivo", value: details.cashClientsPayments },
                            { label: "Transferencia", value: details.transferClientsPayments },
                            { label: "Débito", value: details.debitClientsPayments },
                            { label: "Crédito", value: details.creditClientsPayments },
                        ]}
                    />

                    <SectionCard
                        title="Vouchers"
                        total={details.totalVentaVouchers}
                        totalLabel="Total venta"
                        rows={[
                            { label: "Total canjeo", value: details.totalCanjeoVouchers },
                        ]}
                    />

                    {/* Detalle */}
                    <div className="scs-card">
                        <div className="scs-card__title">Detalle de caja</div>
                        <div className="scs-card__body">
                            <DetailItem label="Cant. de ventas" value={details.salesQuantity ?? 0} />
                            <DetailItem label="Cant. de productos vendidos" value={details.quantityOfProductsSold ?? 0} />
                            <DetailItem label="Cant. de devoluciones" value={details.exchangeQuantity ?? 0} />
                            <DetailItem label="Cant. de productos devueltos" value={details.quantityOfReturnedProducts ?? 0} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const [branchesData, setBranchesData] = useState<BranchCashData[]>(() => cachedData ?? []);
    const [globalLoading, setGlobalLoading] = useState(() => !cachedData);
    const [globalError, setGlobalError] = useState<string | null>(null);

    useEffect(() => {
        const loadAll = async () => {
            setGlobalLoading(true);
            setGlobalError(null);

            let branches: BranchModel[];
            try {
                branches = await BranchesService.getAll();
            } catch (e) {
                setGlobalError("No se pudieron cargar las sucursales. Verificá la conexión con la API.");
                setGlobalLoading(false);
                return;
            }

            setBranchesData(
                branches.map((branch) => ({
                    branch, session: null, details: null, loading: true, error: null,
                }))
            );
            setGlobalLoading(false);

            await Promise.all(
                branches.map(async (branch, index) => {
                    try {
                        const details = await CashSessionService.getDetailsByBranchId(branch.id);
                        setBranchesData((prev) =>
                            prev.map((item, i) => i === index ? { ...item, session: null, details, loading: false } : item)
                        );
                    } catch (e) {
                        setBranchesData((prev) =>
                            prev.map((item, i) => i === index ? { ...item, loading: false, error: "Error al cargar datos de esta caja." } : item)
                        );
                    }
                })
            );

            setBranchesData((prev) => {
                cachedData = prev;
                return prev;
            });
        };
        loadAll();
    }, []);

    return (
        <>
            <style>{CSS}</style>
            <div className="scs-dashboard">
                <header className="scs-header">
                    <h1 className="scs-header__title">Información de cajas</h1>
                    <p className="scs-header__sub">Información general de cajas del día o no cerradas</p>
                </header>

                {globalLoading && (
                    <div className="scs-global-loading">
                        <div className="scs-spinner scs-spinner--lg" />
                        <span>Cargando sucursales…</span>
                    </div>
                )}
                {globalError && (
                    <div className="scs-global-error"><strong>Error:</strong> {globalError}</div>
                )}
                {!globalLoading && !globalError && (
                    <div className="scs-branches-grid">
                        {branchesData.map((d) => (
                            <BranchCashPanel key={d.branch.id} data={d} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');

  :root {
    --bg:         #FAF6F1;
    --surface:    #ffffff;
    --surface-2:  #F5EFE7;
    --accent:     #DCC7AF;
    --accent-dark:#BFAEA3;
    --accent-text:#5c4a3a;
    --text-1:     #111827;
    --text-2:     #4b5563;
    --text-3:     #9ca3af;
    --border:     #e5e7eb;
    --radius:     14px;
    --shadow:     0 1px 3px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.05);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text-1);
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .scs-dashboard {
    max-width: 1400px;
    margin: 0 auto;
    padding: 36px 24px 60px;
  }

  .scs-header { margin-bottom: 32px; }
  .scs-header__title {
    font-family: 'DM Serif Display', serif;
    font-size: 2rem;
    color: var(--text-1);
    letter-spacing: -.02em;
  }
  .scs-header__sub { font-size: .9rem; color: var(--text-3); margin-top: 4px; }

  .scs-branches-grid { display: flex; flex-direction: column; gap: 24px; }

  /* Panel por sucursal */
  .scs-branch-panel {
    background: var(--surface);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .scs-branch-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
  }
  .scs-branch-panel__header-left {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .scs-branch-panel__name { font-size: 1.1rem; font-weight: 600; color: var(--text-1); }
  .scs-branch-panel__address { font-size: .8rem; color: var(--text-3); }
  .scs-branch-panel__date {
    font-size: .78rem;
    color: var(--accent-text);
    background: #F5EFE7;
    border: 1px solid var(--accent);
    padding: 3px 12px;
    border-radius: 20px;
    font-weight: 500;
    white-space: nowrap;
  }

  /* Grid de cards — 4 columnas iguales */
  .scs-panel-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 16px 24px 20px;
  }

  @media (max-width: 1100px) {
    .scs-panel-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .scs-panel-grid { grid-template-columns: 1fr; padding: 12px; }
    .scs-dashboard { padding: 16px 12px 40px; }
  }

  /* Cards */
  .scs-card {
    background: var(--surface-2);
    border-radius: 10px;
    overflow: hidden;
  }

  .scs-card__title {
    background: var(--accent);
    color: var(--accent-text);
    font-size: .72rem;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    padding: 7px 14px;
  }

  .scs-card__body { padding: 12px 14px; }

  .scs-rows { display: flex; flex-direction: column; gap: 5px; }

  .scs-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }
  .scs-row--sub { padding-left: 12px; }
  .scs-row--total { margin-top: 8px; }

  .scs-row__label {
    font-size: .8rem;
    color: var(--text-2);
    min-width: 0;
    flex: 1;
    text-align: left;
  }
  .scs-row--sub .scs-row__label { font-size: .74rem; color: var(--text-3); }

  .scs-row__value {
    font-size: .8rem;
    font-weight: 600;
    color: var(--text-1);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .scs-row--sub .scs-row__value { font-size: .74rem; color: var(--text-3); }

  .scs-row--total .scs-row__label { font-size: .84rem; font-weight: 700; color: var(--text-1); }
  .scs-row--total .scs-row__value { font-size: .84rem; font-weight: 700; color: var(--accent-text); }

  .scs-divider { height: 1px; background: var(--border); margin: 8px 0; }

  /* Detalle rows */
  .scs-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid var(--border);
    font-size: .8rem;
  }
  .scs-detail-row:last-child { border-bottom: none; }
  .scs-detail-row__label { color: var(--text-2); }
  .scs-detail-row__value { font-weight: 700; color: var(--text-1); }

  /* Estados */
  .scs-state {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px;
    padding: 40px 24px; color: var(--text-3); font-size: .88rem;
  }
  .scs-state--error { color: #ef4444; background: #fef2f2; }

  .scs-spinner {
    width: 22px; height: 22px;
    border: 2.5px solid var(--border);
    border-top-color: var(--accent-dark);
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  .scs-spinner--lg { width: 34px; height: 34px; }
  @keyframes spin { to { transform: rotate(360deg); } }

.scs-global-loading {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 32px;
  font-size: .95rem;
  color: var(--text-2);
}

.scs-global-error {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 32px;
  font-size: .95rem;
  color: #ef4444;
}`;