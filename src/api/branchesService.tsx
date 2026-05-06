// ─────────────────────────────────────────────────────────────
//  branchesService.ts
// ─────────────────────────────────────────────────────────────

const API_BASE = "http://www.apimumaindumentaria.somee.com/api"; //Prod
//const API_BASE = "https://ttrc657c-7217.use.devtunnels.ms/api"; //Test
//const API_BASE = "/api";

// ─── Modelo de respuesta estándar de la API ───────────────────
// La API usa siempre: { data, isSuccess, message, internalError }

interface ApiResponse<T> {
    data: T;
    isSuccess: boolean;
    message: string | null;
    internalError: string | null;
}

// ─── Modelos ──────────────────────────────────────────────────

export interface BranchModel {
    id: number;
    name: string;
    address?: string;
    addrressARCA?: string;
    puntoVentaARCA?: number;
    isActived?: boolean;
    isDeleted?: boolean;
    isDev?: boolean;
    creationDate?: string;
}

export interface FilterModel {
    page?: number;
    pageSize?: number;
    search?: string;
    [key: string]: unknown;
}

export interface CashSessionModel {
    id: number;
    branchId: number;
    openedAt: string;
    closedAt?: string;
    isOpen: boolean;
}

// Modelo exacto según la respuesta real de la API (camelCase)
export interface CashSessionDetailsModel {
    branchName: string | null;
    initialCashRegister: number;

    // Ventas
    totalSales: number;
    totalCash: number;
    totalTransfer: number;
    totalTransferSurcharge: number;
    totalVentaVouchersEfectivo: number;
    totalVentaVouchers: number;
    totalCanjeoVouchers: number;
    totalDebitCard: number;
    totalDebitCardSurcharge: number;
    totalCreditCard: number;
    totalCreditCardSurcharge: number;
    totalClientDebitBalance: number;
    totalClientBalanceInFavor: number;

    // Egresos
    totalPersonalRetreat: number;
    totalEmployees: number;
    totalTransport: number;
    totalSuppliers: number;
    totalOther: number;
    totalCashOutflows: number;

    // Dinero en caja
    totalCashDeposits: number;
    totalCashAvailable: number;
    cashDeposits: number;
    transferDeposits: number;
    totalDeposits: number;

    // Gastos
    cashExpensesLocal: number;
    cashExpensesEmployee: number;
    cashExpensesServices: number;
    cashExpensesTransports: number;
    cashExpensesCounter: number;
    cashExpensesAFIP: number;
    cashExpensesBags: number;
    cashExpensesTrips: number;
    cashExpensesOther: number;
    cashExpensesRemodeling: number;
    cashExpensesPersonal: number;
    totalCostPrice: number;

    // Pagos de clientes
    cashClientsPayments: number;
    transferClientsPayments: number;
    debitClientsPayments: number;
    creditClientsPayments: number;
    clientsPayments: number;

    // Detalle
    salesQuantity: number;
    quantityOfProductsSold: number;
    exchangeQuantity: number;
    quantityOfReturnedProducts: number;
}

// ─── Utilidad central de fetch ────────────────────────────────

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Sin detalle");
        throw new Error(`HTTP ${response.status} - ${response.statusText}: ${errorText}`);
    }

    if (response.status === 204) return undefined as T;

    return response.json() as Promise<T>;
}

async function requestWrapped<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await request<ApiResponse<T>>(url, options);
    if (!res.isSuccess) {
        throw new Error(res.message ?? res.internalError ?? "Error desconocido de la API");
    }
    return res.data;
}

// ─── BranchesService ─────────────────────────────────────────

export const BranchesService = {
    async getAll(): Promise<BranchModel[]> {
        const branches = await requestWrapped<BranchModel[]>(`${API_BASE}/Branches/`);
        return branches.filter((b) => !b.isDeleted);
    },

    getById(id: number): Promise<BranchModel> {
        return requestWrapped<BranchModel>(`${API_BASE}/Branches/${id}`);
    },

    getByFilter(filter: FilterModel): Promise<BranchModel[]> {
        return requestWrapped<BranchModel[]>(`${API_BASE}/Branches/GetByFilter`, {
            method: "POST",
            body: JSON.stringify(filter),
        });
    },

    add(model: Omit<BranchModel, "id">): Promise<BranchModel> {
        return requestWrapped<BranchModel>(`${API_BASE}/Branches`, {
            method: "POST",
            body: JSON.stringify(model),
        });
    },

    update(model: BranchModel): Promise<BranchModel> {
        return requestWrapped<BranchModel>(`${API_BASE}/Branches`, {
            method: "PUT",
            body: JSON.stringify(model),
        });
    },

    delete(id: number): Promise<void> {
        return request<void>(`${API_BASE}/Branches/${id}`, { method: "DELETE" });
    },
};

// ─── CashSessionService ───────────────────────────────────────

export const CashSessionService = {
    getActiveByCashSession(branchId: number): Promise<CashSessionModel | null> {
        const today = new Date().toISOString().split("T")[0];
        return requestWrapped<CashSessionModel | null>(
            `${API_BASE}/CashSessions/GetCashSessionDay/${branchId}/${today}`
        ).catch(() => null);
    },

    getDetails(cashSessionId: number): Promise<CashSessionDetailsModel> {
        return requestWrapped<CashSessionDetailsModel>(
            `${API_BASE}/CashSessions/GetDetails/${cashSessionId}`
        );
    },

    getDetailsByBranchId(branchId: number): Promise<CashSessionDetailsModel> {
        const today = new Date().toISOString().split("T")[0];
        return requestWrapped<CashSessionDetailsModel>(
            `${API_BASE}/CashSessions/GetCashSessionDetailsDay/${branchId}/${today}`
        );
    }
};