import { useEffect, useState } from "react";
import {
  CalendarDays,
  Phone,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  Table2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminReservations.css";

const API_URL = "https://restaurantdemoo.rf.gd/resto-api";

function formatStatus(status) {
  const labels = {
    pending: "Menunggu",
    confirmed: "Dikonfirmasi",
    cancelled: "Dibatalkan",
  };

  return labels[status] || status;
}

export default function AdminReservations() {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadReservations = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/reservations.php`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil data reservasi.");
      }

      setReservations(result.data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/update_reservation_status.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal update status reservasi.");
      }

      setMessage("Status reservasi dan meja berhasil diperbarui.");
      loadReservations();

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="reservation-page">
      <div className="reservation-container">
        <div className="back-wrapper">
          <button className="back-btn" onClick={() => navigate("/admin")}>
            <ArrowLeft size={18} />
            Kembali ke Dashboard
          </button>
        </div>

        <div className="reservation-header">
          <div>
            <h1>Reservasi Meja</h1>
            <p>Kelola reservasi pelanggan dan status meja.</p>
          </div>

          <button onClick={loadReservations}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {message && <div className="reservation-message">{message}</div>}

        {loading ? (
          <div className="reservation-empty">Memuat data reservasi...</div>
        ) : reservations.length === 0 ? (
          <div className="reservation-empty">Belum ada reservasi.</div>
        ) : (
          <div className="reservation-grid">
            {reservations.map((item) => (
              <div key={item.id} className="reservation-card">
                <div className="reservation-top">
                  <h3>{item.customer_name}</h3>

                  <span className={`status ${item.status}`}>
                    {formatStatus(item.status)}
                  </span>
                </div>

                <div className="reservation-info">
                  <div>
                    <Phone size={15} />
                    {item.phone}
                  </div>

                  <div>
                    <Table2 size={15} />
                    Meja {item.table_number}
                  </div>

                  <div>
                    <CalendarDays size={15} />
                    {item.reservation_date}
                  </div>

                  <div>
                    <CalendarDays size={15} />
                    {item.reservation_time}
                  </div>

                  <div>
                    <Users size={15} />
                    {item.guests} Orang
                  </div>
                </div>

                <div className="reservation-actions">
                  <button
                    className="confirm-btn"
                    onClick={() => updateStatus(item.id, "confirmed")}
                    disabled={item.status === "confirmed"}
                  >
                    <CheckCircle2 size={16} />
                    Konfirmasi
                  </button>

                  <button
                    className="cancel-btn"
                    onClick={() => updateStatus(item.id, "cancelled")}
                    disabled={item.status === "cancelled"}
                  >
                    <XCircle size={16} />
                    Batalkan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
