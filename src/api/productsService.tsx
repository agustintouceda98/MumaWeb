// src/api/productsService.ts
// ─────────────────────────────────────────────────────────────

const API_BASE = "http://www.apimumaindumentaria.somee.com/api"; //Prod
//const API_BASE = "https://ttrc657c-7217.use.devtunnels.ms/api"; //Test

// ─── Respuesta estándar de la API ─────────────────────────────

interface ApiResponse<T> {
    data: T;
    isSuccess: boolean;
    message: string | null;
    internalError: string | null;
}

// ─── Modelos ──────────────────────────────────────────────────

export interface SizeModel {
    id: number;
    name: string;
}

export interface ColorModel {
    id: number;
    name: string;
    hex: string;
}

export interface ProductModel {
    id: number;
    code: string;
    name: string;
    costPrice: number;
    retailPrice: number;
    wholesalePrice: number;
    /** -1 = sin sucursal seleccionada (stock global no disponible) */
    stock: number;
    isDeleted: boolean;
    isActived: boolean;
    updateDate?: string;
    sizeIds?: number[];
    colorIds?: number[];
    sizes?: SizeModel[];
    colors?: ColorModel[];
}

export interface ResponseFilterModel<T> {
    items: T;
    totalItems: number;
}

export interface FilterInventoryModel {
    page: number;
    count: number;
    branchId?: number | null;
    filterText?: string;
    orderStock?: boolean | null;
    dateFrom?: string | null;
    dateTo?: string | null;
    isWeb?: boolean | null;
}

// ── Variantes ─────────────────────────────────────────────────

export interface BranchStockItemModel {
    branchId: number;
    branchName: string;
    quantity: number;
}

export interface ProductVariantStockItemModel {
    colorId: number | null;
    colorName: string | null;
    colorHex: string | null;
    sizeId: number | null;
    sizeName: string | null;
    totalQuantity: number;
    branches: BranchStockItemModel[];
}

export interface ProductVariantStockModel {
    productId: number;
    variants: ProductVariantStockItemModel[];
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

// ─── ProductsService ──────────────────────────────────────────

export const ProductsService = {
    getByFilter(
        filter: FilterInventoryModel
    ): Promise<ResponseFilterModel<ProductModel[]>> {
        return requestWrapped<ResponseFilterModel<ProductModel[]>>(
            `${API_BASE}/Products/GetByFilterV2`,
            {
                method: "POST",
                body: JSON.stringify(filter),
            }
        );
    },

    getListVariants(productId: number): Promise<ProductVariantStockModel> {
        return requestWrapped<ProductVariantStockModel>(
            `${API_BASE}/Products/ListVariants/${productId}`
        );
    },
};