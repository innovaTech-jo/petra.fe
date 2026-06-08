export type TransportVoucherStatus = 'draft' | 'sent' | 'under_review' | 'approved';
export type TravelRequestStatus = 'draft' | 'submitted' | 'closed';

export interface StaticTransportVoucher {
  id: string;
  employeeUserId: string;
  voucherDate: string;
  status: TransportVoucherStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StaticTravelRequest {
  id: string;
  employeeUserId: string;
  destination: string;
  requestDate: string;
  status: TravelRequestStatus;
  createdAt: string;
  updatedAt: string;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/** Static demo data — mirrors mapp-dashboard dashboard metrics without API/localStorage services. */
export function buildStaticDashboardData(userId: string): {
  vouchers: StaticTransportVoucher[];
  travels: StaticTravelRequest[];
} {
  const uid = userId || 'local-admin';
  return {
    vouchers: [
      { id: 'v1', employeeUserId: uid, voucherDate: '2026-06-01', status: 'approved', createdAt: daysAgo(6), updatedAt: daysAgo(5) },
      { id: 'v2', employeeUserId: uid, voucherDate: '2026-06-02', status: 'under_review', createdAt: daysAgo(5), updatedAt: daysAgo(4) },
      { id: 'v3', employeeUserId: uid, voucherDate: '2026-06-03', status: 'sent', createdAt: daysAgo(4), updatedAt: daysAgo(3) },
      { id: 'v4', employeeUserId: uid, voucherDate: '2026-06-04', status: 'draft', createdAt: daysAgo(3), updatedAt: daysAgo(3) },
      { id: 'v5', employeeUserId: uid, voucherDate: '2026-06-05', status: 'approved', createdAt: daysAgo(2), updatedAt: daysAgo(1) },
      { id: 'v6', employeeUserId: uid, voucherDate: '2026-06-06', status: 'sent', createdAt: daysAgo(1), updatedAt: daysAgo(0) },
      { id: 'v7', employeeUserId: uid, voucherDate: '2026-06-07', status: 'draft', createdAt: daysAgo(0), updatedAt: daysAgo(0) },
      { id: 'v8', employeeUserId: uid, voucherDate: '2026-05-28', status: 'approved', createdAt: daysAgo(6), updatedAt: daysAgo(6) }
    ],
    travels: [
      { id: 't1', employeeUserId: uid, destination: 'عمان', requestDate: '2026-06-01', status: 'closed', createdAt: daysAgo(6), updatedAt: daysAgo(4) },
      { id: 't2', employeeUserId: uid, destination: 'إربد', requestDate: '2026-06-03', status: 'submitted', createdAt: daysAgo(4), updatedAt: daysAgo(2) },
      { id: 't3', employeeUserId: uid, destination: 'العقبة', requestDate: '2026-06-05', status: 'draft', createdAt: daysAgo(2), updatedAt: daysAgo(2) },
      { id: 't4', employeeUserId: uid, destination: 'الزرقاء', requestDate: '2026-06-07', status: 'submitted', createdAt: daysAgo(0), updatedAt: daysAgo(0) },
      { id: 't5', employeeUserId: uid, destination: 'مادبا', requestDate: '2026-05-30', status: 'closed', createdAt: daysAgo(5), updatedAt: daysAgo(3) }
    ]
  };
}
