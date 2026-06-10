import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  Pencil,
  Power,
  Save,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminMenus.css";

const API_URL = "/api";

const emptyForm = {
  id: null,
  name: "",
  category: "maincourse",
  description: "",
  price: "",
  image: "",
  is_active: 1,
};

const categoryLabels = {
  maincourse: "Makanan Utama",
  snack: "Camilan",
  dessert: "Penutup",
  drink: "Minuman",
};

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function AdminMenus() {
  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);

  const fetchMenus = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/menus.php`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil data menu.");
      }

      setMenus(result.data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(false);
    setMessage("");
  };

  const editMenu = (menu) => {
    setEditing(true);
    setForm({
      id: menu.id,
      name: menu.name,
      category: menu.category,
      description: menu.description,
      price: menu.price,
      image: menu.image,
      is_active: Number(menu.is_active),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const saveMenu = async () => {
    if (
      !form.name.trim() ||
      !form.category ||
      !form.description.trim() ||
      Number(form.price) <= 0 ||
      !form.image.trim()
    ) {
      setMessage("Lengkapi semua data menu terlebih dahulu.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: form.id,
        name: form.name,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        image: form.image,
        is_active: Number(form.is_active),
      };

      const response = await fetch(`${API_URL}/menus.php`, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal menyimpan menu.");
      }

      setMessage(result.message);
      resetForm();
      fetchMenus();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (menu) => {
    try {
      const payload = {
        id: menu.id,
        name: menu.name,
        category: menu.category,
        description: menu.description,
        price: Number(menu.price),
        image: menu.image,
        is_active: Number(menu.is_active) === 1 ? 0 : 1,
      };

      const response = await fetch(`${API_URL}/menus.php`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal mengubah status menu.");
      }

      setMessage(result.message);
      fetchMenus();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="menus-page">
      <section className="menus-shell">
        <div className="back-wrapper">
          <button className="back-btn" onClick={() => navigate("/admin")}>
            <ArrowLeft size={18} />
            Kembali ke Dashboard
          </button>
        </div>

        <header className="menus-header">
          <div>
            <span className="menus-label">Manajemen Menu</span>
            <h1>Kelola Menu Restoran</h1>
            <p>Tambah, ubah, dan aktif/nonaktifkan menu restoran.</p>
          </div>

          <button onClick={fetchMenus}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </header>

        {message && <div className="menus-message">{message}</div>}

        <section className="menu-form-card">
          <div className="form-title">
            <div>
              <h2>{editing ? "Edit Menu" : "Tambah Menu Baru"}</h2>
              <p>
                Nama gambar harus sama dengan file di folder{" "}
                <strong>src/assets/menu</strong>.
              </p>
            </div>

            {editing ? (
              <button className="clear-btn" onClick={resetForm}>
                <X size={16} />
                Batal Edit
              </button>
            ) : (
              <Plus size={22} />
            )}
          </div>

          <div className="menu-form-grid">
            <input
              name="name"
              placeholder="Nama menu"
              value={form.name}
              onChange={handleChange}
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="maincourse">Makanan Utama</option>
              <option value="snack">Camilan</option>
              <option value="dessert">Penutup</option>
              <option value="drink">Minuman</option>
            </select>

            <input
              name="price"
              type="number"
              placeholder="Harga"
              value={form.price}
              onChange={handleChange}
            />

            <input
              name="image"
              placeholder="Contoh: nasi-goreng.jpg"
              value={form.image}
              onChange={handleChange}
            />

            <select
              name="is_active"
              value={form.is_active}
              onChange={handleChange}
            >
              <option value={1}>Aktif</option>
              <option value={0}>Nonaktif</option>
            </select>

            <textarea
              name="description"
              placeholder="Deskripsi menu"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <button
            className="save-menu-btn"
            onClick={saveMenu}
            disabled={saving}
          >
            <Save size={17} />
            {(() => {
              if (saving) return "Menyimpan...";
              if (editing) return "Simpan Perubahan";
              return "Tambah Menu";
            })()}
          </button>
        </section>

        {loading ? (
          <div className="menus-empty">Memuat data menu...</div>
        ) : (
          <section className="menus-table-card">
            <div className="table-title">
              <h2>Daftar Menu</h2>
              <p>{menus.length} menu terdaftar</p>
            </div>

            <div className="menus-table-wrap">
              <table className="menus-table">
                <thead>
                  <tr>
                    <th>Menu</th>
                    <th>Kategori</th>
                    <th>Harga</th>
                    <th>Gambar</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {menus.map((menu) => (
                    <tr key={menu.id}>
                      <td>
                        <strong>{menu.name}</strong>
                        <small>{menu.description}</small>
                      </td>
                      <td>{categoryLabels[menu.category] || menu.category}</td>
                      <td>{formatRupiah(menu.price)}</td>
                      <td>{menu.image}</td>
                      <td>
                        <span
                          className={
                            Number(menu.is_active) === 1
                              ? "active-badge"
                              : "inactive-badge"
                          }
                        >
                          {Number(menu.is_active) === 1 ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td>
                        <div className="menus-actions">
                          <button onClick={() => editMenu(menu)}>
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            className={
                              Number(menu.is_active) === 1
                                ? "deactivate-btn"
                                : "activate-btn"
                            }
                            onClick={() => toggleActive(menu)}
                          >
                            <Power size={15} />
                            {Number(menu.is_active) === 1
                              ? "Nonaktifkan"
                              : "Aktifkan"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
