import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Flame,
  Clock,
  CheckCircle2,
  Utensils,
  ShoppingBag,
  User,
  Phone,
  Table2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminKitchen.css";

const API_URL = "https://restaurantdemoo.rf.gd/resto-api";

function formatStatus(status) {
  const labels = {
    pending: "Menunggu",
    processing: "Sedang Dimasak",
  };

  return labels[status] || status;
}

export default function AdminKitchen() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/orders.php`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil order dapur.");
      }

      const activeOrders = result.data.filter(
        (order) => order.status === "pending" || order.status === "processing",
      );

      setOrders(activeOrders);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_URL}/update_order_status.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          status,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal update status dapur.");
      }

      setMessage("Status pesanan berhasil diperbarui.");
      fetchOrders();

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="kitchen-page">
      <section className="kitchen-shell">
        <div className="back-wrapper">
          <button className="back-btn" onClick={() => navigate("/admin")}>
            <ArrowLeft size={18} />
            Kembali ke Dashboard
          </button>
        </div>

        <header className="kitchen-header">
          <div>
            <span className="kitchen-label">Kitchen Display</span>
            <h1>Pesanan Dapur</h1>
            <p>Pesanan otomatis diperbarui setiap 5 detik.</p>
          </div>

          <button onClick={fetchOrders}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </header>

        {message && <div className="kitchen-message">{message}</div>}

        {loading ? (
          <div className="kitchen-empty">Memuat pesanan dapur...</div>
        ) : orders.length === 0 ? (
          <div className="kitchen-empty">
            Tidak ada pesanan aktif untuk dapur.
          </div>
        ) : (
          <section className="kitchen-grid">
            {orders.map((order) => (
              <article className="kitchen-card" key={order.id}>
                <div className="kitchen-card-top">
                  <div>
                    <h3>{order.order_code}</h3>

                    <div className="kitchen-order-type">
                      {order.order_type === "take_away" ? (
                        <>
                          <ShoppingBag size={15} />
                          <span>Take Away</span>
                        </>
                      ) : (
                        <>
                          <Table2 size={15} />
                          <span>Meja {order.table_number}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className={`kitchen-status ${order.status}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>

                {order.order_type === "take_away" && (
                  <div className="kitchen-customer">
                    <div>
                      <User size={15} />
                      <span>{order.customer_name || "-"}</span>
                    </div>

                    <div>
                      <Phone size={15} />
                      <span>{order.customer_phone || "-"}</span>
                    </div>
                  </div>
                )}

                <div className="kitchen-time">
                  <Clock size={16} />
                  {order.created_at}
                </div>

                <div className="kitchen-items">
                  {order.items.map((item) => (
                    <div className="kitchen-item" key={item.id}>
                      <div>
                        <strong>
                          {item.quantity}x {item.menu_name}
                        </strong>
                        {item.notes && <small>Catatan: {item.notes}</small>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="kitchen-actions">
                  <button
                    className="cook-btn"
                    onClick={() => updateStatus(order.id, "processing")}
                    disabled={order.status === "processing"}
                  >
                    <Flame size={17} />
                    Masak
                  </button>

                  <button
                    className="finish-btn"
                    onClick={() => updateStatus(order.id, "completed")}
                  >
                    <CheckCircle2 size={17} />
                    Selesai
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
