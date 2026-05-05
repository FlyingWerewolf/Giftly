import { useState } from "react";

const OCCASIONS = ["Birthday", "Christmas", "Anniversary", "Graduation", "Baby Shower", "Wedding", "Just Because"];
const BUDGET_OPTIONS = ["Under $25", "$25–$50", "$50–$100", "$100–$250", "No limit"];
const INTERESTS_LIST = ["Travel", "Fitness", "Cooking", "Gaming", "Reading", "Music", "Art", "Fashion", "Tech", "Outdoors", "Movies", "Sports", "Beauty", "DIY", "Pets"];

const FRIENDS = [
  { id: 1, name: "Sarah M.", initials: "SM", color: "#E8D5F5", textColor: "#6B21A8", bio: "28 • Loves yoga & brunch" },
  { id: 2, name: "James T.", initials: "JT", color: "#D5EAF5", textColor: "#1D4ED8", bio: "34 • Into hiking & tech" },
  { id: 3, name: "Priya K.", initials: "PK", color: "#F5D5E8", textColor: "#9D174D", bio: "25 • Artist & foodie" },
];

export default function GiftApp() {
  const [screen, setScreen] = useState("home");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [form, setForm] = useState({ occasion: "", budget: "", interests: [], age: "", note: "" });
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleInterest(interest) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter(i => i !== interest)
        : [...f.interests, interest]
    }));
  }

  async function getRecommendations() {
    setLoading(true);
    setError("");
    setGifts([]);
    try {
      const prompt = `You are a thoughtful gift advisor. Give 4 specific, creative gift recommendations.

Friend: ${selectedFriend.name}
Age: ${form.age || "unknown"}
Occasion: ${form.occasion}
Budget: ${form.budget}
Interests: ${form.interests.join(", ") || "general"}
Extra notes: ${form.note || "none"}

Respond ONLY with a JSON array of 4 objects, no markdown, no explanation. Each object must have:
- "title": short gift name (max 5 words)
- "description": one sentence why it's perfect for them
- "price": estimated price like "$45"
- "emoji": one relevant emoji
- "where": one place to buy it (e.g. "Amazon", "Etsy", "Local bookstore")`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      const text = data.content.map(b => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setGifts(parsed);
      setScreen("results");
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  const canSubmit = form.occasion && form.budget && selectedFriend;

  const styles = {
    phone: {
      maxWidth: 390,
      margin: "0 auto",
      minHeight: 700,
      background: "#0F0F0F",
      borderRadius: 44,
      overflow: "hidden",
      border: "8px solid #1A1A1A",
      fontFamily: "'Georgia', serif",
      position: "relative",
      boxShadow: "0 0 0 1px #2A2A2A"
    },
    screen: {
      background: "#FAF8F3",
      minHeight: 684,
      overflowY: "auto",
      position: "relative"
    },
    statusBar: {
      background: "#FAF8F3",
      padding: "12px 24px 0",
      display: "flex",
      justifyContent: "space-between",
      fontSize: 11,
      color: "#888",
      fontFamily: "sans-serif"
    },
    header: {
      padding: "8px 24px 16px",
      borderBottom: "1px solid #EDEAE3"
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 700,
      color: "#1A1A1A",
      margin: 0,
      letterSpacing: "-0.5px"
    },
    headerSub: {
      fontSize: 13,
      color: "#888",
      margin: "2px 0 0",
      fontFamily: "sans-serif"
    },
    body: { padding: "16px 20px 32px" },
    sectionLabel: {
      fontSize: 11,
      fontWeight: 600,
      color: "#999",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      fontFamily: "sans-serif",
      marginBottom: 10,
      marginTop: 20
    },
    friendCard: (selected, color) => ({
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 14px",
      borderRadius: 16,
      border: selected ? "2px solid #1A1A1A" : "1.5px solid #E8E4DC",
      background: selected ? "#1A1A1A" : "#FFFFFF",
      cursor: "pointer",
      marginBottom: 8,
      transition: "all 0.15s"
    }),
    avatar: (color, textColor) => ({
      width: 42,
      height: 42,
      borderRadius: "50%",
      background: color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      fontWeight: 700,
      color: textColor,
      fontFamily: "sans-serif",
      flexShrink: 0
    }),
    chip: (selected) => ({
      display: "inline-block",
      padding: "6px 14px",
      borderRadius: 999,
      border: selected ? "2px solid #1A1A1A" : "1.5px solid #DEDAD2",
      background: selected ? "#1A1A1A" : "#FFFFFF",
      color: selected ? "#FAF8F3" : "#555",
      fontSize: 13,
      cursor: "pointer",
      marginRight: 6,
      marginBottom: 8,
      fontFamily: "sans-serif",
      transition: "all 0.12s",
      whiteSpace: "nowrap"
    }),
    input: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: 12,
      border: "1.5px solid #DEDAD2",
      background: "#FFFFFF",
      fontSize: 14,
      fontFamily: "sans-serif",
      color: "#1A1A1A",
      outline: "none",
      boxSizing: "border-box"
    },
    btn: (disabled) => ({
      width: "100%",
      padding: "15px",
      borderRadius: 20,
      border: "none",
      background: disabled ? "#D0CCC4" : "#1A1A1A",
      color: disabled ? "#999" : "#FAF8F3",
      fontSize: 16,
      fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "sans-serif",
      letterSpacing: "-0.2px",
      marginTop: 24
    }),
    giftCard: {
      background: "#FFFFFF",
      borderRadius: 20,
      padding: "16px",
      marginBottom: 12,
      border: "1.5px solid #EDEAE3"
    },
    backBtn: {
      background: "none",
      border: "none",
      fontSize: 13,
      color: "#888",
      cursor: "pointer",
      fontFamily: "sans-serif",
      padding: 0,
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  };

  return (
    <div style={{ padding: "24px 0", background: "#F0EDE8", minHeight: "100vh" }}>
      <div style={styles.phone}>
        <div style={styles.screen}>
          <div style={styles.statusBar}>
            <span>9:41</span>
            <span>●●●</span>
          </div>

          {screen === "home" && (
            <>
              <div style={styles.header}>
                <h1 style={styles.headerTitle}>Giftly</h1>
                <p style={styles.headerSub}>Find the perfect gift for anyone</p>
              </div>
              <div style={styles.body}>
                <div style={styles.sectionLabel}>Your friends</div>
                {FRIENDS.map(f => (
                  <div key={f.id} style={styles.friendCard(selectedFriend?.id === f.id)} onClick={() => setSelectedFriend(f)}>
                    <div style={styles.avatar(f.color, f.textColor)}>{f.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: selectedFriend?.id === f.id ? "#FAF8F3" : "#1A1A1A", fontFamily: "sans-serif" }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: selectedFriend?.id === f.id ? "#AAA" : "#999", fontFamily: "sans-serif" }}>{f.bio}</div>
                    </div>
                    {selectedFriend?.id === f.id && <span style={{ color: "#FAF8F3", fontSize: 18 }}>✓</span>}
                  </div>
                ))}

                <div style={styles.sectionLabel}>Occasion</div>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {OCCASIONS.map(o => (
                    <span key={o} style={styles.chip(form.occasion === o)} onClick={() => setForm(f => ({ ...f, occasion: o }))}>{o}</span>
                  ))}
                </div>

                <div style={styles.sectionLabel}>Budget</div>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {BUDGET_OPTIONS.map(b => (
                    <span key={b} style={styles.chip(form.budget === b)} onClick={() => setForm(f => ({ ...f, budget: b }))}>{b}</span>
                  ))}
                </div>

                <div style={styles.sectionLabel}>Their interests (optional)</div>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {INTERESTS_LIST.map(i => (
                    <span key={i} style={styles.chip(form.interests.includes(i))} onClick={() => toggleInterest(i)}>{i}</span>
                  ))}
                </div>

                <div style={styles.sectionLabel}>Anything else? (optional)</div>
                <input
                  style={styles.input}
                  placeholder="e.g. they just moved to a new city..."
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                />

                {error && <p style={{ color: "#C0392B", fontSize: 13, fontFamily: "sans-serif", marginTop: 12 }}>{error}</p>}

                <button style={styles.btn(!canSubmit || loading)} disabled={!canSubmit || loading} onClick={getRecommendations}>
                  {loading ? "Finding gifts..." : "Find perfect gifts"}
                </button>
              </div>
            </>
          )}

          {screen === "results" && (
            <>
              <div style={styles.header}>
                <button style={styles.backBtn} onClick={() => setScreen("home")}>← Back</button>
                <h1 style={{ ...styles.headerTitle, marginTop: 8 }}>Gifts for {selectedFriend?.name}</h1>
                <p style={styles.headerSub}>{form.occasion} · {form.budget}</p>
              </div>
              <div style={styles.body}>
                {gifts.map((g, i) => (
                  <div key={i} style={styles.giftCard}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ fontSize: 28, lineHeight: 1 }}>{g.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", fontFamily: "sans-serif" }}>{g.title}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", fontFamily: "sans-serif", marginLeft: 8, whiteSpace: "nowrap" }}>{g.price}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#666", fontFamily: "sans-serif", margin: "4px 0 8px", lineHeight: 1.5 }}>{g.description}</p>
                        <span style={{ fontSize: 11, background: "#F0EDE8", color: "#888", padding: "3px 10px", borderRadius: 999, fontFamily: "sans-serif" }}>Buy at {g.where}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button style={styles.btn(false)} onClick={() => { setGifts([]); setScreen("home"); }}>
                  Search again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
