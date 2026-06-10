import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  Wallet,
  BarChart3,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminAnalytics.css";

const API_URL = "https://dapurrempah.infinityfreeapp.com/resto-api";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function AdminAnalytics() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/analytics.php`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil data analytics.");
      }

      setAnalytics(result.data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const maxRevenue = Math.max(
    ...(analytics?.daily_sales || []).map((item) => Number(item.revenue || 0)),
    1,
  );

  const maxSold = Math.max(
    ...(analytics?.top_menus || []).map((item) => Number(item.total_sold || 0)),
    1,
  );

  return (
    <main className="analytics-page">
      <section className="analytics-shell">
        <div className="back-wrapper">
          <button className="back-btn" onClick={() => navigate("/admin")}>
            <ArrowLeft size={18} />
            Kembali ke Dashboard
          </button>
        </div>

        <header className="analytics-header">
          <div>
            <span className="analytics-label">Sales Analytics</span>
            <h1>Analitik Penjualan</h1>
            <p>Pantau pendapatan, order, dan menu terlaris restoran.</p>
          </div>

          <button onClick={loadAnalytics}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </header>

        {message && <div className="analytics-message">{message}</div>}

        {loading ? (
          <div className="analytics-empty">Memuat analytics...</div>
        ) : (
          <>
            <section className="analytics-stats">
              <div className="analytics-card">
                <div className="analytics-icon">
                  <ShoppingBag size={22} />
                </div>
                <span>Order Hari Ini</span>
                <strong>{analytics.today_orders}</strong>
              </div>

              <div className="analytics-card">
                <div className="analytics-icon">
                  <Wallet size={22} />
                </div>
                <span>Pendapatan Hari Ini</span>
                <strong>{formatRupiah(analytics.today_revenue)}</strong>
              </div>

              <div className="analytics-card">
                <div className="analytics-icon">
                  <BarChart3 size={22} />
                </div>
                <span>Pendapatan Bulan Ini</span>
                <strong>{formatRupiah(analytics.month_revenue)}</strong>
              </div>
            </section>

            <section className="analytics-grid">
              <div className="analytics-panel">
                <div className="panel-title">
                  <h2>Penjualan 7 Hari Terakhir</h2>
                  <p>Grafik sederhana berdasarkan pendapatan harian.</p>
                </div>

                <div className="bar-chart">
                  {analytics.daily_sales.map((item) => {
                    const height = Math.max(
                      12,
                      (Number(item.revenue) / maxRevenue) * 160,
                    );

                    return (
                      <div className="bar-item" key={item.date}>
                        <div className="bar-value">
                          {formatRupiah(item.revenue)}
                        </div>
                        <div
                          className="bar"
                          style={{ height: `${height}px` }}
                        ></div>
                        <span>{item.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="analytics-panel">
                <div className="panel-title">
                  <h2>Menu Terlaris</h2>
                  <p>Top menu berdasarkan jumlah terjual.</p>
                </div>

                <div className="top-menu-list">
                  {analytics.top_menus.length === 0 ? (
                    <div className="analytics-empty small">
                      Belum ada data menu terjual.
                    </div>
                  ) : (
                    analytics.top_menus.map((item, index) => {
                      const width = Math.max(
                        8,
                        (Number(item.total_sold) / maxSold) * 100,
                      );

                      return (
                        <div className="top-menu-item" key={item.name}>
                          <div className="top-menu-head">
                            <div>
                              <Trophy size={16} />
                              <strong>
                                #{index + 1} {item.name}
                              </strong>
                            </div>
                            <span>{item.total_sold} terjual</span>
                          </div>

                          <div className="progress-track">
                            <div
                              className="progress-bar"
                              style={{ width: `${width}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
