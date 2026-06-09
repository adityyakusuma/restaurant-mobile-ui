import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ReceiptText,
  Plus,
  Minus,
  X,
  Utensils,
  Coffee,
  CakeSlice,
  Soup,
  Table2,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import "./App.css";

import nasiGoreng from "./assets/menu/nasi-goreng.jpg";
import ayamBakar from "./assets/menu/ayam-bakar.jpg";
import mieGoreng from "./assets/menu/mie-goreng.jpg";
import tempeMendoan from "./assets/menu/tempe-mendoan.jpg";
import pisangGorengKeju from "./assets/menu/pisang-goreng-keju.jpg";
import kentangGoreng from "./assets/menu/kentang-goreng.jpg";
import pudingCokelat from "./assets/menu/puding-cokelat.jpg";
import esCampur from "./assets/menu/es-campur.jpg";
import esTehManis from "./assets/menu/es-teh-manis.jpg";
import jusAlpukat from "./assets/menu/jus-alpukat.jpg";
import airMineral from "./assets/menu/air-mineral.jpg";

const API_URL = "http://localhost/resto-api";

const imageMap = {
  "nasi-goreng.jpg": nasiGoreng,
  "ayam-bakar.jpg": ayamBakar,
  "mie-goreng.jpg": mieGoreng,
  "tempe-mendoan.jpg": tempeMendoan,
  "pisang-goreng-keju.jpg": pisangGorengKeju,
  "kentang-goreng.jpg": kentangGoreng,
  "puding-cokelat.jpg": pudingCokelat,
  "es-campur.jpg": esCampur,
  "es-teh-manis.jpg": esTehManis,
  "jus-alpukat.jpg": jusAlpukat,
  "air-mineral.jpg": airMineral,
};

const categories = [
  { id: "maincourse", label: "Makanan Utama", icon: Soup },
  { id: "snack", label: "Camilan", icon: Utensils },
  { id: "dessert", label: "Penutup", icon: CakeSlice },
  { id: "drink", label: "Minuman", icon: Coffee },
];

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatTanggalIndonesia(dateValue) {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CustomerOrder() {
  const navigate = useNavigate();

  // Menu States
  const [menus, setMenus] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [activeCategory, setActiveCategory] = useState("maincourse");
  const [selectedMenu, setSelectedMenu] = useState(null);

  // Order & Cart States
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [orderType, setOrderType] = useState("dine_in");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableWarning, setTableWarning] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [addedToast, setAddedToast] = useState("");
  const [cartBump, setCartBump] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Booking / Reservation States
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingWarning, setBookingWarning] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingData, setBookingData] = useState({
    name: "",
    phone: "",
    table_number: "",
    date: "",
    time: "",
    guests: "",
  });

  // Admin States
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");

  // Memoized & Derived Values
  const tableValue = Number(tableNumber);
  const isTableValid =
    tableNumber.trim() !== "" &&
    Number.isInteger(tableValue) &&
    tableValue >= 1 &&
    tableValue <= 25;

  const filteredMenus = menus.filter((item) => item.category === activeCategory);

  const featuredMenus = menus
    .filter((item) => item.badge || item.id === 1 || item.id === 2 || item.id === 9)
    .slice(0, 4);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const estimatedTime = useMemo(() => {
    if (totalItems <= 2) return "10 - 15 Menit";
    if (totalItems <= 5) return "15 - 20 Menit";
    return "20 - 30 Menit";
  }, [totalItems]);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setMenuLoading(true);
      setMenuError("");

      const response = await fetch(`${API_URL}/menus.php`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil data menu.");
      }

      const menusFromApi = result.data
        .filter((item) => Number(item.is_active) === 1)
        .map((item) => ({
          id: Number(item.id),
          name: item.name,
          category: item.category,
          price: Number(item.price),
          badge: getMenuBadge(item.name),
          image: imageMap[item.image] || nasiGoreng,
          imageName: item.image,
          desc: item.description,
        }));

      setMenus(menusFromApi);
    } catch (error) {
      setMenuError("Menu belum bisa dimuat. Pastikan WampServer dan resto-api sudah aktif.");
    } finally {
      setMenuLoading(false);
    }
  };

  const getMenuBadge = (name) => {
    const badges = {
      "Nasi Goreng Rempah": "Menu Favorit",
      "Ayam Bakar Madu": "Rekomendasi",
      "Tempe Mendoan": "Camilan Favorit",
      "Kentang Goreng": "Camilan Baru",
      "Es Campur Nusantara": "Segar",
      "Jus Alpukat": "Best Seller",
    };
    return badges[name] || "";
  };

  const handleAdminLogin = () => {
    if (adminUsername === "admin" && adminPassword === "admin123") {
      localStorage.setItem("adminAuth", "true");
      setAdminLoginOpen(false);
      setAdminUsername("");
      setAdminPassword("");
      setAdminLoginError("");
      navigate("/admin");
      return;
    }
    setAdminLoginError("Username atau password admin salah.");
  };

  const handleTableChange = (e) => {
    const onlyNumber = e.target.value.replace(/\D/g, "");
    if (onlyNumber.length > 2) return;

    setTableNumber(onlyNumber);

    if (onlyNumber === "") {
      setTableWarning(false);
      return;
    }

    const value = Number(onlyNumber);
    setTableWarning(!(value >= 1 && value <= 25));
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
    setBookingWarning("");
  };

  const handleBookingPhoneChange = (e) => {
    const onlyNumber = e.target.value.replace(/\D/g, "");
    if (onlyNumber.length > 13) return;
    setBookingData((prev) => ({ ...prev, phone: onlyNumber }));
    setBookingWarning("");
  };

  const handleBookingTableChange = (e) => {
    const onlyNumber = e.target.value.replace(/\D/g, "");
    if (onlyNumber.length > 2) return;
    setBookingData((prev) => ({ ...prev, table_number: onlyNumber }));
    setBookingWarning("");
  };

  const handleBookingTimeChange = (e) => {
    let value = e.target.value.replace(/[^\d:]/g, "");
    if (value.length === 2 && !value.includes(":")) {
      value += ":";
    }
    if (value.length > 5) return;
    setBookingData((prev) => ({ ...prev, time: value }));
    setBookingWarning("");
  };

  const handleBookingSubmit = async () => {
    const { name, phone, table_number, date, time, guests } = bookingData;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!name.trim() || !phone || !table_number || !date || !time || !guests) {
      setBookingWarning("Lengkapi semua data reservasi terlebih dahulu.");
      return;
    }

    if (phone.length < 10 || phone.length > 13) {
      setBookingWarning("Nomor telepon harus berisi 10 sampai 13 digit.");
      return;
    }

    if (Number(table_number) < 1 || Number(table_number) > 25) {
      setBookingWarning("Nomor meja reservasi harus dari 1 sampai 25.");
      return;
    }

    if (!timeRegex.test(time)) {
      setBookingWarning("Gunakan format jam Indonesia, contoh: 18:30 atau 07:15.");
      return;
    }

    if (Number(guests) < 1) {
      setBookingWarning("Jumlah tamu minimal 1 orang.");
      return;
    }

    try {
      setSubmitLoading(true);
      const response = await fetch(`${API_URL}/reservations.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          phone,
          table_number: Number(table_number),
          reservation_date: date,
          reservation_time: time,
          guests: Number(guests),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal membuat reservasi.");
      }

      setBookingSuccess(
        `Reservasi atas nama ${name} berhasil dibuat untuk Meja ${table_number} pada ${formatTanggalIndonesia(
          date
        )}, pukul ${time}, untuk ${guests} tamu.`
      );

      setBookingData({ name: "", phone: "", table_number: "", date: "", time: "", guests: "" });
      setBookingWarning("");
      setBookingOpen(false);

      setTimeout(() => setBookingSuccess(""), 3500);
    } catch (error) {
      setBookingWarning(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openMenu = (menu) => {
    setSelectedMenu(menu);
    setQty(1);
    setNote("");
  };

  const addToCart = () => {
    if (!selectedMenu) return;

    const existingItem = cart.find(
      (item) => item.menuId === selectedMenu.id && item.note === note
    );

    if (existingItem) {
      setCart((prev) =>
        prev.map((item) =>
          item.cartId === existingItem.cartId ? { ...item, qty: item.qty + qty } : item
        )
      );
    } else {
      const cartItem = {
        cartId: Date.now(),
        menuId: selectedMenu.id,
        name: selectedMenu.name,
        price: selectedMenu.price,
        image: selectedMenu.image,
        qty,
        note,
      };
      setCart((prev) => [...prev, cartItem]);
    }

    setAddedToast(`${selectedMenu.name} masuk ke keranjang`);
    setCartBump(true);
    setSelectedMenu(null);
    setQty(1);
    setNote("");

    setTimeout(() => setCartBump(false), 500);
    setTimeout(() => setAddedToast(""), 1800);
  };

  const removeCartItem = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateCartQty = (cartId, type) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId !== cartId) return item;
          const newQty = type === "plus" ? item.qty + 1 : item.qty - 1;
          return { ...item, qty: newQty };
        })
        .filter((item) => item.qty > 0)
    );
  };

  const handlePayment = async () => {
    if (orderType === "dine_in" && !isTableValid) {
      setTableWarning(true);
      return;
    }

    if (
    orderType === "take_away" &&
    (
        !customerName.trim() ||
        !customerPhone.trim()
    )
    ) {
    alert("Lengkapi data pemesan.");
    return;
    }

    if (
    orderType === "take_away" &&
    customerPhone.length < 10
    ) {
    alert("Nomor telepon minimal 10 digit.");
    return;
    }

    if (cart.length === 0) return;

    try {
      setSubmitLoading(true);
      setTableWarning(false);

      const response = await fetch(`${API_URL}/orders.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_type: orderType,
          table_number: orderType === "dine_in" ? Number(tableNumber) : null,
          customer_name: orderType === "take_away" ? customerName : null,
          customer_phone: orderType === "take_away" ? customerPhone : null,
          items: cart.map((item) => ({
            menu_id: item.menuId,
            quantity: item.qty,
            notes: item.note,
          })),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal membuat pesanan.");
      }

      setOrderCode(`#${result.order_code}`);
      setCartOpen(false);
      setReceiptOpen(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

    const orderAgain = () => {
    setCart([]);
    setReceiptOpen(false);
    setOrderCode("");

    setCustomerName("");
    setCustomerPhone("");

    setOrderType("dine_in");
    };

  return (
    <main className="app-shell">
      <section className="phone-frame">
        {/* Header */}
        <header className="top-header animate-in delay-1">
          <div className="brand">
            <div className="brand-logo">
              <Utensils size={20} />
            </div>
            <div>
              <h1>Dapur Rempah</h1>
              <p>Cita rasa Nusantara dalam setiap sajian</p>
            </div>
          </div>
          <button className="admin-entry-btn" onClick={() => setAdminLoginOpen(true)}>
            <ShieldCheck size={16} />
            Admin
          </button>
        </header>

        {/* Hero Section */}
        <section className="hero-section animate-in delay-2">
          <div>
            <span className="hero-label">Pesan dari meja Anda</span>
            <h2>Makan lebih mudah, cepat, dan nyaman.</h2>
            <p>
              Pilih menu favorit, tambahkan catatan, lalu lanjutkan pembayaran langsung dari satu halaman.
            </p>
          </div>
        </section>

        {/* Order Type Section */}
        <section className="table-box animate-in delay-3">
          <div className="section-title-row">
            <div>
              <h3>Jenis Pesanan</h3>
              <p>Pilih metode pemesanan</p>
            </div>
          </div>
          <div className="order-type-buttons">
            <button
              type="button"
              className={orderType === "dine_in" ? "active" : ""}
              onClick={() => setOrderType("dine_in")}
            >
              <Utensils size={16} />
              Dine In
            </button>
            <button
              type="button"
              className={orderType === "take_away" ? "active" : ""}
              onClick={() => setOrderType("take_away")}
            >
              <ShoppingBag size={16} />
              Take Away
            </button>
          </div>
        </section>

        {/* Dynamic Section: Take Away Details */}
        {orderType === "take_away" && (
          <section className="table-box">
            <div className="section-title-row">
              <div>
                <h3>Data Pemesan</h3>
                <p>Isi data pelanggan take away</p>
              </div>
            </div>
            <input
              type="text"
              placeholder="Nama Pemesan"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Nomor Telepon"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
            />
          </section>
        )}

        {/* Dynamic Section: Dine In Details */}
        {orderType === "dine_in" && (
          <section className="table-box animate-in delay-3">
            <div className="section-title-row">
              <div>
                <h3>Nomor Meja</h3>
                <p>Masukkan nomor meja 1 sampai 25</p>
              </div>
              <Table2 size={22} />
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Contoh: 12"
              value={tableNumber}
              onChange={handleTableChange}
            />
            {tableWarning && (
              <p className="warning-text">Nomor meja hanya tersedia dari 1 sampai 25.</p>
            )}
            {isTableValid && (
              <div className="connected-status">
                <CheckCircle2 size={16} />
                Meja {Number(tableNumber)} terhubung
              </div>
            )}
          </section>
        )}

        {/* Reservation Section */}
        <section className="booking-box animate-in delay-4">
          <button className="booking-toggle" onClick={() => setBookingOpen(!bookingOpen)}>
            <span>Reservasi Meja</span>
            <span>{bookingOpen ? "Tutup" : "Buka"}</span>
          </button>

          {bookingOpen && (
            <div className="booking-form">
              <input
                name="name"
                placeholder="Nama pemesan"
                value={bookingData.name}
                onChange={handleBookingChange}
              />
              <input
                name="phone"
                type="text"
                inputMode="numeric"
                placeholder="Nomor telepon, contoh: 081234567890"
                value={bookingData.phone}
                onChange={handleBookingPhoneChange}
              />
              <input
                name="table_number"
                type="text"
                inputMode="numeric"
                placeholder="Nomor meja reservasi, contoh: 7"
                value={bookingData.table_number}
                onChange={handleBookingTableChange}
              />
              <input
                name="date"
                type="date"
                value={bookingData.date}
                onChange={handleBookingChange}
              />
              <input
                name="time"
                type="text"
                inputMode="numeric"
                placeholder="Jam kedatangan, contoh: 18:30"
                value={bookingData.time}
                onChange={handleBookingTimeChange}
              />
              <input
                name="guests"
                type="number"
                placeholder="Jumlah tamu"
                value={bookingData.guests}
                onChange={handleBookingChange}
              />
              {bookingWarning && <p className="warning-text">{bookingWarning}</p>}
              <button onClick={handleBookingSubmit} disabled={submitLoading}>
                {submitLoading ? "Memproses..." : "Reservasi Sekarang"}
              </button>
            </div>
          )}
        </section>

        {bookingSuccess && (
          <div className="booking-success">
            <CheckCircle2 size={18} />
            <span>{bookingSuccess}</span>
          </div>
        )}

        {/* Featured Menu Section */}
        <section className="featured-section animate-in delay-5">
          <div className="section-title-row">
            <div>
              <h3>Menu Favorit Hari Ini</h3>
              <p>Pilihan terbaik dari dapur kami</p>
            </div>
          </div>

          {menuLoading && <p className="menu-message">Memuat menu...</p>}
          {menuError && <p className="warning-text">{menuError}</p>}

          {!menuLoading && !menuError && (
            <div className="featured-strip">
              {featuredMenus.map((item) => (
                <button key={item.id} className="featured-item" onClick={() => openMenu(item)}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <span>{item.badge || "Pilihan Menu"}</span>
                    <strong>{item.name}</strong>
                    <small>{formatRupiah(item.price)}</small>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Category Navigation */}
        <nav className="category-tabs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className={activeCategory === cat.id ? "active" : ""}
                onClick={() => setActiveCategory(cat.id)}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            );
          })}
        </nav>

        {/* Menu Grid Section */}
        <section className="menu-section">
          {!menuLoading &&
            !menuError &&
            filteredMenus.map((item, index) => (
              <button
                key={item.id}
                className="menu-row menu-appear"
                style={{ animationDelay: `${index * 0.06}s` }}
                onClick={() => openMenu(item)}
              >
                <img src={item.image} alt={item.name} />
                <div className="menu-info">
                  <div className="menu-name-row">
                    <h4>{item.name}</h4>
                    {item.badge && <span>{item.badge}</span>}
                  </div>
                  <p>{item.desc}</p>
                  <strong>{formatRupiah(item.price)}</strong>
                </div>
              </button>
            ))}
        </section>

        {/* Toast Notification */}
        {addedToast && (
          <div className="added-toast">
            <div className="toast-icon">
              <ShoppingBag size={18} />
            </div>
            <span>{addedToast}</span>
          </div>
        )}

        {/* Floating Cart Button */}
        {totalItems > 0 && (
          <button
            className={`floating-cart ${cartBump ? "cart-bump" : ""}`}
            onClick={() => setCartOpen(true)}
          >
            <div>
              <ShoppingBag size={20} />
              <span>{totalItems} Menu</span>
            </div>
            <strong>{formatRupiah(totalPrice)}</strong>
          </button>
        )}

        {/* Detail Sheet Overlay */}
        {selectedMenu && (
          <div className="overlay" onClick={() => setSelectedMenu(null)}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelectedMenu(null)}>
                <X size={20} />
              </button>
              <img className="sheet-image" src={selectedMenu.image} alt={selectedMenu.name} />
              <div className="sheet-content">
                <span className="sheet-badge">{selectedMenu.badge || "Menu"}</span>
                <h3>{selectedMenu.name}</h3>
                <p>{selectedMenu.desc}</p>
                <strong>{formatRupiah(selectedMenu.price)}</strong>

                <textarea
                  placeholder="Tambah catatan, contoh: tidak pedas, sambal dipisah..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <div className="qty-row">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>
                    <Minus size={18} />
                  </button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(qty + 1)}>
                    <Plus size={18} />
                  </button>
                </div>

                <button className="primary-btn" onClick={addToCart}>
                  Tambah ke Keranjang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cart Sheet Overlay */}
        {cartOpen && (
          <div className="overlay" onClick={() => setCartOpen(false)}>
            <div className="cart-sheet" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setCartOpen(false)}>
                <X size={20} />
              </button>

              <div className="cart-header">
                <div>
                  <h3>Keranjang Pesanan</h3>
                  <p>{totalItems} menu dipilih</p>
                </div>
                <ShoppingBag size={24} />
              </div>

              <div className="cart-list">
                {cart.map((item) => (
                  <div className="cart-item" key={item.cartId}>
                    <img src={item.image} alt={item.name} />
                    <div>
                      <h4>{item.name}</h4>
                      <p>{formatRupiah(item.price)}</p>
                      {item.note && <small>Catatan: {item.note}</small>}

                      <div className="cart-actions">
                        <button onClick={() => updateCartQty(item.cartId, "minus")}>
                          <Minus size={14} />
                        </button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateCartQty(item.cartId, "plus")}>
                          <Plus size={14} />
                        </button>
                        <button className="remove-btn" onClick={() => removeCartItem(item.cartId)}>
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div>
                  <span>Total Pesanan</span>
                  <strong>{formatRupiah(totalPrice)}</strong>
                </div>
                <div>
                  <span>Estimasi Penyajian</span>
                  <strong>{estimatedTime}</strong>
                </div>

                {orderType === "dine_in" && !isTableValid && (
                  <p className="warning-text">Nomor meja harus diisi dari 1 sampai 25.</p>
                )}
                {orderType === "take_away" && (!customerName.trim() || !customerPhone.trim()) && (
                  <p className="warning-text">Data pemesan belum lengkap.</p>
                )}

                <button
                  className="primary-btn"
                  onClick={handlePayment}
                  disabled={
                    !cart.length ||
                    submitLoading ||
                    (orderType === "dine_in" && !isTableValid) ||
                    (orderType === "take_away" && (!customerName.trim() || !customerPhone.trim()))
                  }
                >
                  {submitLoading ? "Memproses..." : "Lanjut Pembayaran"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal Overlay */}
        {receiptOpen && (
          <div className="overlay">
            <div className="receipt-modal">
              <div className="receipt-icon">
                <ReceiptText size={26} />
              </div>

              <h3>Pesanan Diterima</h3>
              <p className="receipt-subtitle">Pesanan Anda sedang diproses oleh dapur kami.</p>

              <div className="order-status">
                <div className="active">
                  <CheckCircle2 size={16} />
                  Pesanan Diterima
                </div>
                <div>
                  <Clock size={16} />
                  Sedang Dimasak
                </div>
                <div>
                  <Utensils size={16} />
                  Siap Disajikan
                </div>
              </div>

              <div className="thermal-receipt">
                <h4>Dapur Rempah</h4>
                <p>Cita rasa Nusantara</p>
                <hr />

                <div className="receipt-line">
                  <span>Nomor Pesanan</span>
                  <strong>{orderCode}</strong>
                </div>
                {orderType === "dine_in" && (
                <div className="receipt-line">
                    <span>Nomor Meja</span>
                    <strong>{Number(tableNumber)}</strong>
                </div>
                )}

                {orderType === "take_away" && (
                <>
                    <div className="receipt-line">
                    <span>Jenis Pesanan</span>
                    <strong>Take Away</strong>
                    </div>

                    <div className="receipt-line">
                    <span>Nama Pemesan</span>
                    <strong>{customerName}</strong>
                    </div>

                    <div className="receipt-line">
                    <span>No. Telepon</span>
                    <strong>{customerPhone}</strong>
                    </div>
                </>
                )}

                <div className="receipt-line">
                  <span>Estimasi</span>
                  <strong>{estimatedTime}</strong>
                </div>

                <hr />

                {cart.map((item) => (
                  <div className="receipt-menu" key={item.cartId}>
                    <span>{item.name}</span>
                    <small>
                      {item.qty} x {formatRupiah(item.price)}
                    </small>
                  </div>
                ))}

                <hr />

                <div className="receipt-total">
                  <span>Total</span>
                  <strong>{formatRupiah(totalPrice)}</strong>
                </div>
              </div>

              <button className="primary-btn" onClick={orderAgain}>
                Pesan Lagi
              </button>
            </div>
          </div>
        )}

        {/* Admin Login Modal Overlay */}
        {adminLoginOpen && (
          <div className="overlay" onClick={() => setAdminLoginOpen(false)}>
            <div className="admin-login-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setAdminLoginOpen(false)}>
                <X size={20} />
              </button>

              <div className="admin-login-icon">
                <ShieldCheck size={26} />
              </div>

              <h3>Masuk Admin</h3>
              <p>Gunakan akun demo untuk mengakses dashboard restoran.</p>

              <input
                type="text"
                placeholder="Username"
                value={adminUsername}
                onChange={(e) => {
                  setAdminUsername(e.target.value);
                  setAdminLoginError("");
                }}
              />

              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setAdminLoginError("");
                  }}
                />
                <button onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {adminLoginError && <p className="warning-text">{adminLoginError}</p>}

              <div className="demo-account">
                <span>Demo Admin</span>
                <strong>admin / admin123</strong>
              </div>

              <button className="primary-btn" onClick={handleAdminLogin}>
                Masuk Dashboard
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}