import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const StatCard = ({ icon, label, value, sub, accent }) => (
  <div className={`rounded-xl p-5 bg-white border ${accent ? 'border-red-500 shadow-md relative overflow-hidden' : 'border-gray-200 shadow-sm'}`}>
    {accent && <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-50 rounded-full opacity-50" />}
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${accent ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      {sub && (
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider ${accent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
          {sub}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-3xl font-bold mb-1 text-gray-900">{value}</h3>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  </div>
);

const STATUS_BADGE = {
  REPORTED: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  SECURED:  'bg-blue-50 text-blue-700 border border-blue-200',
  RESOLVED: 'bg-green-50 text-green-700 border border-green-200',
};

const TYPE_BADGE = {
  TEMUAN: 'bg-indigo-50 text-indigo-700',
  KEHILANGAN: 'bg-rose-50 text-rose-700',
};

const OfficerDashboard = () => {
  const [stats, setStats] = useState({
    activeFound: 0,
    activeLost: 0,
    pendingVerify: 0,
    resolvedToday: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [overdueItems, setOverdueItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_BASE}/officer/dashboard`, { headers });
        if (res.data?.data) {
          setStats(res.data.data.stats);
          setRecentActivity(res.data.data.recentActivity);
          setOverdueItems(res.data.data.overdueItems || []);
        }
      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-red-600 animate-spin">sync</span>
          <p className="text-gray-500 font-medium animate-pulse">Memuat Data Dasbor...</p>
        </div>
      </div>
    );
  }

  // Calculate generic percentages for the progress overview to make it look active
  const totalReports = stats.activeFound + stats.activeLost + stats.resolvedToday || 1;
  const progressResolved = Math.round((stats.resolvedToday / totalReports) * 100) || 0;
  const progressSecured = Math.round((stats.activeFound / totalReports) * 100) || 0;
  const progressReported = Math.round((stats.activeLost / totalReports) * 100) || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Petugas</h1>
          <p className="text-sm text-gray-500 mt-1">Ringkasan aktivitas dan laporan terkini</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link to="/officer/inventory" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 border border-transparent text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm w-full sm:w-auto">
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            Kelola Inventaris
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="inventory_2"   label="Barang Temuan Aktif"  value={stats.activeFound}  sub="PERLU PROSES" accent />
        <StatCard icon="manage_search" label="Laporan Kehilangan"   value={stats.activeLost}  sub="OPEN" />
        <StatCard icon="schedule"      label="Menunggu Verifikasi"  value={stats.pendingVerify}   sub="URGENT" />
        <StatCard icon="check_circle"  label="Diselesaikan Hari Ini"value={stats.resolvedToday}   sub="HARI INI" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Aktivitas Terbaru</h2>
            <Link to="/officer/inventory" className="text-sm font-semibold text-red-600 hover:text-red-700">Lihat Semua</Link>
          </div>
          
          <div className="overflow-x-auto flex-1">
            {recentActivity.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">ID Laporan</th>
                    <th className="px-6 py-3">Tipe</th>
                    <th className="px-6 py-3">Barang / Laporan</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentActivity.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.id}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[row.type] || 'bg-gray-100 text-gray-600'}`}>
                          {row.type === 'TEMUAN' ? 'Temuan' : 'Hilang'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{row.title}</p>
                        <p className="text-xs text-gray-500">Oleh: {row.reporter}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide ${STATUS_BADGE[row.status] || 'bg-gray-100 text-gray-600'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">inbox</span>
                <h3 className="text-base font-semibold text-gray-900">Belum Ada Aktivitas</h3>
                <p className="text-sm text-gray-500">Sistem belum mencatat laporan apapun saat ini.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Overdue Panel */}
          <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden flex-1">
            <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600">warning</span>
              <h2 className="text-base font-bold text-red-900">Perhatian Khusus (Overdue)</h2>
            </div>
            <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
              {overdueItems.length > 0 ? overdueItems.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-600">Pelapor: {item.reporter}</p>
                    </div>
                    <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                      {item.badge}
                    </span>
                  </div>
                  {item.phone ? (
                    <a
                      href={`https://wa.me/${item.phone}?text=${encodeURIComponent(`Halo ${item.reporter},\nSaya petugas dari Found It. Terkait laporan penemuan barang Anda (*${item.title}*) dengan nomor tiket *${item.id}* yang sudah melewati 3 hari, mohon segera serahkan barang fisik tersebut ke pos Satpam / Pusat Layanan agar dapat kami amankan dan distribusikan kepada pemiliknya.\n\nTerima kasih atas kerja samanya.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-white py-1.5 px-3 rounded-md transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[14px]">chat</span>
                      Hubungi Pelapor via WA
                    </a>
                  ) : (
                    <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-gray-200 text-gray-500 py-1.5 px-3 rounded-md cursor-not-allowed">
                      <span className="material-symbols-outlined text-[14px]">person_off</span>
                      Nomor WA Tidak Tersedia
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-3xl text-green-500 mb-2">task_alt</span>
                  <p className="text-sm text-gray-500">Tidak ada laporan temuan yang overdue.</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex-1">
            <h2 className="text-base font-bold text-gray-900 mb-5">Distribusi Laporan Aktif</h2>
            <div className="space-y-6">
              {[
                { label: 'Selesai / Dikembalikan', value: progressResolved, color: 'bg-green-500' },
                { label: 'Barang Diamankan (Secured)', value: progressSecured, color: 'bg-blue-500' },
                { label: 'Baru Dilaporkan (Reported)', value: progressReported, color: 'bg-yellow-500' },
              ].map((bar, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-600">{bar.label}</span>
                    <span className="text-sm font-bold text-gray-900">{bar.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${bar.color} rounded-full transition-all duration-1000`} style={{ width: `${bar.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
