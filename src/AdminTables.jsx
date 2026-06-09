import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Table2,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminTables.css";

const API_URL = "https://restaurantdemoo.rf.gd/resto-api";

const statusLabels = {
  available: "Kosong",
  occupied: "Terisi",
  reserved: "Reservasi",
};

export default function AdminTables() {
  const navigate = useNavigate();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadTables = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/tables.php`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil data meja.");
      }

      setTables(result.data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTableStatus = async (tableNumber, status) => {
    try {
      const response = await fetch(`${API_URL}/tables.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table_number: tableNumber,
          status,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal update status meja.");
      }

      setMessage("Status meja berhasil diperbarui.");
      loadTables();

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const totalAvailable = tables.filter(
    (item) => item.status === "available",
  ).length;
  const totalOccupied = tables.filter(
    (item) => item.status === "occupied",
  ).length;
  const totalReserved = tables.filter(
    (item) => item.status === "reserved",
  ).length;

  return (
    <main className="tables-page">
      <section className="tables-shell">
        <div className="back-wrapper">
          <button className="back-btn" onClick={() => navigate("/admin")}>
            <ArrowLeft size={18} />
            Kembali ke Dashboard
          </button>
        </div>

        <header className="tables-header">
          <div>
            <span className="tables-label">Table Management</span>
            <h1>Kelola Meja Restoran</h1>
            <p>Pantau dan ubah status meja restoran dari satu halaman.</p>
          </div>

          <button onClick={loadTables}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </header>

        {message && <div className="tables-message">{message}</div>}

        {loading ? (
          <div className="tables-empty">Memuat data meja...</div>
        ) : (
          <>
            <section className="table-stats">
              <div className="table-stat-card">
                <div className="table-stat-icon available">
                  <CheckCircle2 size={22} />
                </div>
                <span>Meja Kosong</span>
                <strong>{totalAvailable}</strong>
              </div>

              <div className="table-stat-card">
                <div className="table-stat-icon occupied">
                  <Users size={22} />
                </div>
                <span>Meja Terisi</span>
                <strong>{totalOccupied}</strong>
              </div>

              <div className="table-stat-card">
                <div className="table-stat-icon reserved">
                  <Clock size={22} />
                </div>
                <span>Meja Reservasi</span>
                <strong>{totalReserved}</strong>
              </div>
            </section>

            <section className="tables-grid">
              {tables.map((table) => (
                <article
                  className={`table-card ${table.status}`}
                  key={table.id}
                >
                  <div className="table-card-top">
                    <div className="table-number-icon">
                      <Table2 size={22} />
                    </div>

                    <span className={`table-status ${table.status}`}>
                      {statusLabels[table.status]}
                    </span>
                  </div>

                  <h3>Meja {table.table_number}</h3>

                  <div className="table-actions">
                    <button
                      className="available-btn"
                      onClick={() =>
                        updateTableStatus(table.table_number, "available")
                      }
                      disabled={table.status === "available"}
                    >
                      Kosong
                    </button>

                    <button
                      className="occupied-btn"
                      onClick={() =>
                        updateTableStatus(table.table_number, "occupied")
                      }
                      disabled={table.status === "occupied"}
                    >
                      Terisi
                    </button>

                    <button
                      className="reserved-btn"
                      onClick={() =>
                        updateTableStatus(table.table_number, "reserved")
                      }
                      disabled={table.status === "reserved"}
                    >
                      Reservasi
                    </button>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </section>
    </main>
  );
}
