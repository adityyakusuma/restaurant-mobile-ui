import { useEffect, useState } from "react";
import {
  ShoppingBag,
  CalendarDays,
  Wallet,
  Clock,
  CheckCircle2,
  Utensils,
  ArrowRight,
  RefreshCw,
  MenuSquare,
  Flame,
  LogOut,
  BarChart3,
  Table2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_URL = "https://restaurantdemoo.rf.gd/resto-api";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [ordersRes, reservationsRes, menusRes] = await Promise.all([
        fetch(`${API_URL}/orders.php`),
        fetch(`${API_URL}/reservations.php`),
        fetch(`${API_URL}/menus.php`),
      ]);

      const ordersJson = await ordersRes.json();
      const reservationsJson = await reservationsRes.json();
      const menusJson = await menusRes.json();

      if (ordersJson.success) setOrders(ordersJson.data);
      if (reservationsJson.success) setReservations(reservationsJson.data);
      if (menusJson.success) setMenus(menusJson.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/");
  };

  const today = new Date().toISOString().slice(0, 10);

  const todayOrders = orders.filter((order) =>
    order.created_at?.startsWith(today),
  );

  const todayReservations = reservations.filter(
    (reservation) => reservation.reservation_date === today,
  );

  const todayRevenue = todayOrders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  const pendingOrders = orders.filter((order) => order.status === "pending");

  const processingOrders = orders.filter(
    (order) => order.status === "processing",
  );

  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  );

  const takeAwayToday = todayOrders.filter(
    (order) => order.order_type === "take_away",
  );

  const dineInToday = todayOrders.filter(
    (order) => order.order_type !== "take_away",
  );

  const activeMenus = menus.filter((menu) => Number(menu.is_active) === 1);

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-label">Dashboard Admin</span>
            <h1>Dapur Rempah</h1>
            <p>
              Ringkasan operasional order, reservasi, menu, meja, dan dapur.
            </p>
          </div>

          <div className="dashboard-actions">
            <button onClick={loadDashboard}>
              <RefreshCw size={18} />
              Refresh
            </button>

            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        {loading ? (
          <div className="dashboard-empty">Memuat dashboard...</div>
        ) : (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <ShoppingBag size={22} />
                </div>
                <span>Order Hari Ini</span>
                <strong>{todayOrders.length}</strong>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <CalendarDays size={22} />
                </div>
                <span>Reservasi Hari Ini</span>
                <strong>{todayReservations.length}</strong>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Wallet size={22} />
                </div>
                <span>Pendapatan Hari Ini</span>
                <strong>{formatRupiah(todayRevenue)}</strong>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={22} />
                </div>
                <span>Order Menunggu</span>
                <strong>{pendingOrders.length}</strong>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Utensils size={22} />
                </div>
                <span>Sedang Diproses</span>
                <strong>{processingOrders.length}</strong>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle2 size={22} />
                </div>
                <span>Order Selesai</span>
                <strong>{completedOrders.length}</strong>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Table2 size={22} />
                </div>
                <span>Dine In Hari Ini</span>
                <strong>{dineInToday.length}</strong>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <ShoppingBag size={22} />
                </div>
                <span>Take Away Hari Ini</span>
                <strong>{takeAwayToday.length}</strong>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <MenuSquare size={22} />
                </div>
                <span>Menu Aktif</span>
                <strong>{activeMenus.length}</strong>
              </div>
            </section>

            <section className="admin-links">
              <Link to="/admin/orders" className="admin-link-card">
                <div>
                  <ShoppingBag size={26} />
                  <h3>Kelola Order</h3>
                  <p>
                    Lihat pesanan masuk, proses order, dan selesaikan pesanan.
                  </p>
                </div>
                <ArrowRight size={22} />
              </Link>

              <Link to="/admin/reservations" className="admin-link-card">
                <div>
                  <CalendarDays size={26} />
                  <h3>Kelola Reservasi</h3>
                  <p>Lihat reservasi pelanggan, konfirmasi, atau batalkan.</p>
                </div>
                <ArrowRight size={22} />
              </Link>

              <Link to="/admin/menus" className="admin-link-card">
                <div>
                  <MenuSquare size={26} />
                  <h3>Kelola Menu</h3>
                  <p>Tambah, edit, dan aktif/nonaktifkan menu restoran.</p>
                </div>
                <ArrowRight size={22} />
              </Link>

              <Link to="/admin/kitchen" className="admin-link-card">
                <div>
                  <Flame size={26} />
                  <h3>Kitchen Display</h3>
                  <p>Lihat pesanan aktif dapur dan ubah status masak.</p>
                </div>
                <ArrowRight size={22} />
              </Link>

              <Link to="/admin/analytics" className="admin-link-card">
                <div>
                  <BarChart3 size={26} />
                  <h3>Sales Analytics</h3>
                  <p>Lihat grafik penjualan, pendapatan, dan menu terlaris.</p>
                </div>
                <ArrowRight size={22} />
              </Link>

              <Link to="/admin/tables" className="admin-link-card">
                <div>
                  <Table2 size={26} />
                  <h3>Table Management</h3>
                  <p>Pantau status meja kosong, terisi, dan reservasi.</p>
                </div>
                <ArrowRight size={22} />
              </Link>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
