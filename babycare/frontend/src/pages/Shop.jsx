import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch, FaShoppingCart, FaStar, FaFilter,
  FaMapMarkerAlt, FaLocationArrow, FaCheckCircle,
  FaPhone, FaClock, FaArrowRight, FaHeart,
  FaTruck, FaShieldAlt, FaTag, FaTimes, FaPlus, FaMinus,
} from "react-icons/fa";
import { HiOutlineShieldCheck } from "react-icons/hi";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";

const PRODUCTS = [
  { id: 1,  name: "Belladonna 30C",          brand: "SBL",        price: 180, oldPrice: 220,  rating: 4.8, reviews: 142, tag: "Best Seller", category: "Homeopathic", for: "Fever & Inflammation",    inStock: true,  emoji: "💊" },
  { id: 2,  name: "Chamomilla 30C",          brand: "Reckeweg",   price: 210, oldPrice: null, rating: 4.7, reviews: 98,  tag: "Top Rated",   category: "Homeopathic", for: "Teething & Irritability", inStock: true,  emoji: "💊" },
  { id: 3,  name: "Aconite 30C",             brand: "SBL",        price: 160, oldPrice: 200,  rating: 4.6, reviews: 76,  tag: "",            category: "Homeopathic", for: "Sudden Fever & Cough",    inStock: true,  emoji: "💊" },
  { id: 4,  name: "Ginger Honey Syrup",      brand: "NatureCure", price: 350, oldPrice: 420,  rating: 4.9, reviews: 210, tag: "Best Seller", category: "Organic",     for: "Cold & Cough Relief",     inStock: true,  emoji: "🍯" },
  { id: 5,  name: "Tulsi Baby Drops",        brand: "Hamdard",    price: 290, oldPrice: null, rating: 4.7, reviews: 134, tag: "New",         category: "Organic",     for: "Immunity & Fever",        inStock: true,  emoji: "🌿" },
  { id: 6,  name: "Coconut Oil (Baby Grade)",brand: "Dabur",      price: 420, oldPrice: 500,  rating: 4.8, reviews: 188, tag: "",            category: "Organic",     for: "Skin & Massage",          inStock: true,  emoji: "🥥" },
  { id: 7,  name: "Nux Vomica 30C",          brand: "Reckeweg",   price: 195, oldPrice: null, rating: 4.5, reviews: 62,  tag: "",            category: "Homeopathic", for: "Colic & Digestion",       inStock: false, emoji: "💊" },
  { id: 8,  name: "Pulsatilla 30C",          brand: "SBL",        price: 175, oldPrice: 210,  rating: 4.6, reviews: 88,  tag: "",            category: "Homeopathic", for: "Cold & Ear Infections",   inStock: true,  emoji: "💊" },
  { id: 9,  name: "Saunf (Fennel) Syrup",    brand: "NatureCure", price: 260, oldPrice: null, rating: 4.8, reviews: 156, tag: "Top Rated",   category: "Organic",     for: "Gas & Colic Relief",      inStock: true,  emoji: "🌱" },
  { id: 10, name: "Chamomile Baby Tea",      brand: "Hamdard",    price: 310, oldPrice: 380,  rating: 4.7, reviews: 112, tag: "New",         category: "Organic",     for: "Sleep & Colic",           inStock: true,  emoji: "🍵" },
  { id: 11, name: "Calc Carb 30C",           brand: "SBL",        price: 185, oldPrice: null, rating: 4.5, reviews: 54,  tag: "",            category: "Homeopathic", for: "Teething & Growth",       inStock: true,  emoji: "💊" },
  { id: 12, name: "Aloe Vera Baby Gel",      brand: "Dabur",      price: 380, oldPrice: 450,  rating: 4.9, reviews: 204, tag: "Best Seller", category: "Organic",     for: "Skin Rash & Irritation",  inStock: true,  emoji: "🌵" },
];

const STORES = [
  { id: 1, name: "Al-Shifa Homeopathic Store", area: "Gulshan-e-Iqbal, Karachi", distance: 0.6, rating: 4.8, phone: "021-34561234", hours: "9AM – 10PM", open: true,  onlineOrder: true,  tag: "Nearest" },
  { id: 2, name: "Hamdard Dawakhana",          area: "PECHS Block 2, Karachi",   distance: 1.2, rating: 4.7, phone: "021-34987654", hours: "8AM – 9PM",  open: true,  onlineOrder: true,  tag: "Popular" },
  { id: 3, name: "SBL Homeopathy Center",      area: "DHA Phase 4, Karachi",     distance: 2.4, rating: 4.6, phone: "021-35123456", hours: "10AM – 8PM", open: false, onlineOrder: false, tag: "" },
  { id: 4, name: "Natural Cure Pharmacy",      area: "North Nazimabad, Karachi", distance: 3.1, rating: 4.5, phone: "021-36654321", hours: "9AM – 11PM", open: true,  onlineOrder: true,  tag: "" },
  { id: 5, name: "Reckeweg Pakistan",          area: "Clifton Block 5, Karachi", distance: 4.8, rating: 4.9, phone: "021-35789012", hours: "9AM – 9PM",  open: true,  onlineOrder: true,  tag: "Premium" },
];

const CATEGORIES = ["All", "Homeopathic", "Organic"];

const TAG_COLORS = {
  "Best Seller": { bg: "#fef3c7", color: "#92400e" },
  "Top Rated":   { bg: "#dbeafe", color: "#1e40af" },
  "New":         { bg: "#dcfce7", color: "#166534" },
  "Nearest":     { bg: "#dcfce7", color: "#166534" },
  "Popular":     { bg: "#dbeafe", color: "#1e40af" },
  "Premium":     { bg: "#fce7f3", color: "#9d174d" },
};

// ═══════════════ HOVER STYLES ═══════════════
const hoverStyles = `
  .shop-product-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .shop-product-card:hover {
    transform: translateY(-6px);
    border-color: #2a9d5c !important;
    box-shadow: 0 16px 32px rgba(42,157,92,0.12);
  }
  .shop-product-card:hover .shop-product-image {
    transform: scale(1.05);
  }
  .shop-product-image {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .shop-store-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .shop-store-card:hover {
    transform: translateY(-4px);
    border-color: #2a9d5c !important;
    box-shadow: 0 12px 28px rgba(42,157,92,0.12);
  }

  .shop-btn-primary {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .shop-btn-primary:hover:not(:disabled) {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(26,110,63,0.35) !important;
  }
  .shop-btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .shop-btn-outline {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .shop-btn-outline:hover {
    background: #e8f8ef !important;
    transform: translateY(-2px);
  }

  .shop-tab {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .shop-tab:hover:not(.active) {
    color: #2a9d5c;
  }

  .shop-pill {
    transition: all 0.2s ease;
  }
  .shop-pill:hover:not(.active) {
    background: #fafffe !important;
    border-color: #2a9d5c !important;
    color: #1a6e3f !important;
  }

  .shop-wishlist-btn {
    transition: all 0.2s ease;
  }
  .shop-wishlist-btn:hover {
    transform: scale(1.15);
  }

  .shop-search-input {
    transition: all 0.2s ease;
  }
  .shop-search-input:focus {
    border-color: #2a9d5c !important;
    background: #fff !important;
    box-shadow: 0 0 0 4px rgba(42,157,92,0.1);
  }

  .shop-cart-fab {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: cart-pulse 2s ease-in-out infinite;
  }
  .shop-cart-fab:hover {
    transform: scale(1.08);
    box-shadow: 0 12px 32px rgba(26,110,63,0.5) !important;
  }
  @keyframes cart-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.04); }
  }

  .shop-cart-item-btn {
    transition: all 0.2s ease;
  }
  .shop-cart-item-btn:hover {
    background: #2a9d5c !important;
    color: #fff !important;
  }

  .shop-cart-close {
    transition: all 0.2s ease;
  }
  .shop-cart-close:hover {
    background: #fef2f2 !important;
    color: #dc2626 !important;
  }

  .shop-checkout-btn {
    transition: all 0.25s ease;
  }
  .shop-checkout-btn:hover {
    background: #0f4f2e !important;
    box-shadow: 0 8px 20px rgba(26,110,63,0.4);
  }

  .shop-store-action-btn {
    transition: all 0.2s ease;
  }
  .shop-store-action-btn:hover {
    transform: translateY(-2px);
  }

  @keyframes added-pop {
    0%   { transform: scale(0.95); opacity: 0; }
    50%  { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  .shop-added-badge {
    animation: added-pop 0.4s ease-out;
  }

  @keyframes pulse-loc {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .shop-loc-loading {
    animation: pulse-loc 1.5s ease-in-out infinite;
  }

  /* ═══════════════ MOBILE RESPONSIVE ═══════════════ */
  @media (max-width: 768px) {
    .shop-container { padding: 24px 14px 90px !important; }

    /* Tabs full-width */
    .shop-tabs-wrap { padding: 0 !important; }
    .shop-tabs { width: 100%; }
    .shop-tab { flex: 1; padding: 10px 8px !important; font-size: 12.5px !important; }

    /* Filter bar stacks */
    .shop-filter-bar { grid-template-columns: 1fr !important; gap: 10px !important; }
    .shop-cat-pills { overflow-x: auto; flex-wrap: nowrap !important; padding-bottom: 4px; }
    .shop-cat-pills::-webkit-scrollbar { display: none; }
    .shop-cat-pill { flex-shrink: 0; white-space: nowrap; }

    /* Products: 2-column grid */
    .shop-products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
    .shop-product-card .productBody { padding: 12px 12px 14px !important; }

    /* Store cards stack */
    .shop-store-card { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
    .shop-store-actions { width: 100%; flex-direction: row; }
    .shop-store-actions a, .shop-store-actions button { flex: 1; justify-content: center; }

    /* Cart FAB: above bottom nav */
    .shop-cart-fab { bottom: calc(72px + env(safe-area-inset-bottom, 0px)) !important; right: 16px !important; padding: 10px 14px !important; }

    /* Cart panel full width on mobile */
    .shop-cart-panel { max-width: 100vw !important; }

    /* Trust strip scrolls */
    .shop-trust-strip { overflow-x: auto; flex-wrap: nowrap !important; justify-content: flex-start !important; padding: 10px 12px !important; }
    .shop-trust-strip::-webkit-scrollbar { display: none; }
    .shop-trust-divider { display: none; }
  }

  @media (max-width: 380px) {
    .shop-products-grid { grid-template-columns: 1fr !important; }
  }
`;

export default function Shop() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("shop");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [locState, setLocState] = useState("idle");
  const [showCart, setShowCart] = useState(false);
  const [addedId, setAddedId] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) return;
    setLocState("loading");
    navigator.geolocation.getCurrentPosition(
      () => setLocState("found"),
      () => setLocState("denied")
    );
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const newQty = i.qty + delta;
        return newQty <= 0 ? null : { ...i, qty: newQty };
      }).filter(Boolean)
    );
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const toggleWishlist = (id) => setWishlist((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                       p.for.toLowerCase().includes(search.toLowerCase()) ||
                       p.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={s.root}>
      <style>{hoverStyles}</style>

      <div style={s.container} className="shop-container">
        {/* ═══════════════ HEADER ═══════════════ */}
        <div style={s.header}>
          <div style={s.badge}>
            <HiOutlineShieldCheck size={11} color={MINT_DARK} />
            <span>Verified Pharmacy Network</span>
          </div>
          <h1 style={s.title}>BabyCare Pharmacy</h1>
          <p style={s.sub}>
            Genuine homeopathic & organic medicines from trusted Pakistani pharmacies.
            Same-day delivery available in major cities.
          </p>
        </div>

        {/* ═══════════════ TABS ═══════════════ */}
        <div style={s.tabsWrap} className="shop-tabs-wrap">
          <div style={s.tabs} className="shop-tabs">
            <button
              style={{ ...s.tab, ...(tab === "shop" ? s.tabActive : {}) }}
              className={`shop-tab ${tab === "shop" ? "active" : ""}`}
              onClick={() => setTab("shop")}
            >
              <FaShoppingCart size={12} />
              Products ({PRODUCTS.length})
            </button>
            <button
              style={{ ...s.tab, ...(tab === "stores" ? s.tabActive : {}) }}
              className={`shop-tab ${tab === "stores" ? "active" : ""}`}
              onClick={() => setTab("stores")}
            >
              <FaMapMarkerAlt size={12} />
              Nearby Stores ({STORES.length})
            </button>
          </div>
        </div>

        {/* ═══════════════ SHOP TAB ═══════════════ */}
        {tab === "shop" && (
          <>
            {/* Search & Filter Bar */}
            <div style={s.filterBar} className="shop-filter-bar">
              <div style={s.searchWrap}>
                <FaSearch size={13} color={TEXT_MUTED} style={s.searchIcon} />
                <input
                  type="text"
                  placeholder="Search medicines by name, brand, or condition..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={s.searchInput}
                  className="shop-search-input"
                />
              </div>

              <div style={s.catPills} className="shop-cat-pills">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`shop-pill shop-cat-pill ${category === cat ? "active" : ""}`}
                    style={{ ...s.catPill, ...(category === cat ? s.catPillActive : {}) }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Strip */}
            <div style={s.trustStrip} className="shop-trust-strip">
              <div style={s.trustItem}>
                <FaTruck size={13} color={MINT_DARK} />
                <span>Same-Day Delivery</span>
              </div>
              <div style={s.trustDivider} className="shop-trust-divider" />
              <div style={s.trustItem}>
                <HiOutlineShieldCheck size={13} color={MINT_DARK} />
                <span>100% Genuine Products</span>
              </div>
              <div style={s.trustDivider} className="shop-trust-divider" />
              <div style={s.trustItem}>
                <FaShieldAlt size={13} color={MINT_DARK} />
                <span>Secure Payment</span>
              </div>
            </div>

            {/* Products Grid */}
            <div style={s.productsGrid} className="shop-products-grid">
              {filtered.length === 0 ? (
                <div style={s.emptyBox}>
                  <FaSearch size={40} color="#d4eddf" style={{ marginBottom: 14 }} />
                  <p style={{ fontSize: 15, color: TEXT_BODY, fontWeight: 700 }}>No products found</p>
                  <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 6 }}>Try a different search term or category</p>
                </div>
              ) : filtered.map((p) => {
                const inWishlist = wishlist.includes(p.id);
                const justAdded = addedId === p.id;
                const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

                return (
                  <div key={p.id} style={s.productCard} className="shop-product-card">
                    {/* Top: Image + Wishlist + Badge */}
                    <div style={s.productTop}>
                      {p.tag && (
                        <div style={{ ...s.productTag, ...(TAG_COLORS[p.tag] || {}) }}>
                          {p.tag}
                        </div>
                      )}

                      <button
                        onClick={() => toggleWishlist(p.id)}
                        style={s.wishlistBtn}
                        className="shop-wishlist-btn"
                        aria-label="Add to wishlist"
                      >
                        <FaHeart size={13} color={inWishlist ? "#dc2626" : TEXT_MUTED} />
                      </button>

                      <div style={s.productImageBox}>
                        <span style={s.productEmoji} className="shop-product-image">{p.emoji}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={s.productBody}>
                      <div style={s.productBrand}>{p.brand}</div>
                      <h3 style={s.productName}>{p.name}</h3>
                      <div style={s.productFor}>For: {p.for}</div>

                      <div style={s.productRating}>
                        <FaStar size={11} color="#f59e0b" />
                        <span style={s.ratingValue}>{p.rating}</span>
                        <span style={s.ratingCount}>({p.reviews})</span>
                      </div>

                      <div style={s.productPriceRow}>
                        <div style={s.productPriceWrap}>
                          <span style={s.productPrice}>Rs. {p.price}</span>
                          {p.oldPrice && (
                            <>
                              <span style={s.productOldPrice}>Rs. {p.oldPrice}</span>
                              <span style={s.discountBadge}>-{discount}%</span>
                            </>
                          )}
                        </div>
                      </div>

                      {!p.inStock ? (
                        <button style={{ ...s.addBtn, opacity: 0.5, cursor: "not-allowed" }} disabled>
                          Out of Stock
                        </button>
                      ) : justAdded ? (
                        <button style={s.addedBtn} className="shop-added-badge">
                          <FaCheckCircle size={12} />
                          Added to Cart
                        </button>
                      ) : (
                        <button
                          style={s.addBtn}
                          className="shop-btn-primary"
                          onClick={() => addToCart(p)}
                        >
                          <FaShoppingCart size={11} />
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ═══════════════ STORES TAB ═══════════════ */}
        {tab === "stores" && (
          <>
            {/* Location Box */}
            <div style={s.locationBox}>
              <div style={s.locationInfo}>
                <div style={s.locationIconBox}>
                  <FaMapMarkerAlt size={16} color={MINT_DARK} />
                </div>
                <div>
                  <div style={s.locationTitle}>
                    {locState === "idle" && "Find pharmacies near you"}
                    {locState === "loading" && <span className="shop-loc-loading">Detecting your location...</span>}
                    {locState === "found" && "Location detected ✓"}
                    {locState === "denied" && "Showing pharmacies in Karachi"}
                  </div>
                  <div style={s.locationSub}>
                    {locState === "found" ? "Showing nearest pharmacies based on your location" : "Enable location for personalized results"}
                  </div>
                </div>
              </div>

              {locState !== "found" && (
                <button style={s.locationBtn} className="shop-btn-outline" onClick={getLocation}>
                  <FaLocationArrow size={11} />
                  Detect Location
                </button>
              )}
            </div>

            {/* Trust Strip */}
            <div style={s.trustStrip}>
              <div style={s.trustItem}>
                <HiOutlineShieldCheck size={13} color={MINT_DARK} />
                <span>PMDC Verified Stores</span>
              </div>
              <div style={s.trustDivider} />
              <div style={s.trustItem}>
                <FaCheckCircle size={13} color={MINT_DARK} />
                <span>Genuine Medicines</span>
              </div>
              <div style={s.trustDivider} />
              <div style={s.trustItem}>
                <FaTruck size={13} color={MINT_DARK} />
                <span>Home Delivery</span>
              </div>
            </div>

            {/* Stores List */}
            <div style={s.storesList}>
              {STORES.map((store) => (
                <div key={store.id} style={s.storeCard} className="shop-store-card">
                  <div style={s.storeLeft}>
                    <div style={s.storeIconBox}>
                      <FaMapMarkerAlt size={18} color={MINT_DARK} />
                    </div>

                    <div>
                      <div style={s.storeTopRow}>
                        <h3 style={s.storeName}>{store.name}</h3>
                        {store.tag && (
                          <span style={{ ...s.storeTag, ...(TAG_COLORS[store.tag] || {}) }}>
                            {store.tag}
                          </span>
                        )}
                      </div>

                      <div style={s.storeMetaRow}>
                        <span style={s.storeMeta}>
                          <FaMapMarkerAlt size={10} color={TEXT_MUTED} />
                          {store.area}
                        </span>
                        <span style={s.storeMeta}>
                          <FaLocationArrow size={10} color={TEXT_MUTED} />
                          {store.distance} km
                        </span>
                      </div>

                      <div style={s.storeMetaRow}>
                        <span style={s.storeMeta}>
                          <FaStar size={10} color="#f59e0b" />
                          {store.rating} rating
                        </span>
                        <span style={s.storeMeta}>
                          <FaClock size={10} color={TEXT_MUTED} />
                          {store.hours}
                        </span>
                        <span style={{
                          ...s.storeMeta,
                          color: store.open ? MINT_DARK : "#dc2626",
                          fontWeight: 700,
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: store.open ? "#10b981" : "#dc2626",
                            display: "inline-block",
                          }} />
                          {store.open ? "Open Now" : "Closed"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={s.storeActions} className="shop-store-actions">
                    <a href={`tel:${store.phone}`} style={s.storeCallBtn} className="shop-store-action-btn">
                      <FaPhone size={11} />
                      Call
                    </a>
                    {store.onlineOrder && (
                      <button style={s.storeOrderBtn} className="shop-btn-primary" onClick={() => setTab("shop")}>
                        <FaShoppingCart size={11} />
                        Order Online
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══════════════ CART SIDEBAR ═══════════════ */}
        {showCart && (
          <div style={s.cartOverlay} onClick={(e) => { if (e.target === e.currentTarget) setShowCart(false); }}>
            <div style={s.cartPanel}>
              <div style={s.cartHeader}>
                <div>
                  <h3 style={s.cartTitle}>Your Cart</h3>
                  <p style={s.cartSub}>{cartCount} {cartCount === 1 ? "item" : "items"}</p>
                </div>
                <button style={s.cartClose} className="shop-cart-close" onClick={() => setShowCart(false)}>
                  <FaTimes size={14} />
                </button>
              </div>

              <div style={s.cartBody}>
                {cart.length === 0 ? (
                  <div style={s.emptyCart}>
                    <FaShoppingCart size={40} color="#d4eddf" style={{ marginBottom: 14 }} />
                    <p style={{ fontSize: 14, color: TEXT_BODY, fontWeight: 700 }}>Your cart is empty</p>
                    <p style={{ fontSize: 12.5, color: TEXT_MUTED, marginTop: 6 }}>Add some products to get started</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} style={s.cartItem}>
                      <div style={s.cartItemImg}>{item.emoji}</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.cartItemName}>{item.name}</div>
                        <div style={s.cartItemBrand}>{item.brand}</div>
                        <div style={s.cartItemPrice}>Rs. {item.price}</div>
                      </div>

                      <div style={s.qtyControls}>
                        <button
                          style={s.qtyBtn}
                          className="shop-cart-item-btn"
                          onClick={() => updateQty(item.id, -1)}
                        >
                          <FaMinus size={9} />
                        </button>
                        <span style={s.qtyValue}>{item.qty}</span>
                        <button
                          style={s.qtyBtn}
                          className="shop-cart-item-btn"
                          onClick={() => updateQty(item.id, 1)}
                        >
                          <FaPlus size={9} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div style={s.cartFooter}>
                  <div style={s.cartTotalRow}>
                    <span style={s.cartTotalLabel}>Subtotal</span>
                    <span style={s.cartTotalValue}>Rs. {cartTotal}</span>
                  </div>
                  <div style={s.cartDeliveryNote}>
                    <FaTruck size={11} color={MINT_DARK} />
                    Free delivery on orders above Rs. 1,500
                  </div>
                  <button style={s.checkoutBtn} className="shop-checkout-btn">
                    Proceed to Checkout
                    <FaArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ FLOATING CART BUTTON ═══════════════ */}
        {cartCount > 0 && !showCart && (
          <button style={s.cartFab} className="shop-cart-fab" onClick={() => setShowCart(true)}>
            <FaShoppingCart size={18} color="#fff" />
            <span style={s.fabCount}>{cartCount}</span>
            <span style={s.fabLabel}>Rs. {cartTotal}</span>
          </button>
        )}
      </div>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "#fafffe",
    fontFamily: "'Inter','Nunito','Segoe UI',sans-serif",
    color: TEXT_DARK,
  },
  container: { maxWidth: 1200, margin: "0 auto", padding: "44px 24px 80px", position: "relative" },

  // HEADER
  header: { textAlign: "center", marginBottom: 32 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "#fff",
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    padding: "6px 13px",
    borderRadius: 30,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 16,
    boxShadow: "0 2px 8px rgba(42,157,92,0.08)",
  },
  title: {
    fontSize: "clamp(24px, 3.5vw, 36px)",
    fontWeight: 800,
    color: TEXT_DARK,
    letterSpacing: "-0.8px",
    margin: "0 0 12px",
  },
  sub: { fontSize: 15.5, color: TEXT_BODY, maxWidth: 580, margin: "0 auto", lineHeight: 1.6 },

  // TABS
  tabsWrap: { display: "flex", justifyContent: "center", marginBottom: 28 },
  tabs: {
    display: "flex",
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 11,
    padding: 5,
    gap: 4,
  },
  tab: {
    padding: "10px 22px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    fontWeight: 700,
    fontSize: 13.5,
    cursor: "pointer",
    color: TEXT_MUTED,
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  tabActive: {
    background: MINT_DARK,
    color: "#fff",
    boxShadow: "0 2px 8px rgba(26,110,63,0.25)",
  },

  // FILTER BAR
  filterBar: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 14,
    marginBottom: 18,
    alignItems: "center",
  },
  searchWrap: { position: "relative" },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 11,
    padding: "11px 14px 11px 38px",
    fontSize: 14,
    fontFamily: "inherit",
    color: TEXT_DARK,
    outline: "none",
    boxSizing: "border-box",
  },
  catPills: { display: "flex", gap: 6 },
  catPill: {
    background: "#fff",
    border: `1.5px solid ${BORDER}`,
    color: TEXT_BODY,
    borderRadius: 10,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  catPillActive: {
    background: MINT_LIGHT,
    border: `1.5px solid ${MINT_DARK}`,
    color: MINT_DARK,
  },

  // TRUST STRIP
  trustStrip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    padding: "12px 16px",
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    marginBottom: 22,
    flexWrap: "wrap",
  },
  trustItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontSize: 12.5,
    color: TEXT_BODY,
    fontWeight: 700,
  },
  trustDivider: { width: 1, height: 14, background: BORDER },

  // EMPTY
  emptyBox: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "80px 20px",
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
  },

  // PRODUCTS GRID
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: 18,
  },
  productCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  productTop: {
    background: MINT_LIGHT,
    height: 140,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productTag: {
    position: "absolute",
    top: 12,
    left: 12,
    padding: "4px 9px",
    borderRadius: 5,
    fontSize: 10.5,
    fontWeight: 800,
    letterSpacing: 0.4,
  },
  wishlistBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 32,
    height: 32,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(15,32,24,0.1)",
    zIndex: 2,
  },
  productImageBox: {
    width: 100,
    height: 100,
    background: "#fff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(15,32,24,0.08)",
  },
  productEmoji: { fontSize: 48 },

  productBody: { padding: "16px 18px 18px" },
  productBrand: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: "0 0 4px",
    lineHeight: 1.3,
    letterSpacing: "-0.2px",
  },
  productFor: {
    fontSize: 12.5,
    color: TEXT_BODY,
    fontWeight: 500,
    marginBottom: 10,
    lineHeight: 1.4,
  },
  productRating: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  ratingValue: { fontSize: 13, fontWeight: 800, color: TEXT_DARK },
  ratingCount: { fontSize: 12, color: TEXT_MUTED, fontWeight: 600 },

  productPriceRow: { marginBottom: 14 },
  productPriceWrap: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  productPrice: {
    fontSize: 19,
    fontWeight: 800,
    color: MINT_DARK,
    letterSpacing: "-0.3px",
  },
  productOldPrice: {
    fontSize: 13,
    color: TEXT_MUTED,
    textDecoration: "line-through",
    fontWeight: 600,
  },
  discountBadge: {
    fontSize: 10.5,
    background: "#fef3c7",
    color: "#92400e",
    padding: "2px 7px",
    borderRadius: 5,
    fontWeight: 800,
  },

  addBtn: {
    width: "100%",
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "10px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    boxShadow: "0 3px 10px rgba(26,110,63,0.2)",
  },
  addedBtn: {
    width: "100%",
    background: MINT_LIGHT,
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    borderRadius: 9,
    padding: "9px",
    fontWeight: 800,
    fontSize: 13,
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  // LOCATION BOX
  locationBox: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "16px 20px",
    marginBottom: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  locationInfo: { display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 },
  locationIconBox: {
    width: 44,
    height: 44,
    borderRadius: 11,
    background: MINT_LIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  locationTitle: { fontSize: 14.5, fontWeight: 800, color: TEXT_DARK, marginBottom: 3 },
  locationSub: { fontSize: 12.5, color: TEXT_MUTED, fontWeight: 600 },
  locationBtn: {
    background: "#fff",
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    borderRadius: 9,
    padding: "9px 16px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },

  // STORES
  storesList: { display: "flex", flexDirection: "column", gap: 12 },
  storeCard: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
    padding: "18px 22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  storeLeft: { display: "flex", gap: 14, alignItems: "flex-start", flex: 1, minWidth: 0 },
  storeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 11,
    background: MINT_LIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  storeTopRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" },
  storeName: {
    fontSize: 15.5,
    fontWeight: 800,
    color: TEXT_DARK,
    margin: 0,
    letterSpacing: "-0.3px",
  },
  storeTag: {
    fontSize: 10.5,
    fontWeight: 800,
    padding: "3px 8px",
    borderRadius: 5,
    letterSpacing: 0.3,
  },
  storeMetaRow: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 4,
  },
  storeMeta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12.5,
    color: TEXT_MUTED,
    fontWeight: 600,
  },
  storeActions: { display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" },
  storeCallBtn: {
    background: "#fff",
    color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    borderRadius: 9,
    padding: "9px 16px",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
  },
  storeOrderBtn: {
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 9,
    padding: "10px 16px",
    fontWeight: 700,
    fontSize: 12.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 3px 10px rgba(26,110,63,0.25)",
  },

  // CART
  cartOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,32,24,0.4)",
    backdropFilter: "blur(4px)",
    zIndex: 100,
    display: "flex",
    justifyContent: "flex-end",
  },
  cartPanel: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-12px 0 40px rgba(0,0,0,0.15)",
  },
  cartHeader: {
    padding: "18px 22px",
    borderBottom: `1px solid ${BORDER}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartTitle: { fontSize: 18, fontWeight: 800, color: TEXT_DARK, margin: 0 },
  cartSub: { fontSize: 12.5, color: TEXT_MUTED, fontWeight: 600, margin: "3px 0 0" },
  cartClose: {
    background: "#f4f9f6",
    border: "none",
    width: 32,
    height: 32,
    borderRadius: 8,
    cursor: "pointer",
    color: TEXT_MUTED,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBody: { flex: 1, overflowY: "auto", padding: "16px 22px" },
  emptyCart: { textAlign: "center", padding: "60px 20px" },
  cartItem: {
    display: "flex",
    gap: 12,
    padding: "12px 0",
    borderBottom: `1px solid ${BORDER}`,
    alignItems: "center",
  },
  cartItemImg: {
    width: 50,
    height: 50,
    background: MINT_LIGHT,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    flexShrink: 0,
  },
  cartItemName: { fontSize: 13.5, fontWeight: 800, color: TEXT_DARK, marginBottom: 2 },
  cartItemBrand: { fontSize: 11.5, color: TEXT_MUTED, fontWeight: 600, marginBottom: 4 },
  cartItemPrice: { fontSize: 13, color: MINT_DARK, fontWeight: 800 },
  qtyControls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f4f9f6",
    borderRadius: 8,
    padding: 4,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 6,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: TEXT_BODY,
    fontFamily: "inherit",
  },
  qtyValue: { fontSize: 13, fontWeight: 800, color: TEXT_DARK, minWidth: 16, textAlign: "center" },

  cartFooter: { padding: "20px 22px", borderTop: `1px solid ${BORDER}`, background: "#fafffe" },
  cartTotalRow: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  cartTotalLabel: { fontSize: 14, color: TEXT_MUTED, fontWeight: 700 },
  cartTotalValue: { fontSize: 20, fontWeight: 800, color: TEXT_DARK },
  cartDeliveryNote: {
    fontSize: 12,
    color: TEXT_BODY,
    fontWeight: 600,
    marginBottom: 14,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  checkoutBtn: {
    width: "100%",
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 11,
    padding: "13px",
    fontWeight: 700,
    fontSize: 14.5,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 4px 14px rgba(26,110,63,0.3)",
  },

  // FAB
  cartFab: {
    position: "fixed",
    bottom: 24,
    right: 24,
    background: MINT_DARK,
    color: "#fff",
    border: "none",
    borderRadius: 50,
    padding: "12px 20px",
    boxShadow: "0 6px 24px rgba(26,110,63,0.4)",
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 10,
    zIndex: 50,
  },
  fabCount: {
    background: "#fff",
    color: MINT_DARK,
    borderRadius: "50%",
    minWidth: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11.5,
    fontWeight: 900,
    padding: "0 6px",
  },
  fabLabel: { fontSize: 13.5, fontWeight: 800 },
};