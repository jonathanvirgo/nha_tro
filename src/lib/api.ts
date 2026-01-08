const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown[];
    };
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: unknown;
    headers?: Record<string, string>;
}

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    setToken(token: string | null) {
        this.token = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }
        }
    }

    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
        const { method = 'GET', body, headers = {} } = options;

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || {
                        code: 'HTTP_ERROR',
                        message: `HTTP ${response.status}`
                    },
                };
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            return {
                success: false,
                error: {
                    code: 'NETWORK_ERROR',
                    message: 'Không thể kết nối đến server'
                },
            };
        }
    }

    // Auth
    async login(email: string, password: string) {
        return this.request<{ user: unknown; accessToken: string; refreshToken: string }>(
            '/api/auth/login',
            { method: 'POST', body: { email, password } }
        );
    }

    async register(data: { email: string; password: string; fullName: string; phone?: string; role?: string }) {
        return this.request<{ user: unknown }>('/api/auth/register', { method: 'POST', body: data });
    }

    async logout() {
        this.setToken(null);
        return this.request('/api/auth/logout', { method: 'POST' });
    }

    async getMe() {
        return this.request<{ user: unknown }>('/api/users/me');
    }

    // Rooms
    async searchRooms(params?: Record<string, unknown>) {
        const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
        return this.request<unknown[]>(`/api/search/rooms${query}`);
    }

    async getRoom(id: string) {
        return this.request<unknown>(`/api/search/rooms/${id}`);
    }

    // Motels
    async getMotels(params?: Record<string, unknown>) {
        const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
        return this.request<unknown[]>(`/api/motels${query}`);
    }

    async getMotel(id: string) {
        return this.request<unknown>(`/api/motels/${id}`);
    }

    // Contracts
    async getContracts(params?: Record<string, unknown>) {
        const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
        return this.request<unknown[]>(`/api/contracts${query}`);
    }

    async getContract(id: string) {
        return this.request<unknown>(`/api/contracts/${id}`);
    }

    // Invoices
    async getInvoices(params?: Record<string, unknown>) {
        const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
        return this.request<unknown[]>(`/api/invoices${query}`);
    }

    async getInvoice(id: string) {
        return this.request<unknown>(`/api/invoices/${id}`);
    }

    // Maintenance
    async getMaintenanceRequests(params?: Record<string, unknown>) {
        const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
        return this.request<unknown[]>(`/api/maintenance-requests${query}`);
    }

    async createMaintenanceRequest(data: unknown) {
        return this.request<unknown>('/api/maintenance-requests', { method: 'POST', body: data });
    }

    // Appointments
    async createAppointment(data: unknown) {
        return this.request<unknown>('/api/appointments', { method: 'POST', body: data });
    }

    // Dashboard
    async getDashboardStats() {
        return this.request<unknown>('/api/dashboard/stats');
    }

    async getRevenueStats(year?: number) {
        const query = year ? `?year=${year}` : '';
        return this.request<unknown>(`/api/dashboard/revenue${query}`);
    }

    async getOccupancyStats() {
        return this.request<unknown>('/api/dashboard/occupancy');
    }

    // Notifications
    async getNotifications() {
        return this.request<unknown[]>('/api/notifications');
    }

    async markNotificationRead(id: string) {
        return this.request<unknown>(`/api/notifications/${id}`, { method: 'PUT', body: { isRead: true } });
    }

    // Admin CRUD
    async createMotel(data: unknown) {
        return this.request<unknown>('/api/motels', { method: 'POST', body: data });
    }

    async updateMotel(id: string, data: unknown) {
        return this.request<unknown>(`/api/motels/${id}`, { method: 'PUT', body: data });
    }

    async deleteMotel(id: string) {
        return this.request<unknown>(`/api/motels/${id}`, { method: 'DELETE' });
    }

    async createRoom(motelId: string, data: unknown) {
        return this.request<unknown>(`/api/motels/${motelId}/rooms`, { method: 'POST', body: data });
    }

    async updateRoom(id: string, data: unknown) {
        return this.request<unknown>(`/api/rooms/${id}`, { method: 'PUT', body: data });
    }

    async deleteRoom(id: string) {
        return this.request<unknown>(`/api/rooms/${id}`, { method: 'DELETE' });
    }

    // Tenants
    async getTenants(params?: Record<string, unknown>) {
        const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
        return this.request<unknown[]>(`/api/tenants${query}`);
    }

    async getTenant(id: string) {
        return this.request<unknown>(`/api/users/${id}`);
    }

    async updateTenant(id: string, data: unknown) {
        return this.request<unknown>(`/api/users/${id}`, { method: 'PUT', body: data });
    }

    // Contracts CRUD

    async createContract(data: unknown) {
        return this.request<unknown>('/api/contracts', { method: 'POST', body: data });
    }

    async updateContract(id: string, data: unknown) {
        return this.request<unknown>(`/api/contracts/${id}`, { method: 'PUT', body: data });
    }

    async deleteContract(id: string) {
        return this.request<unknown>(`/api/contracts/${id}`, { method: 'DELETE' });
    }

    // Invoices CRUD
    async createInvoice(data: unknown) {
        return this.request<unknown>('/api/invoices', { method: 'POST', body: data });
    }

    async updateInvoice(id: string, data: unknown) {
        return this.request<unknown>(`/api/invoices/${id}`, { method: 'PUT', body: data });
    }

    async deleteInvoice(id: string) {
        return this.request<unknown>(`/api/invoices/${id}`, { method: 'DELETE' });
    }

    // Maintenance CRUD
    async updateMaintenanceRequest(id: string, data: unknown) {
        return this.request<unknown>(`/api/maintenance-requests/${id}`, { method: 'PUT', body: data });
    }

    async deleteMaintenanceRequest(id: string) {
        return this.request<unknown>(`/api/maintenance-requests/${id}`, { method: 'DELETE' });
    }

    // Appointments
    async getAppointments(params?: Record<string, unknown>) {
        const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
        return this.request<unknown[]>(`/api/appointments${query}`);
    }

    // Dashboard Stats - already defined above, removing duplicate

    async getDashboardRevenue(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request<unknown>(`/api/dashboard/revenue${query}`);
    }

    async getDashboardOccupancy() {
        return this.request<unknown>('/api/dashboard/occupancy');
    }

    // Reports
    async getFinancialReport(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request<unknown>(`/api/reports/financial${query}`);
    }

    async getContractsReport(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request<unknown>(`/api/reports/contracts${query}`);
    }

    async getTenantsReport(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request<unknown>(`/api/reports/tenants${query}`);
    }

    async getMaintenanceReport(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request<unknown>(`/api/reports/maintenance${query}`);
    }

    // Reservations / Bookings
    async createReservation(data: unknown) {
        return this.request<unknown>('/api/reservations', { method: 'POST', body: data });
    }

    async getReservations(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request<unknown[]>(`/api/reservations${query}`);
    }
}


export const api = new ApiClient(API_BASE_URL);
export type { ApiResponse };
