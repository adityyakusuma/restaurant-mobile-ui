import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  Utensils,
  Phone,
  User,
  Table2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminOrders.css";

const API_URL = "https://dapurrempah.infinityfreeapp.com/resto-api";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatStatus(status) {
  const labels = {
    pending: "Menunggu",
    processing: "Diproses",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return labels[status] || status;
}

function formatOrderType(type) {
  return type === "take_away" ? "Take Away" : "Dine In";
}

export default function AdminOrders() {
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
        throw new Error(result.message || "Gagal mengambil order.");
      }

      setOrders(result.data);
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
        throw new Error(result.message || "Gagal update status.");
      }

      setMessage("Status order berhasil diperbarui.");
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
  }, []);

  let ordersContent;
  if (loading) {
    ordersContent = <div className="empty-state">Memuat order...</div>;
  } else if (orders.length === 0) {
    ordersContent = <div className="empty-state">Belum ada order masuk.</div>;
  } else {
    ordersContent = (
      <div className="orders-list">
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-top">
              <div>
                <h3>{order.order_code}</h3>

                <div className="order-type-line">
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

              <span className={`status-badge ${order.status}`}>
                {formatStatus(order.status)}
              </span>
            </div>

            <div className="order-meta">
              <div>
                <ShoppingBag size={16} />
                {order.items.length} item
              </div>

              <div>
                <Clock size={16} />
                {order.created_at}
              </div>

              <div>
                {order.order_type === "take_away" ? (
                  <ShoppingBag size={16} />
                ) : (
                  <Utensils size={16} />
                )}
                {formatOrderType(order.order_type)}
              </div>
            </div>

            {order.order_type === "take_away" && (
              <div className="customer-box">
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

            <div className="items-box">
              {order.items.map((item) => (
                <div className="item-row" key={item.id}>
                  <div>
                    <strong>{item.menu_name}</strong>
                    {item.notes && <small>Catatan: {item.notes}</small>}
                  </div>

                  <span>
                    {item.quantity} x {formatRupiah(item.price)}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-total">
              <span>Total</span>
              <strong>{formatRupiah(order.total_amount)}</strong>
            </div>

            <div className="order-actions">
              <button
                className="process-btn"
                onClick={() => updateStatus(order.id, "processing")}
                disabled={order.status === "processing"}
              >
                <Utensils size={16} />
                Proses
              </button>

              <button
                className="done-btn"
                onClick={() => updateStatus(order.id, "completed")}
                disabled={order.status === "completed"}
              >
                <CheckCircle2 size={16} />
                Selesai
              </button>

              <button
                className="cancel-btn"
                onClick={() => updateStatus(order.id, "cancelled")}
                disabled={order.status === "cancelled"}
              >
                <XCircle size={16} />
                Batalkan
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="back-wrapper">
          <button className="back-btn" onClick={() => navigate("/admin")}>
            <ArrowLeft size={18} />
            Kembali ke Dashboard
          </button>
        </div>

        <header className="admin-header">
          <div>
            <span className="admin-label">Dashboard Kasir</span>
            <h1>Order Masuk</h1>
            <p>Kelola pesanan dine in dan take away.</p>
          </div>

          <button onClick={fetchOrders}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </header>

        {message && <div className="admin-message">{message}</div>}

        {ordersContent}
      </section>
    </main>
  );
}
