import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch, FaShoppingCart, FaStar, FaFilter,
  FaMapMarkerAlt, FaLocationArrow, FaCheckCircle,
  FaPhone, FaClock, FaArrowRight, FaHeart,
  FaTruck, FaShieldAlt, FaTag,
} from "react-icons/fa";
import { MdVerified, MdMyLocation, MdStorefront } from "react-icons/md";
import { FaPills } from "react-icons/fa6";

const MINT       = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK  = "#1a6e3f";

const PRODUCTS = [
  { id: 1,  name: "Belladonna 30C",         brand: "SBL",        price: 180,  oldPrice: 220,  rating: 4.8, reviews: 142, tag: "Best Seller", category: "Homeopathic", for: "Fever & Inflammation",    inStock: true,  img: "💊" },
  { id: 2,  name: "Chamomilla 30C",          brand: "Reckeweg",   price: 210,  oldPrice: null, rating: 4.7, reviews: 98,  tag: "Top Rated",   category: "Homeopathic", for: "Teething & Irritability", inStock: true,  img: "💊" },
  { id: 3,  name: "Aconite 30C",             brand: "SBL",        price: 160,  oldPrice: 200,  rating: 4.6, reviews: 76,  tag: "",            category: "Homeopathic", for: "Sudden Fever & Cough",    inStock: true,  img: "💊" },
  { id: 4,  name: "Ginger Honey Syrup",      brand: "NatureCure", price: 350,  oldPrice: 420,  rating: 4.9, reviews: 210, tag: "Best Seller", category: "Organic",     for: "Cold & Cough Relief",     inStock: true,  img: "🍯" },
  { id: 5,  name: "Tulsi Baby Drops",        brand: "Hamdard",    price: 290,  oldPrice: null, rating: 4.7, reviews: 134, tag: "New",         category: "Organic",     for: "Immunity & Fever",        inStock: true,  img: "🌿" },
  { id: 6,  name: "Coconut Oil (Baby Grade)",brand: "Dabur",      price: 420,  oldPrice: 500,  rating: 4.8, reviews: 188, tag: "",            category: "Organic",     for: "Skin & Massage",          inStock: true,  img: "🥥" },
  { id: 7,  name: "Nux Vomica 30C",          brand: "Reckeweg",   price: 195,  oldPrice: null, rating: 4.5, reviews: 62,  tag: "",            category: "Homeopathic", for: "Colic & Digestion",       inStock: false, img: "💊" },
  { id: 8,  name: "Pulsatilla 30C",          brand: "SBL",        price: 175,  oldPrice: 210,  rating: 4.6, reviews: 88,  tag: "",            category: "Homeopathic", for: "Cold & Ear Infections",   inStock: true,  img: "💊" },
  { id: 9,  name: "Saunf (Fennel) Syrup",    brand: "NatureCure", price: 260,  oldPrice: null, rating: 4.8, reviews: 156, tag: "Top Rated",   category: "Organic",     for: "Gas & Colic Relief",      inStock: true,  img: "🌱" },
  { id: 10, name: "Chamomile Baby Tea",       brand: "Hamdard",    price: 310,  oldPrice: 380,  rating: 4.7, reviews: 112, tag: "New",         category: "Organic",     for: "Sleep & Colic",           inStock: true,  img: "🍵" },
  { id: 11, name: "Calc Carb 30C",           brand: "SBL",        price: 185,  oldPrice: null, rating: 4.5, reviews: 54,  tag: "",            category: "Homeopathic", for: "Teething & Growth",       inStock: true,  img: "💊" },
  { id: 12, name: "Aloe Vera Baby Gel",      brand: "Dabur",      price: 380,  oldPrice: 450,  rating: 4.9, reviews: 204, tag: "Best Seller", category: "Organic",     for: "Skin Rash & Irritation",  inStock: true,  img: "🌵" },
];

const STORES = [
  { id: 1, name: "Al-Shifa Homeopathic Store",  area: "Gulshan-e-Iqbal, Karachi", distance: 0.6, rating: 4.8, phone: "021-34561234", hours: "9AM – 10PM", open: true,  onlineOrder: true,  tag: "Nearest" },
  { id: 2, name: "Hamdard Dawakhana",           area: "PECHS Block 2, Karachi",   distance: 1.2, rating: 4.7, phone: "021-34987654", hours: "8AM – 9PM",  open: true,  onlineOrder: true,  tag: "Popular" },
  { id: 3, name: "SBL Homeopathy Center",       area: "DHA Phase 4, Karachi",     distance: 2.4, rating: 4.6, phone: "021-35123456", hours: "10AM – 8PM", open: false, onlineOrder: false, tag: "" },
  { id: 4, name: "Natural Cure Pharmacy",       area: "North Nazimabad, Karachi", distance: 3.1, rating: 4.5, phone: "021-36654321", hours: "9AM – 11PM", open: true,  onlineOrder: true,  tag: "" },
  { id: 5, name: "Reckeweg Pakistan",           area: "Clifton Block 5, Karachi", distance: 4.8, rating: 4.9, phone: "021-35789012", hours: "9AM – 9PM",  open: true,  onlineOrder: true,  tag: "Premium" },
];

const CATEGORIES = ["All", "Homeopathic", "Organic"];

export default function Shop() {
  const navigate = useNavigate();

  const [tab,        setTab]        = useState("shop");
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("All");
  const [cart,       setCart]       = useState([]);
  const [wishlist,   setWishlist]   = useState([]);
  const [locState,   setLocState]   = useState("idle");
  const [showCart,   setShowCart]   = useState(false);
  const [addedId,    setAddedId]    = useState(null);

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
    setTimeout(() => setAddedId(null), 1200);
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const toggleWishlist = (id) => setWishlist((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.for.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={s.root}>
      {/* ── SHOP HEADER ── */}
      <div style={s.hero}>
        {/* Decorative orbs */}
        <div className="bc-orb" style={{ width: 380, height: 380, background: "#5fcf8f", top: "-150px", right: "-80px" }} />
        <div className="bc-orb" style={{ width: 280, height: 280, background: "#7ce0a4", bottom: "-100px", left: "-40px", animationDelay: "2.5s" }} />

        <div style={s.heroInner}>
          <div className="bc-anim-fadeLeft">
            <span style={s.heroBadge}><MdStorefront size={12} /> BabyCare Shop</span>
            <h1 style={s.heroTitle}>Homeopathic & Organic<br /><span style={{ color: "#a7f3c4" }}>Baby Medicines</span></h1>
            <p style={s.heroSub}>Genuine medicines delivered to your door — or find the nearest store in your area</p>
          </div>
          <div style={s.trustRow} className="bc-anim-fadeRight bc-d1">
            {[[FaTruck, "Free Delivery Rs.1000+"], [FaShieldAlt, "100% Genuine"], [FaCheckCircle, "Cash on Delivery"]].map(([Icon, label], i) => (
              <div key={label} style={s.trustItem} className={`bc-anim-fadeUp bc-d${i + 2}`}>
                <Icon size={14} color="#a7f3c4" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.container}>

        {/* ── TAB SWITCHER ── */}
        <div style={s.tabRow} className="bc-anim-fadeUp">
          <button style={{ ...s.tabBtn, ...(tab === "shop" ? s.tabActive : {}) }} onClick={() => setTab("shop")}>
            <FaPills size={14} /> Online Shop
          </button>
          <button style={{ ...s.tabBtn, ...(tab === "stores" ? s.tabActive : {}) }} onClick={() => setTab("stores")}>
            <FaMapMarkerAlt size={14} /> Nearest Stores
          </button>
          {cartCount > 0 && (
            <button style={s.cartBtn} className="bc-btn-glow bc-anim-popIn" onClick={() => setShowCart((v) => !v)}>
              <FaShoppingCart size={15} />
              Cart ({cartCount}) — Rs. {cartTotal.toLocaleString()}
            </button>
          )}
        </div>

        {/* ── CART PANEL ── */}
        {showCart && cartCount > 0 && (
          <div style={s.cartPanel} className="bc-anim-fadeUp">
            <div style={s.cartHeader}>
              <span style={s.cartTitle}><FaShoppingCart size={15} /> Your Cart ({cartCount} items)</span>
              <button style={s.cartClose} onClick={() => setShowCart(false)}>✕ Close</button>
            </div>
            {cart.map((item, i) => (
              <div key={item.id} style={s.cartItem} className={`bc-anim-fadeLeft bc-d${i + 1}`}>
                <span style={s.cartItemIcon}>{item.img}</span>
                <div style={s.cartItemInfo}>
                  <span style={s.cartItemName}>{item.name}</span>
                  <span style={s.cartItemBrand}>{item.brand} · Rs. {item.price}</span>
                </div>
                <span style={s.cartItemQty}>x{item.qty}</span>
                <span style={s.cartItemTotal}>Rs. {(item.price * item.qty).toLocaleString()}</span>
                <button style={s.cartRemove} onClick={() => removeFromCart(item.id)}>✕</button>
              </div>
            ))}
            <div style={s.cartFooter}>
              <span style={s.cartTotalLabel}>Total: <strong>Rs. {cartTotal.toLocaleString()}</strong></span>
              <button style={s.btnPrimary} className="bc-btn-glow">Checkout <FaArrowRight size={12} /></button>
            </div>
          </div>
        )}

        {/* ════════════ TAB 1 — ONLINE SHOP ════════════ */}
        {tab === "shop" && (
          <div key="shop-tab">
            <div style={s.searchRow} className="bc-anim-fadeUp">
              <div style={s.searchBox}>
                <FaSearch size={14} color="#9ab5a5" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or symptom (e.g. fever, cough)..."
                  style={s.searchInput}
                />
              </div>
              <div style={s.catPills}>
                <FaFilter size={12} color="#9ab5a5" />
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    style={{ ...s.catPill, ...(category === c ? s.catActive : {}) }}>{c}</button>
                ))}
              </div>
            </div>

            <p style={s.resultCount}>{filtered.length} products found</p>

            <div style={s.productsGrid}>
              {filtered.map((product, i) => {
                const inCart    = cart.find((i) => i.id === product.id);
                const inWish    = wishlist.includes(product.id);
                const justAdded = addedId === product.id;

                return (
                  <div
                    key={product.id}
                    style={{ ...s.productCard, opacity: product.inStock ? 1 : 0.65 }}
                    className={`bc-glow-on-hover bc-anim-fadeUp bc-d${Math.min((i % 8) + 1, 8)}`}
                  >
                    {product.tag && <div style={s.productTag}><FaTag size={9} /> {product.tag}</div>}

                    <button style={s.wishBtn} onClick={() => toggleWishlist(product.id)}>
                      <FaHeart size={14} color={inWish ? "#e8a045" : "#d4eddf"} className={inWish ? "bc-check-pop" : ""} />
                    </button>

                    <div style={s.productImg}>{product.img}</div>

                    <div style={s.productCatBadge}>{product.category}</div>
                    <h3 style={s.productName}>{product.name}</h3>
                    <p style={s.productBrand}>{product.brand}</p>
                    <p style={s.productFor}>For: {product.for}</p>

                    <div style={s.ratingRow}>
                      {[1,2,3,4,5].map((n) => (
                        <FaStar key={n} size={11} color={n <= Math.round(product.rating) ? "#e8a045" : "#e0ede6"} />
                      ))}
                      <span style={s.ratingNum}>{product.rating} ({product.reviews})</span>
                    </div>

                    <div style={s.priceRow}>
                      <span style={s.price}>Rs. {product.price}</span>
                      {product.oldPrice && (
                        <span style={s.oldPrice}>Rs. {product.oldPrice}</span>
                      )}
                      {product.oldPrice && (
                        <span style={s.discount}>
                          -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                        </span>
                      )}
                    </div>

                    {product.inStock ? (
                      <button
                        style={{ ...s.addBtn, background: justAdded ? `linear-gradient(135deg, ${MINT_DARK}, ${MINT})` : `linear-gradient(135deg, ${MINT}, ${MINT_DARK})` }}
                        className="bc-btn-glow"
                        onClick={() => addToCart(product)}
                      >
                        {justAdded ? (
                          <span className="bc-check-pop" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <FaCheckCircle size={13} /> Added!
                          </span>
                        ) : inCart ? (
                          <><FaShoppingCart size={13} /> Add More</>
                        ) : (
                          <><FaShoppingCart size={13} /> Add to Cart</>
                        )}
                      </button>
                    ) : (
                      <div style={s.outOfStock}>Out of Stock</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════ TAB 2 — NEAREST STORES ════════════ */}
        {tab === "stores" && (
          <div key="stores-tab">
            <div style={s.locBanner} className="bc-anim-fadeUp">
              <div style={s.locLeft}>
                <div style={s.locIconBox} className={locState === "loading" ? "bc-float" : ""}>
                  <MdMyLocation size={22} color={MINT} />
                </div>
                <div>
                  <div style={s.locTitle}>Find Nearest Homeopathy Store</div>
                  <div style={s.locSub}>
                    {locState === "idle"    && "Location share karo — apke nazdeek stores pehle dikhenge"}
                    {locState === "loading" && "Location dhundh raha hai..."}
                    {locState === "found"   && "Location mil gayi! Nearest stores sorted hain"}
                    {locState === "denied"  && "Permission nahi mili — stores list manually dekho"}
                  </div>
                </div>
              </div>
              {locState === "idle" && (
                <button style={s.locBtn} className="bc-btn-glow" onClick={getLocation}>
                  <FaLocationArrow size={13} /> Share Location
                </button>
              )}
              {locState === "loading" && (
                <span style={s.locLoading}><span className="bc-spinner" /> Locating...</span>
              )}
              {locState === "found" && (
                <span style={s.locFoundBadge} className="bc-anim-popIn">
                  <FaCheckCircle size={13} color={MINT} /> Location Active
                </span>
              )}
              {locState === "denied" && (
                <button style={s.locBtnRetry} className="bc-btn-outline-glow" onClick={getLocation}>Retry</button>
              )}
            </div>

            {locState === "found" && (
              <div style={s.nearestBanner} className="bc-anim-fadeUp">
                <FaMapMarkerAlt size={13} color={MINT} />
                <span>Nearest store: <strong>{STORES[0].name}</strong> — only {STORES[0].distance} km away in {STORES[0].area}</span>
              </div>
            )}

            <a
              href="https://www.google.com/maps/search/homeopathy+medicine+store+near+me"
              target="_blank" rel="noreferrer"
              style={s.mapsLink}
              className="bc-btn-outline-glow"
            >
              <FaMapMarkerAlt size={14} color={MINT} />
              Open Google Maps — Search Nearby Homeopathy Stores
              <FaArrowRight size={12} color={MINT} />
            </a>

            <div style={s.storesGrid}>
              {STORES.map((store, i) => (
                <div
                  key={store.id}
                  style={s.storeCard}
                  className={`bc-glow-on-hover bc-anim-fadeUp bc-d${i + 1}`}
                >
                  {store.tag && <div style={s.storeTag}>{store.tag}</div>}

                  <div style={s.storeTop}>
                    <div style={s.storeIconBox}><MdStorefront size={24} color={MINT} /></div>
                    <div style={s.storeInfo}>
                      <div style={s.storeName}>{store.name}</div>
                      <div style={s.storeArea}>
                        <FaMapMarkerAlt size={11} color={MINT} /> {store.area}
                      </div>
                    </div>
                    <div style={{
                      ...s.distBadge,
                      background: store.distance <= 1 ? "#dcfce7" : store.distance <= 3 ? MINT_LIGHT : "#f3f4f6",
                      color:      store.distance <= 1 ? "#14532d"  : store.distance <= 3 ? MINT_DARK  : "#6b7280",
                    }}>
                      {store.distance} km
                    </div>
                  </div>

                  <div style={s.storeMeta}>
                    <div style={s.storeMetaItem}>
                      <FaStar size={11} color="#e8a045" /> {store.rating} Rating
                    </div>
                    <div style={s.storeMetaItem}>
                      <FaClock size={11} color={MINT} /> {store.hours}
                    </div>
                    <div style={{ ...s.storeMetaItem, color: store.open ? MINT : "#dc2626", fontWeight: 700 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: store.open ? MINT : "#dc2626", boxShadow: store.open ? "0 0 8px rgba(42,157,92,0.6)" : "none" }} />
                      {store.open ? "Open Now" : "Closed"}
                    </div>
                  </div>

                  <div style={s.storeBtns}>
                    <a href={`tel:${store.phone}`} style={s.btnCall} className="bc-btn-outline-glow">
                      <FaPhone size={12} /> Call Store
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(store.name + " " + store.area)}`}
                      target="_blank" rel="noreferrer"
                      style={s.btnMaps}
                      className="bc-btn-outline-glow"
                    >
                      <FaMapMarkerAlt size={12} /> Get Directions
                    </a>
                    {store.onlineOrder && (
                      <button style={s.btnOrder} className="bc-btn-glow" onClick={() => setTab("shop")}>
                        <FaShoppingCart size={12} /> Order Online
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={s.tipBox} className="bc-anim-fadeUp">
              <FaSearch size={14} color={MINT} />
              <span>
                Store nahi mila? <strong>Google Maps</strong> pe search karo:{" "}
                <em>"homeopathy store near me"</em> ya seedha online order karo upar wale Shop tab se.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "#fafffe", fontFamily: "'Nunito','Segoe UI',sans-serif" },

  hero: {
    background: `linear-gradient(135deg, ${MINT_DARK} 0%, ${MINT} 100%)`,
    padding: "48px 24px 44px",
    position: "relative", overflow: "hidden",
  },
  heroInner: { maxWidth: 1050, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, position: "relative", zIndex: 2 },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.22)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    color: "#fff", borderRadius: 20, padding: "5px 14px",
    fontSize: 12.5, fontWeight: 800, marginBottom: 14,
    border: "1px solid rgba(255,255,255,0.3)",
  },
  heroTitle: { fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, color: "#fff", lineHeight: 1.2, letterSpacing: "-1px", margin: "0 0 12px" },
  heroSub: { fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: 0, maxWidth: 500 },
  trustRow: { display: "flex", gap: 14, flexWrap: "wrap" },
  trustItem: {
    display: "flex", alignItems: "center", gap: 7,
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
    borderRadius: 10, padding: "8px 14px",
    fontSize: 13, fontWeight: 700, color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
  },

  container: { maxWidth: 1050, margin: "0 auto", padding: "32px 24px 72px" },

  tabRow: { display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center" },
  tabBtn: {
    padding: "11px 22px", borderRadius: 10,
    border: "2px solid #d4eddf",
    background: "rgba(240,250,244,0.7)",
    backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
    fontWeight: 700, fontSize: 14, cursor: "pointer",
    fontFamily: "inherit", color: "#3d5a48",
    display: "flex", alignItems: "center", gap: 7,
    transition: "all 0.22s ease",
  },
  tabActive: { background: MINT_LIGHT, border: `2px solid ${MINT}`, color: MINT_DARK, boxShadow: "0 0 0 3px rgba(42,157,92,0.1), 0 4px 14px rgba(42,157,92,0.18)" },
  cartBtn: {
    marginLeft: "auto",
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    color: "#fff", border: "none", borderRadius: 10,
    padding: "11px 20px", fontWeight: 800, fontSize: 13.5,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
    fontFamily: "inherit", boxShadow: "0 4px 14px rgba(42,157,92,0.32)",
  },

  cartPanel: {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(16px) saturate(140%)",
    WebkitBackdropFilter: "blur(16px) saturate(140%)",
    border: `2px solid ${MINT}`,
    borderRadius: 14, padding: "20px 22px", marginBottom: 24,
    boxShadow: "0 8px 30px rgba(42,157,92,0.18)",
  },
  cartHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  cartTitle: { fontSize: 15, fontWeight: 800, color: MINT_DARK, display: "flex", alignItems: "center", gap: 7 },
  cartClose: { background: "none", border: "none", cursor: "pointer", color: "#9ab5a5", fontWeight: 700, fontSize: 13, fontFamily: "inherit" },
  cartItem: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f0f5f2" },
  cartItemIcon: { fontSize: 22, flexShrink: 0 },
  cartItemInfo: { flex: 1 },
  cartItemName: { display: "block", fontSize: 13.5, fontWeight: 800, color: "#0f2018" },
  cartItemBrand: { display: "block", fontSize: 12, color: "#9ab5a5" },
  cartItemQty: { fontSize: 13, fontWeight: 700, color: "#3d5a48", minWidth: 28, textAlign: "center" },
  cartItemTotal: { fontSize: 14, fontWeight: 900, color: MINT_DARK, minWidth: 80, textAlign: "right" },
  cartRemove: { background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13, fontWeight: 900, padding: "0 4px" },
  cartFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, flexWrap: "wrap", gap: 12 },
  cartTotalLabel: { fontSize: 16, fontWeight: 700, color: "#1a2e24" },

  searchRow: { display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" },
  searchBox: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    border: "1.5px solid #d4eddf",
    borderRadius: 11, padding: "10px 16px", flex: "1 1 280px",
    transition: "all 0.2s ease",
  },
  searchInput: { border: "none", outline: "none", fontSize: 14, fontFamily: "inherit", color: "#1a2e24", background: "transparent", flex: 1 },
  catPills: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  catPill: { background: "rgba(240,250,244,0.7)", border: "1.5px solid #d4eddf", borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#3d5a48", transition: "all 0.22s ease" },
  catActive: { background: MINT_LIGHT, border: `2px solid ${MINT}`, color: MINT_DARK },
  resultCount: { fontSize: 13, color: "#9ab5a5", fontWeight: 600, margin: "0 0 18px" },

  productsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 18 },
  productCard: {
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(12px) saturate(140%)",
    WebkitBackdropFilter: "blur(12px) saturate(140%)",
    border: "1.5px solid rgba(224,237,230,0.7)",
    borderRadius: 16, padding: "20px 16px",
    position: "relative", boxShadow: "0 4px 14px rgba(42,157,92,0.07)",
    display: "flex", flexDirection: "column",
  },
  productTag: { position: "absolute", top: 12, left: 12, background: "#fef3c7", color: "#b45309", fontSize: 10.5, fontWeight: 800, borderRadius: 6, padding: "3px 8px", display: "flex", alignItems: "center", gap: 3 },
  wishBtn: { position: "absolute", top: 10, right: 10, background: "none", border: "none", cursor: "pointer", padding: 4 },
  productImg: { fontSize: 40, textAlign: "center", margin: "22px 0 14px" },
  productCatBadge: { display: "inline-block", background: MINT_LIGHT, color: MINT_DARK, fontSize: 10.5, fontWeight: 800, borderRadius: 6, padding: "2px 8px", marginBottom: 8 },
  productName: { fontSize: 14.5, fontWeight: 900, color: "#0f2018", margin: "0 0 3px", lineHeight: 1.3 },
  productBrand: { fontSize: 12, color: "#9ab5a5", fontWeight: 700, margin: "0 0 5px" },
  productFor: { fontSize: 11.5, color: "#5a7a6a", margin: "0 0 10px", lineHeight: 1.4, flex: 1 },
  ratingRow: { display: "flex", alignItems: "center", gap: 3, marginBottom: 10 },
  ratingNum: { fontSize: 11.5, color: "#9ab5a5", fontWeight: 600, marginLeft: 4 },
  priceRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 13 },
  price: { fontSize: 17, fontWeight: 900, color: MINT_DARK },
  oldPrice: { fontSize: 12.5, color: "#9ab5a5", textDecoration: "line-through" },
  discount: { fontSize: 11, fontWeight: 800, background: "#fee2e2", color: "#b91c1c", borderRadius: 5, padding: "2px 6px" },
  addBtn: {
    color: "#fff", border: "none", borderRadius: 9,
    padding: "10px 0", fontWeight: 800, fontSize: 13.5,
    cursor: "pointer", display: "flex", alignItems: "center",
    justifyContent: "center", gap: 7, width: "100%",
    fontFamily: "inherit",
    boxShadow: "0 4px 14px rgba(42,157,92,0.28)",
  },
  outOfStock: { background: "#f1f5f9", color: "#94a3b8", borderRadius: 9, padding: "10px 0", fontWeight: 700, fontSize: 13.5, textAlign: "center" },

  locBanner: {
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(14px) saturate(140%)",
    WebkitBackdropFilter: "blur(14px) saturate(140%)",
    border: "1.5px solid rgba(200,232,216,0.7)",
    borderRadius: 14, padding: "16px 20px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 16, marginBottom: 16, flexWrap: "wrap",
    boxShadow: "0 4px 16px rgba(42,157,92,0.08)",
  },
  locLeft: { display: "flex", alignItems: "center", gap: 14, flex: 1 },
  locIconBox: { width: 44, height: 44, background: MINT_LIGHT, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  locTitle: { fontSize: 15, fontWeight: 800, color: "#0f2018", marginBottom: 3 },
  locSub: { fontSize: 13, color: "#5a7a6a", lineHeight: 1.4 },
  locBtn: {
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    color: "#fff", border: "none", borderRadius: 9,
    padding: "10px 20px", fontWeight: 800, fontSize: 13.5,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
    fontFamily: "inherit", whiteSpace: "nowrap",
    boxShadow: "0 4px 14px rgba(42,157,92,0.3)",
  },
  locBtnRetry: { background: "transparent", color: MINT, border: `2px solid ${MINT}`, borderRadius: 9, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  locLoading: { fontSize: 13, color: "#5a7a6a", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 },
  locFoundBadge: { display: "flex", alignItems: "center", gap: 6, background: MINT_LIGHT, color: MINT_DARK, borderRadius: 9, padding: "8px 14px", fontSize: 13, fontWeight: 800 },

  nearestBanner: {
    background: "rgba(232,248,239,0.85)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    border: `1.5px solid #b2e0cc`, borderRadius: 10,
    padding: "11px 16px", display: "flex", alignItems: "center", gap: 9,
    fontSize: 13.5, color: MINT_DARK, marginBottom: 14, flexWrap: "wrap",
  },

  mapsLink: {
    display: "inline-flex", alignItems: "center", gap: 9,
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    border: `1.5px solid ${MINT}`, borderRadius: 11,
    padding: "11px 18px", fontSize: 13.5, fontWeight: 700,
    color: MINT_DARK, textDecoration: "none", marginBottom: 22,
  },

  storesGrid: { display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 },
  storeCard: {
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(12px) saturate(140%)",
    WebkitBackdropFilter: "blur(12px) saturate(140%)",
    border: "1.5px solid rgba(224,237,230,0.7)",
    borderRadius: 14, padding: "20px 22px",
    position: "relative", boxShadow: "0 4px 14px rgba(42,157,92,0.07)",
  },
  storeTag: { position: "absolute", top: 14, right: 14, background: MINT_LIGHT, color: MINT_DARK, fontSize: 11, fontWeight: 800, borderRadius: 6, padding: "3px 9px" },
  storeTop: { display: "flex", alignItems: "center", gap: 14, marginBottom: 12 },
  storeIconBox: { width: 46, height: 46, background: MINT_LIGHT, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  storeInfo: { flex: 1 },
  storeName: { fontSize: 16, fontWeight: 900, color: "#0f2018", marginBottom: 4 },
  storeArea: { fontSize: 13, color: "#5a7a6a", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 },
  distBadge: { fontSize: 12, fontWeight: 800, borderRadius: 8, padding: "5px 12px", flexShrink: 0 },
  storeMeta: { display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f0f5f2" },
  storeMetaItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#5a7a6a", fontWeight: 600 },
  storeBtns: { display: "flex", gap: 10, flexWrap: "wrap" },
  btnCall: { display: "inline-flex", alignItems: "center", gap: 7, background: "#fff", border: `1.5px solid ${MINT}`, color: MINT_DARK, borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, textDecoration: "none" },
  btnMaps: { display: "inline-flex", alignItems: "center", gap: 7, background: MINT_LIGHT, border: `1.5px solid ${MINT}`, color: MINT_DARK, borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, textDecoration: "none" },
  btnOrder: {
    display: "inline-flex", alignItems: "center", gap: 7,
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    color: "#fff", border: "none", borderRadius: 8,
    padding: "8px 16px", fontSize: 13, fontWeight: 800,
    cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 3px 10px rgba(42,157,92,0.28)",
  },

  tipBox: {
    background: "rgba(240,250,244,0.7)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    border: "1.5px solid #d4eddf", borderRadius: 11,
    padding: "14px 18px", display: "flex", alignItems: "flex-start",
    gap: 10, fontSize: 13.5, color: "#3d5a48", lineHeight: 1.65,
  },

  btnPrimary: {
    background: `linear-gradient(135deg, ${MINT}, ${MINT_DARK})`,
    color: "#fff", border: "none", borderRadius: 9,
    padding: "10px 22px", fontWeight: 800, fontSize: 14,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
    fontFamily: "inherit", boxShadow: "0 4px 14px rgba(42,157,92,0.3)",
  },
};
