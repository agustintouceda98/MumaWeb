// src/pages/Productos.tsx
import { useEffect, useState, useCallback } from "react";
import {
    ProductsService,
    type ProductModel,
    type FilterInventoryModel,
    type ProductVariantStockModel,
    type ProductVariantStockItemModel,
} from "../api/productsService";

// ── Constants ─────────────────────────────────────────────────
const PAGE_SIZE = 15;

// ── Helpers ───────────────────────────────────────────────────
const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    }).format(n);

// ── Variants Modal ────────────────────────────────────────────
function VariantsModal({
    product,
    onClose,
}: {
    product: ProductModel;
    onClose: () => void;
}) {
    const [data, setData] = useState<ProductVariantStockModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        ProductsService.getListVariants(product.id)
            .then((res) => setData(res))
            .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar variantes."))
            .finally(() => setLoading(false));
    }, [product.id]);

    // Close on backdrop click
    const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    const totalGeneral = data?.variants?.reduce((s, v) => s + v.totalQuantity, 0) ?? 0;
    const unitStr = totalGeneral === 1 ? "unidad" : "unidades";

    // Collect all branch names (sorted) for column headers
    const branchNames: string[] = data?.variants
        ? Array.from(
            new Set(
                data.variants.flatMap((v) =>
                    v.branches.map((b) => b.branchName)
                )
            )
        ).sort()
        : [];

    return (
        <div className="vm-backdrop" onClick={handleBackdrop}>
            <div className="vm-modal">
                {/* ── Header ── */}
                <div className="vm-modal__header">
                    <div className="vm-modal__header-left">
                        <h2 className="vm-modal__title">Stock detallado</h2>
                        <p className="vm-modal__sub">Variantes por color y talle</p>
                    </div>
                    <button className="vm-close-btn" onClick={onClose} title="Cerrar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Product info strip ── */}
                <div className="vm-info-strip">
                    <div className="vm-info-card vm-info-card--highlight">
                        <div className="vm-info-card__label">Stock total general</div>
                        <div className="vm-info-card__value">
                            {loading ? "—" : totalGeneral}
                            <span className="vm-info-card__unit">{loading ? "" : unitStr}</span>
                        </div>
                    </div>
                    <div className="vm-info-card">
                        <div className="vm-info-card__label">Detalle del producto</div>
                        <div className="vm-info-product">
                            <div className="vm-info-product__field">
                                <span className="vm-info-product__key">Nombre</span>
                                <span className="vm-info-product__val">{product.name}</span>
                            </div>
                            <div className="vm-info-product__field">
                                <span className="vm-info-product__key">Código</span>
                                <span className="vm-info-product__val">{product.code}</span>
                            </div>
                            <div className="vm-info-product__field">
                                <span className="vm-info-product__key">Precio</span>
                                <span className="vm-info-product__val">{fmt(product.retailPrice)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="vm-body">
                    {loading && (
                        <div className="vm-state">
                            <div className="prd-spinner" />
                            <span>Cargando variantes…</span>
                        </div>
                    )}
                    {!loading && error && (
                        <div className="vm-state vm-state--error">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}
                    {!loading && !error && (!data?.variants || data.variants.length === 0) && (
                        <div className="vm-state">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                                <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                            <p>No hay variantes para este producto</p>
                        </div>
                    )}

                    {!loading && !error && data?.variants && data.variants.length > 0 && (
                        <div className="vm-table-wrap">
                            {/* Table header */}
                            <div className="vm-table-head" style={{ gridTemplateColumns: `200px 80px repeat(${branchNames.length}, 1fr)` }}>
                                <span className="vm-th">Variante</span>
                                <span className="vm-th vm-th--center">Total</span>
                                {branchNames.map((b) => (
                                    <span key={b} className="vm-th vm-th--center">{b}</span>
                                ))}
                            </div>

                            {/* Rows */}
                            {data.variants.map((v, i) => (
                                <VariantRow key={i} variant={v} branchNames={branchNames} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function VariantRow({
    variant,
    branchNames,
}: {
    variant: ProductVariantStockItemModel;
    branchNames: string[];
}) {
    const getQty = (branchName: string) =>
        variant.branches.find((b) => b.branchName === branchName)?.quantity ?? 0;

    return (
        <div
            className="vm-row"
            style={{ gridTemplateColumns: `200px 80px repeat(${branchNames.length}, 1fr)` }}
        >
            {/* Variant label: color dot + name + size */}
            <span className="vm-cell vm-cell--variant">
                {variant.colorHex && (
                    <span
                        className="vm-color-dot"
                        style={{ background: variant.colorHex }}
                    />
                )}
                <span className="vm-variant-text">
                    {[variant.colorName, variant.sizeName].filter(Boolean).join(" · ")}
                </span>
            </span>

            {/* Total */}
            <span className={`vm-cell vm-cell--center vm-cell--total ${variant.totalQuantity === 0 ? "vm-cell--zero" : ""}`}>
                {variant.totalQuantity}
            </span>

            {/* Per-branch */}
            {branchNames.map((b) => {
                const qty = getQty(b);
                return (
                    <span key={b} className={`vm-cell vm-cell--center ${qty === 0 ? "vm-cell--zero" : ""}`}>
                        {qty}
                    </span>
                );
            })}
        </div>
    );
}

// ── Product Row ───────────────────────────────────────────────
function ProductRow({ product }: { product: ProductModel }) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <div className="prd-row">
                <span className="prd-cell prd-cell--code">{product.code}</span>
                <span className="prd-cell prd-cell--name" title={product.name}>{product.name}</span>
                <span className={`prd-cell prd-cell--stock ${product.stock === 0 ? "prd-cell--stock-zero" : ""}`}>
                    {product.stock === -1 ? "—" : product.stock}
                </span>
                <span className="prd-cell prd-cell--price">{fmt(product.costPrice)}</span>
                <span className="prd-cell prd-cell--price">{fmt(product.retailPrice)}</span>
                <span className="prd-cell prd-cell--actions">
                    <button
                        className="prd-icon-btn"
                        title="Ver variantes y stock por sucursal"
                        onClick={() => setModalOpen(true)}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                            <path d="M16.5 9.4 7.55 4.24" />
                            <polyline points="3.29 7 12 12 20.71 7" />
                            <line x1="12" y1="22" x2="12" y2="12" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                            <path d="M20.27 20.27 22 22" />
                        </svg>
                    </button>
                </span>
            </div>

            {modalOpen && (
                <VariantsModal product={product} onClose={() => setModalOpen(false)} />
            )}
        </>
    );
}

// ── Page ──────────────────────────────────────────────────────
export default function Productos() {
    const [products, setProducts] = useState<ProductModel[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filterText, setFilterText] = useState("");
    const [pendingFilter, setPendingFilter] = useState("");
    const [orderStock, setOrderStock] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async (pg: number, text: string, order: boolean | null) => {
        setLoading(true);
        setError(null);
        try {
            const filter: FilterInventoryModel = {
                page: pg,
                count: PAGE_SIZE,
                filterText: text || undefined,
                orderStock: order ?? undefined,
                isWeb: true
            };
            const result = await ProductsService.getByFilter(filter);
            setProducts(result.items ?? []);
            setTotal(result.totalItems ?? 0);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Error al cargar los productos.");
            setProducts([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(1, "", null); }, [loadData]);

    const handleSearch = () => {
        setFilterText(pendingFilter);
        setPage(1);
        loadData(1, pendingFilter, orderStock);
    };

    const handleOrderStock = () => {
        const next = orderStock === null ? true : orderStock ? false : null;
        setOrderStock(next);
        setPage(1);
        loadData(1, filterText, next);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        loadData(newPage, filterText, orderStock);
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, total);

    return (
        <>
            <style>{CSS}</style>
            <div className="prd-page">
                <header className="prd-header">
                    <h1 className="prd-header__title">Productos</h1>
                    <p className="prd-header__sub">Consultá el catálogo y el stock disponible</p>
                </header>

                {/* Search */}
                <div className="prd-search-bar">
                    <div className="prd-search-wrap">
                        <svg className="prd-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            className="prd-search-input"
                            type="text"
                            placeholder="Seleccioná o escaneá el producto…"
                            value={pendingFilter}
                            onChange={e => setPendingFilter(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSearch()}
                        />
                    </div>
                    <button className="prd-filter-btn" onClick={handleSearch} disabled={loading}>
                        Filtrar
                    </button>
                </div>

                {/* Table */}
                <div className="prd-table-wrap">
                    <div className="prd-table-head">
                        <span className="prd-th prd-cell--code">Código</span>
                        <span className="prd-th prd-cell--name">Nombre</span>
                        <span className="prd-th prd-cell--stock prd-th--sortable" onClick={handleOrderStock} title="Ordenar por stock">
                            Stock
                            <span className="prd-sort-icon">
                                {orderStock === null ? (
                                    <svg width="10" height="14" viewBox="0 0 10 14" fill="none"><path d="M5 1v12M1 4l4-3 4 3M1 10l4 3 4-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                ) : orderStock ? (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                ) : (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 7l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                )}
                            </span>
                        </span>
                        <span className="prd-th prd-cell--price">Precio costo</span>
                        <span className="prd-th prd-cell--price">Precio venta</span>
                        <span className="prd-th prd-cell--actions">Variantes</span>
                    </div>

                    <div className="prd-table-body">
                        {loading && (
                            <div className="prd-state">
                                <div className="prd-spinner" />
                                <span>Cargando productos…</span>
                            </div>
                        )}
                        {!loading && error && (
                            <div className="prd-state prd-state--error">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                                <span>{error}</span>
                            </div>
                        )}
                        {!loading && !error && products.length === 0 && (
                            <div className="prd-state">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" stroke="currentColor" strokeWidth="1.5" /><circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M20.27 20.27 22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                <p>No se encontraron productos</p>
                            </div>
                        )}
                        {!loading && !error && products.map(p => <ProductRow key={p.id} product={p} />)}
                    </div>
                </div>

                {/* Pagination */}
                {total > 0 && !loading && (
                    <div className="prd-pagination">
                        <button className="prd-page-btn" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <span className="prd-page-info">
                            Mostrando <strong>{from}–{to}</strong> de <strong>{total}</strong>
                        </span>
                        <button className="prd-page-btn" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

// ── CSS ───────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');

  :root {
    --bg:          #FAF6F1;
    --surface:     #ffffff;
    --surface-2:   #F5EFE7;
    --accent:      #DCC7AF;
    --accent-dark: #BFAEA3;
    --accent-text: #5c4a3a;
    --text-1:      #111827;
    --text-2:      #4b5563;
    --text-3:      #9ca3af;
    --border:      #e5e7eb;
    --radius:      14px;
    --shadow:      0 1px 3px rgba(0,0,0,.07), 0 4px 16px rgba(0,0,0,.05);
    --red:         #ef4444;
  }

  /* ── Page ── */
  .prd-page {
    max-width: 1200px; margin: 0 auto; padding: 36px 24px 60px;
    font-family: 'DM Sans', sans-serif; color: var(--text-1);
  }
  .prd-header { margin-bottom: 28px; }
  .prd-header__title { font-family: 'DM Serif Display', serif; font-size: 2rem; color: var(--text-1); letter-spacing: -.02em; }
  .prd-header__sub { font-size: .9rem; color: var(--text-3); margin-top: 4px; }

  /* ── Search ── */
  .prd-search-bar { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }
  .prd-search-wrap { position: relative; flex: 1; }
  .prd-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-3); pointer-events: none; }
  .prd-search-input {
    width: 100%; padding: 11px 14px 11px 40px; border: 1px solid var(--border); border-radius: 30px;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; color: var(--text-1); background: var(--surface);
    outline: none; transition: border-color .2s, box-shadow .2s; box-sizing: border-box;
  }
  .prd-search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(220,199,175,.18); }
  .prd-search-input::placeholder { color: var(--text-3); }
  .prd-filter-btn {
    padding: 11px 26px; background: var(--accent); border: none; border-radius: 30px;
    color: #fff; font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 600;
    cursor: pointer; transition: opacity .2s, transform .15s; white-space: nowrap;
  }
  .prd-filter-btn:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
  .prd-filter-btn:active:not(:disabled) { transform: scale(.98); }
  .prd-filter-btn:disabled { opacity: .5; cursor: not-allowed; }

  /* ── Table ── */
  .prd-table-wrap { background: var(--surface); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
  .prd-cell--code,    .prd-th.prd-cell--code    { width: 120px; min-width: 120px; flex-shrink: 0; }
  .prd-cell--name,    .prd-th.prd-cell--name    { flex: 1; min-width: 0; }
  .prd-cell--stock,   .prd-th.prd-cell--stock   { width: 90px; min-width: 90px; flex-shrink: 0; text-align: center; justify-content: center; }
  .prd-cell--price,   .prd-th.prd-cell--price   { width: 130px; min-width: 130px; flex-shrink: 0; }
  .prd-cell--actions, .prd-th.prd-cell--actions { width: 80px; min-width: 80px; flex-shrink: 0; text-align: center; }

  .prd-table-head { display: flex; align-items: center; padding: 0 24px; height: 46px; background: var(--surface-2); border-bottom: 1px solid var(--border); }
  .prd-th { font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--accent-text); display: flex; align-items: center; gap: 5px; }
  .prd-th--sortable { cursor: pointer; user-select: none; transition: color .15s; }
  .prd-th--sortable:hover { color: var(--accent-dark); }
  .prd-sort-icon { display: flex; align-items: center; color: var(--accent-dark); }

  .prd-row { display: flex; align-items: center; padding: 0 24px; height: 50px; border-bottom: 1px solid var(--border); transition: background .12s; }
  .prd-row:last-child { border-bottom: none; }
  .prd-row:hover { background: #fdf9f5; }
  .prd-cell { font-size: .84rem; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .prd-cell--code { font-weight: 600; color: var(--text-1); font-size: .8rem; }
  .prd-cell--name { color: var(--text-1); }
  .prd-cell--stock { font-weight: 700; color: var(--accent-text); text-align: center; display: flex; justify-content: center; }
  .prd-cell--stock-zero { color: var(--red) !important; }
  .prd-cell--price { font-variant-numeric: tabular-nums; }
  .prd-cell--actions { display: flex; justify-content: center; align-items: center; }

  .prd-icon-btn {
    display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;
    border: 1px solid var(--border); border-radius: 8px; background: var(--surface-2); color: var(--text-2);
    cursor: pointer; transition: background .15s, border-color .15s, color .15s, transform .12s;
  }
  .prd-icon-btn:hover { background: var(--accent); border-color: var(--accent); color: #fff; transform: translateY(-1px); }
  .prd-icon-btn:active { transform: scale(.95); }

  /* ── States ── */
  .prd-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px 24px; color: var(--text-3); font-size: .88rem; }
  .prd-state--error { color: var(--red); }
  .prd-spinner { width: 26px; height: 26px; border: 2.5px solid var(--border); border-top-color: var(--accent-dark); border-radius: 50%; animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Pagination ── */
  .prd-pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 24px; }
  .prd-page-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-2); cursor: pointer; transition: background .15s, border-color .15s, color .15s; }
  .prd-page-btn:hover:not(:disabled) { background: var(--accent); border-color: var(--accent); color: #fff; }
  .prd-page-btn:disabled { opacity: .35; cursor: not-allowed; }
  .prd-page-info { font-size: .84rem; color: var(--text-2); }
  .prd-page-info strong { color: var(--text-1); font-weight: 600; }

  /* ────────────────────────────────────────────────────────────
     VARIANTS MODAL
  ──────────────────────────────────────────────────────────── */

  .vm-backdrop {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(17,24,39,.45);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    animation: fadeIn .18s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .vm-modal {
    background: var(--surface);
    border-radius: 18px;
    box-shadow: 0 20px 60px rgba(0,0,0,.18);
    width: 100%;
    max-width: 1100px;
    max-height: 88vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp .2s ease;
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  /* Modal header */
  .vm-modal__header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .vm-modal__title { font-family: 'DM Serif Display', serif; font-size: 1.35rem; color: var(--text-1); letter-spacing: -.01em; }
  .vm-modal__sub { font-size: .8rem; color: var(--text-3); margin-top: 2px; }
  .vm-close-btn {
    display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
    border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-3);
    cursor: pointer; transition: background .15s, color .15s;
  }
  .vm-close-btn:hover { background: var(--surface-2); color: var(--text-1); }

  /* Info strip */
  .vm-info-strip {
    display: flex; gap: 16px; padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
    flex-shrink: 0;
    flex-wrap: wrap;
  }
  .vm-info-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px 20px;
  }
  .vm-info-card--highlight { background: var(--surface-2); border-color: var(--accent); }
  .vm-info-card__label { font-size: .68rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--accent-text); margin-bottom: 4px; }
  .vm-info-card__value { font-family: 'DM Serif Display', serif; font-size: 2rem; color: var(--text-1); line-height: 1; display: flex; align-items: baseline; gap: 6px; }
  .vm-info-card__unit { font-family: 'DM Sans', sans-serif; font-size: .8rem; color: var(--text-3); font-weight: 400; }
  .vm-info-product { display: flex; gap: 24px; margin-top: 6px; flex-wrap: wrap; }
  .vm-info-product__field { display: flex; flex-direction: column; gap: 1px; }
  .vm-info-product__key { font-size: .68rem; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--text-3); }
  .vm-info-product__val { font-size: .88rem; font-weight: 600; color: var(--text-1); }

  /* Body (scrollable) */
  .vm-body { flex: 1; overflow-y: auto; padding: 0; }

  /* Variants table */
  .vm-table-wrap { }
  .vm-table-head {
    display: grid;
    padding: 0 24px;
    height: 42px;
    background: var(--surface-2);
    border-bottom: 1px solid var(--border);
    align-items: center;
    position: sticky; top: 0; z-index: 2;
  }
  .vm-th { font-size: .68rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--accent-text); }
  .vm-th--center { text-align: center; }

  .vm-row {
    display: grid;
    padding: 0 24px;
    min-height: 46px;
    align-items: center;
    border-bottom: 1px solid var(--border);
    transition: background .1s;
  }
  .vm-row:last-child { border-bottom: none; }
  .vm-row:hover { background: #fdf9f5; }

  .vm-cell { font-size: .83rem; color: var(--text-2); }
  .vm-cell--variant { display: flex; align-items: center; gap: 8px; font-weight: 500; color: var(--text-1); }
  .vm-cell--center { text-align: center; font-variant-numeric: tabular-nums; }
  .vm-cell--total { font-weight: 700; color: var(--accent-text); }
  .vm-cell--zero { color: var(--red) !important; }

  .vm-color-dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    border: 1px solid rgba(0,0,0,.1);
  }
  .vm-variant-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .vm-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 50px 24px; color: var(--text-3); font-size: .88rem; }
  .vm-state--error { color: var(--red); }

  @media (max-width: 700px) {
    .prd-page { padding: 16px 12px 40px; }
    .prd-cell--price, .prd-th.prd-cell--price { display: none; }
    .prd-cell--code, .prd-th.prd-cell--code { width: 80px; min-width: 80px; }
    .vm-modal { max-height: 95vh; }
    .vm-info-strip { gap: 10px; }
  }
`;