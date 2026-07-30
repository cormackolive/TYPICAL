"use client";

import { useState } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  padding: "10px 12px",
  border: "1px solid var(--fg-2)",
  borderRadius: 4,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--fg-2)",
  marginBottom: 8,
  fontWeight: 700,
};

export default function SendPrModal({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState([{ title: "", price: "", qty: "1" }]);

  function addItem() {
    setItems((prev) => [...prev, { title: "", price: "", qty: "1" }]);
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateItem(i: number, patch: Partial<{ title: string; price: string; qty: string }>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(18,1,1,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          border: "2px solid var(--typical-black)",
          borderRadius: 4,
          padding: 32,
          maxWidth: 540,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--typical-orange)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 200 200" style={{ width: 20, height: 20, stroke: "white", strokeWidth: 12, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }}>
              <path d="M 75 70 Q 50 50 40 40 Q 30 30 40 20 Q 50 10 70 30 Q 100 50 100 50 Q 100 50 130 30 Q 150 10 160 20 Q 170 30 160 40 Q 150 50 125 70" />
              <rect x="40" y="75" width="120" height="90" rx="5" />
              <line x1="100" y1="75" x2="100" y2="165" />
              <line x1="40" y1="110" x2="160" y2="110" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, letterSpacing: "-0.01em", margin: 0 }}>Send PR</h2>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Customer Name</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input style={inputStyle} placeholder="First name" />
            <input style={inputStyle} placeholder="Last name" />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Email</div>
          <input style={inputStyle} type="email" placeholder="customer@example.com" />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Shipping Address</div>
          <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Street address" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input style={inputStyle} placeholder="City" />
            <input style={inputStyle} placeholder="State/Province" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input style={inputStyle} placeholder="Zip/Postal code" />
            <input style={inputStyle} placeholder="Country" />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Order Items</div>
          <div style={{ border: "1px solid var(--fg-2)", borderRadius: 4, padding: 12, marginBottom: 12 }}>
            {items.map((item, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < items.length - 1 ? "1px solid var(--fg-2)" : "none" }}>
                <div style={{ fontSize: 11, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  Product Title
                </div>
                <input
                  style={{ ...inputStyle, marginBottom: 12 }}
                  placeholder="e.g. Stretch Towel"
                  value={item.title}
                  onChange={(e) => updateItem(i, { title: e.target.value })}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: 12, alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Price</div>
                    <input
                      style={inputStyle}
                      type="number"
                      step="0.01"
                      placeholder="99.99"
                      value={item.price}
                      onChange={(e) => updateItem(i, { price: e.target.value })}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Qty</div>
                    <input
                      style={inputStyle}
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateItem(i, { qty: e.target.value })}
                    />
                  </div>
                  <button
                    style={{ fontSize: 12, padding: 8, border: "1px solid var(--fg-2)", background: "white", cursor: "pointer", borderRadius: 4 }}
                    onClick={() => removeItem(i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            style={{
              width: "100%",
              fontSize: 12,
              padding: 10,
              border: "1px solid var(--typical-orange)",
              background: "transparent",
              color: "var(--typical-orange)",
              cursor: "pointer",
              borderRadius: 4,
              fontWeight: 600,
            }}
            onClick={addItem}
          >
            + Add item
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Discount Code (optional)</div>
          <input style={inputStyle} placeholder="e.g. INFLUENCER10" />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Order Tags (optional)</div>
          <input style={inputStyle} placeholder="e.g. influencer, ugc, collab" />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Order Notes (optional)</div>
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="Special instructions…" />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={{
              flex: 1,
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              padding: 12,
              borderRadius: 4,
              border: "2px solid var(--typical-black)",
              cursor: "pointer",
              fontWeight: 600,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              background: "white",
              color: "var(--fg-1)",
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{
              flex: 1,
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              padding: 12,
              borderRadius: 4,
              border: "2px solid var(--typical-black)",
              cursor: "pointer",
              fontWeight: 600,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              background: "var(--typical-orange)",
              color: "white",
            }}
            onClick={() => window.open("https://admin.shopify.com", "_blank")}
          >
            Go to Shopify to Send
          </button>
        </div>
      </div>
    </div>
  );
}
