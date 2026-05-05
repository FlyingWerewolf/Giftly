import { useState } from "react";

// ─── AFFILIATE CONFIG ──────────────────────────────────────────────
const AFFILIATE_IDS = {
  amazon: "YOUR-AMAZON-TAG-20",
  etsy:   "YOUR-ETSY-ID",
  target: "YOUR-TARGET-ID",
};

function buildLink(store, query, affiliateIds) {
  const q = encodeURIComponent(query);
  const ids = { ...AFFILIATE_IDS, ...affiliateIds };
  const s = store.toLowerCase();
  if (s.includes("amazon"))    return `https://www.amazon.com/s?k=${q}&tag=${ids.amazon}`;
  if (s.includes("etsy"))      return `https://www.etsy.com/search?q=${q}&ref=affiliate&utm_source=${ids.etsy}`;
  if (s.includes("target"))    return `https://www.target.com/s?searchTerm=${q}&afid=${ids.target}`;
  if (s.includes("walmart"))   return `https://www.walmart.com/search?q=${q}`;
  if (s.includes("nordstrom")) return `https://www.nordstrom.com/sr?origin=keywordsearch&keyword=${q}`;
  if (s.includes("uncommon"))  return `https://www.uncommongoods.com/search?q=${q}`;
  if (s.includes("book"))      return `https://bookshop.org/search?keywords=${q}`;
  return `https://www.google.com/search?q=${q}&tbm=shop`;
}

// ─── CALENDAR EXPORT ──────────────────────────────────────────────
function exportToCalendar(reminder) {
  const [mm, dd] = reminder.date.split("-");
  const year = new Date().getFullYear();
  const nextYear = new Date(year, Number(mm)-1, Number(dd)) < new Date() ? year + 1 : year;

  // Calculate alarm offset in minutes
  const alarmMap = {
    "1 day before":    -1440,
    "3 days before":   -4320,
    "1 week before":   -10080,
    "2 weeks before":  -20160,
    "1 month before":  -43200,
  };
  const alarmMins = alarmMap[reminder.remindBefore] || -10080;

  const dateStr = `${nextYear}${String(mm).padStart(2,"0")}${String(dd).padStart(2,"0")}`;
  const uid = `giftly-${reminder.id}-${Date.now()}@giftly.app`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Giftly//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${dateStr}`,
    `SUMMARY:${reminder.occasion} – ${reminder.friendName} 🎁`,
    `DESCRIPTION:Reminder from Giftly: ${reminder.friendName}'s ${reminder.occasion}. Time to find the perfect gift!`,
    "RRULE:FREQ=YEARLY",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${reminder.friendName}'s ${reminder.occasion} is coming up!`,
    `TRIGGER:${alarmMins < 0 ? `-PT${Math.abs(alarmMins)}M` : "PT0M"}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${reminder.friendName}-${reminder.occasion}.ics`.replace(/\s+/g, "-");
  a.click();
  URL.revokeObjectURL(url);
}

// ─── AVATAR COLOR PALETTE ─────────────────────────────────────────
const AVATAR_COLORS = [
  { color:"#E8D5F5", textColor:"#6B21A8" },
  { color:"#D5EAF5", textColor:"#1D4ED8" },
  { color:"#F5D5E8", textColor:"#9D174D" },
  { color:"#D5F5E3", textColor:"#166534" },
  { color:"#FEF3C7", textColor:"#92400E" },
  { color:"#FCE7F3", textColor:"#9D174D" },
];
function randomAvatar(name) {
  const i = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}
function initials(name) {
  return name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
}

// ─── CONSTANTS ────────────────────────────────────────────────────
const OCCASIONS         = ["Birthday","Christmas","Anniversary","Graduation","Baby Shower","Wedding","Just Because"];
const REMINDER_OCCASIONS= ["Birthday","Anniversary","Christmas","Graduation","Baby Shower","Wedding","Other"];
const BUDGET_OPTIONS    = ["Under $25","$25–$50","$50–$100","$100–$250","No limit"];
const INTERESTS_LIST    = ["Travel","Fitness","Cooking","Gaming","Reading","Music","Art","Fashion","Tech","Outdoors","Movies","Sports","Beauty","DIY","Pets"];
const REMIND_BEFORE     = ["1 day before","3 days before","1 week before","2 weeks before","1 month before"];
const OCCASION_EMOJI    = {"Birthday":"🎂","Anniversary":"💍","Christmas":"🎄","Graduation":"🎓","Baby Shower":"🍼","Wedding":"💐","Other":"📅"};

const STORE_COLORS = {
  amazon:   {bg:"#FFF7ED",text:"#C2410C",border:"#FDBA74"},
  etsy:     {bg:"#FFF1F0",text:"#BE123C",border:"#FECDD3"},
  target:   {bg:"#FFF1F0",text:"#CC0000",border:"#FCA5A5"},
  walmart:  {bg:"#EFF6FF",text:"#1D4ED8",border:"#BFDBFE"},
  nordstrom:{bg:"#F0FDF4",text:"#166534",border:"#BBF7D0"},
  default:  {bg:"#F8FAFC",text:"#475569",border:"#CBD5E1"},
};
function storeColor(store) {
  const s=(store||"").toLowerCase();
  if(s.includes("amazon"))    return STORE_COLORS.amazon;
  if(s.includes("etsy"))      return STORE_COLORS.etsy;
  if(s.includes("target"))    return STORE_COLORS.target;
  if(s.includes("walmart"))   return STORE_COLORS.walmart;
  if(s.includes("nordstrom")) return STORE_COLORS.nordstrom;
  return STORE_COLORS.default;
}
function daysUntil(dateStr) {
  if(!dateStr) return 999;
  const today=new Date(); today.setHours(0,0,0,0);
  const [mm,dd]=dateStr.split("-");
  const d=new Date(today.getFullYear(),Number(mm)-1,Number(dd));
  if(d<today) d.setFullYear(today.getFullYear()+1);
  return Math.round((d-today)/86400000);
}
function urgencyStyle(days) {
  if(days<=7)  return {bg:"#FEE2E2",text:"#991B1B",dot:"#EF4444"};
  if(days<=30) return {bg:"#FEF9C3",text:"#854D0E",dot:"#EAB308"};
  return {bg:"#DCFCE7",text:"#166534",dot:"#22C55E"};
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function GiftApp() {
  const [screen, setScreen]       = useState("home");
  const [activeTab, setActiveTab] = useState("gifts");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [form, setForm]           = useState({occasion:"",budget:"",interests:[],note:""});
  const [gifts, setGifts]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  // Friends list (starts with samples, user can add more)
  const [friends, setFriends]     = useState([
    {id:1,name:"Sarah M.",  bio:"28 • Loves yoga & brunch",  ...randomAvatar("Sarah M.")},
    {id:2,name:"James T.",  bio:"34 • Into hiking & tech",   ...randomAvatar("James T.")},
    {id:3,name:"Priya K.",  bio:"25 • Artist & foodie",      ...randomAvatar("Priya K.")},
  ]);

  // Add friend form
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriend, setNewFriend]   = useState({name:"",bio:""});
  const [contactLoading, setContactLoading] = useState(false);
  const [calExported, setCalExported] = useState(null);

  // Edit friend
  const [editFriendId, setEditFriendId] = useState(null);
  const [editFriendData, setEditFriendData] = useState({name:"",bio:""});

  // Affiliate
  const [affIds, setAffIds]       = useState({amazon:"",etsy:"",target:""});
  const [affSaved, setAffSaved]   = useState(false);

  // Reminders
  const [reminders, setReminders] = useState([
    {id:1,friendId:1,friendName:"Sarah M.", occasion:"Birthday",   date:"05-18",remindBefore:"1 week before", initials:"SM",color:"#E8D5F5",textColor:"#6B21A8"},
    {id:2,friendId:2,friendName:"James T.", occasion:"Anniversary",date:"06-03",remindBefore:"2 weeks before",initials:"JT",color:"#D5EAF5",textColor:"#1D4ED8"},
    {id:3,friendId:3,friendName:"Priya K.", occasion:"Birthday",   date:"08-14",remindBefore:"1 week before", initials:"PK",color:"#F5D5E8",textColor:"#9D174D"},
  ]);
  const [rForm, setRForm]             = useState({friendId:"",occasion:"",date:"",remindBefore:""});
  const [reminderSuccess, setReminderSuccess] = useState(false);
  const [deleteId, setDeleteId]       = useState(null);

  // ── Contact Picker ──
  async function importFromContacts() {
    if (!("contacts" in navigator && "ContactsManager" in window)) {
      // Fallback: show manual form
      setShowAddFriend(true);
      return;
    }
    setContactLoading(true);
    try {
      const props = ["name","email"];
      const selected = await navigator.contacts.select(props, {multiple:true});
      const newFriends = selected.map(c => {
        const name = (c.name && c.name[0]) || "Unknown";
        const av = randomAvatar(name);
        return { id: Date.now() + Math.random(), name, bio: "", initials: initials(name), ...av };
      });
      setFriends(prev => {
        const existing = new Set(prev.map(f=>f.name));
        return [...prev, ...newFriends.filter(f=>!existing.has(f.name))];
      });
    } catch(e) {
      setShowAddFriend(true);
    }
    setContactLoading(false);
  }

  // ── Manual add friend ──
  function addFriendManually() {
    if (!newFriend.name.trim()) return;
    const av = randomAvatar(newFriend.name);
    setFriends(prev => [...prev, {
      id: Date.now(),
      name: newFriend.name.trim(),
      bio:  newFriend.bio.trim(),
      initials: initials(newFriend.name.trim()),
      ...av
    }]);
    setNewFriend({name:"",bio:""});
    setShowAddFriend(false);
  }

  function startEditFriend(f, e) {
    e.stopPropagation();
    setEditFriendId(f.id);
    setEditFriendData({name:f.name, bio:f.bio||""});
  }

  function saveEditFriend() {
    if (!editFriendData.name.trim()) return;
    setFriends(prev => prev.map(f => f.id===editFriendId ? {
      ...f,
      name: editFriendData.name.trim(),
      bio:  editFriendData.bio.trim(),
      initials: initials(editFriendData.name.trim()),
      ...randomAvatar(editFriendData.name.trim()),
    } : f));
    if (selectedFriend?.id===editFriendId) setSelectedFriend(null);
    setEditFriendId(null);
  }

  function deleteFriend(id, e) {
    e.stopPropagation();
    setFriends(prev => prev.filter(f=>f.id!==id));
    if (selectedFriend?.id===id) setSelectedFriend(null);
    if (editFriendId===id) setEditFriendId(null);
  }

  function toggleInterest(i) {
    setForm(f=>({...f,interests:f.interests.includes(i)?f.interests.filter(x=>x!==i):[...f.interests,i]}));
  }

  async function getRecommendations() {
    setLoading(true); setError(""); setGifts([]);
    try {
      const prompt = `You are a thoughtful gift advisor. Give 4 specific, creative gift recommendations.
Friend: ${selectedFriend.name}
Occasion: ${form.occasion}
Budget: ${form.budget}
Interests: ${form.interests.join(", ")||"general"}
Extra notes: ${form.note||"none"}
Respond ONLY with a JSON array of 4 objects, no markdown, no explanation. Each object:
- "title": gift name (max 6 words, specific enough to search for)
- "description": one sentence why it's perfect
- "price": estimated price like "$45"
- "emoji": one emoji
- "where": best store — choose from: Amazon, Etsy, Target, Walmart, Nordstrom, Uncommon Goods, Bookshop
- "searchQuery": 3-5 word search query to find this exact product`;
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,messages:[{role:"user",content:prompt}]})
      });
      const data = await res.json();
      const text = data.content.map(b=>b.text||"").join("");
      setGifts(JSON.parse(text.replace(/```json|```/g,"").trim()));
      setScreen("results");
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  }

  function addReminder() {
    const friend = friends.find(f=>f.id===Number(rForm.friendId));
    if(!friend||!rForm.occasion||!rForm.date||!rForm.remindBefore) return;
    const mmdd = rForm.date.slice(5);
    setReminders(prev=>[...prev,{
      id:Date.now(), friendId:friend.id, friendName:friend.name,
      occasion:rForm.occasion, date:mmdd, remindBefore:rForm.remindBefore,
      initials:friend.initials||initials(friend.name), color:friend.color, textColor:friend.textColor
    }]);
    setRForm({friendId:"",occasion:"",date:"",remindBefore:""});
    setReminderSuccess(true);
    setTimeout(()=>setReminderSuccess(false),2500);
  }

  function handleCalendarExport(r) {
    exportToCalendar(r);
    setCalExported(r.id);
    setTimeout(()=>setCalExported(null),2500);
  }

  function saveAffIds() { setAffSaved(true); setTimeout(()=>setAffSaved(false),2000); }

  const canSubmit      = form.occasion && form.budget && selectedFriend;
  const canAddReminder = rForm.friendId && rForm.occasion && rForm.date && rForm.remindBefore;
  const sortedReminders= [...reminders].sort((a,b)=>daysUntil(a.date)-daysUntil(b.date));
  const hasContactPicker = "contacts" in navigator && "ContactsManager" in window;

  // ── Styles ──
  const S = {
    phone:    {maxWidth:390,margin:"0 auto",minHeight:700,background:"#0F0F0F",borderRadius:44,overflow:"hidden",border:"8px solid #1A1A1A",fontFamily:"'Georgia',serif",boxShadow:"0 0 0 1px #2A2A2A"},
    screen:   {background:"#FAF8F3",minHeight:684,overflowY:"auto"},
    statusBar:{background:"#FAF8F3",padding:"12px 24px 0",display:"flex",justifyContent:"space-between",fontSize:11,color:"#888",fontFamily:"sans-serif"},
    hdr:      {padding:"8px 24px 14px",borderBottom:"1px solid #EDEAE3",display:"flex",justifyContent:"space-between",alignItems:"flex-end"},
    hTitle:   {fontSize:22,fontWeight:700,color:"#1A1A1A",margin:0,letterSpacing:"-0.5px"},
    hSub:     {fontSize:13,color:"#888",margin:"2px 0 0",fontFamily:"sans-serif"},
    body:     {padding:"14px 20px 40px"},
    lbl:      {fontSize:11,fontWeight:600,color:"#999",letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"sans-serif",marginBottom:8,marginTop:18},
    friendRow:(sel)=>({display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:16,border:sel?"2px solid #1A1A1A":"1.5px solid #E8E4DC",background:sel?"#1A1A1A":"#FFF",cursor:"pointer",marginBottom:8,transition:"all 0.15s"}),
    av:       (c,t)=>({width:40,height:40,borderRadius:"50%",background:c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:t,fontFamily:"sans-serif",flexShrink:0}),
    chip:     (sel)=>({display:"inline-block",padding:"6px 13px",borderRadius:999,border:sel?"2px solid #1A1A1A":"1.5px solid #DEDAD2",background:sel?"#1A1A1A":"#FFF",color:sel?"#FAF8F3":"#555",fontSize:12,cursor:"pointer",marginRight:6,marginBottom:7,fontFamily:"sans-serif",transition:"all 0.12s",whiteSpace:"nowrap"}),
    inp:      {width:"100%",padding:"10px 14px",borderRadius:12,border:"1.5px solid #DEDAD2",background:"#FFF",fontSize:14,fontFamily:"sans-serif",color:"#1A1A1A",outline:"none",boxSizing:"border-box"},
    sel:      {width:"100%",padding:"10px 14px",borderRadius:12,border:"1.5px solid #DEDAD2",background:"#FFF",fontSize:14,fontFamily:"sans-serif",color:"#1A1A1A",outline:"none",boxSizing:"border-box",marginBottom:10},
    btn:      (dis)=>({width:"100%",padding:"14px",borderRadius:20,border:"none",background:dis?"#D0CCC4":"#1A1A1A",color:dis?"#999":"#FAF8F3",fontSize:15,fontWeight:600,cursor:dis?"not-allowed":"pointer",fontFamily:"sans-serif",marginTop:14}),
    outlineBtn:(color)=>({width:"100%",padding:"12px",borderRadius:20,border:`1.5px solid ${color||"#1A1A1A"}`,background:"#FFF",color:color||"#1A1A1A",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"sans-serif",marginTop:8}),
    backBtn:  {background:"none",border:"none",fontSize:13,color:"#888",cursor:"pointer",fontFamily:"sans-serif",padding:0},
    tabBar:   {display:"flex",background:"#FAF8F3",borderBottom:"1px solid #EDEAE3"},
    tab:      (a)=>({flex:1,padding:"10px 0",textAlign:"center",fontSize:11,fontWeight:a?600:400,color:a?"#1A1A1A":"#999",borderBottom:a?"2px solid #1A1A1A":"2px solid transparent",cursor:"pointer",background:"none",border:"none",fontFamily:"sans-serif"}),
    shopBtn:  (store)=>{const c=storeColor(store);return{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:10,border:`1.5px solid ${c.border}`,background:c.bg,color:c.text,fontSize:12,fontWeight:600,fontFamily:"sans-serif",cursor:"pointer",textDecoration:"none",marginTop:8};},
    calBtn:   {display:"inline-flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:8,border:"1.5px solid #BFDBFE",background:"#EFF6FF",color:"#1D4ED8",fontSize:11,fontWeight:600,fontFamily:"sans-serif",cursor:"pointer",marginTop:6},
    settingsIcon:{background:"none",border:"none",fontSize:18,cursor:"pointer",padding:"0 0 2px",color:"#888"},
    affInput: {width:"100%",padding:"9px 12px",borderRadius:10,border:"1.5px solid #DEDAD2",background:"#FFF",fontSize:13,fontFamily:"sans-serif",color:"#1A1A1A",outline:"none",boxSizing:"border-box",marginBottom:8},
  };

  return (
    <div style={{padding:"24px 0",background:"#F0EDE8",minHeight:"100vh"}}>
      <div style={S.phone}>
        <div style={S.screen}>
          <div style={S.statusBar}><span>9:41</span><span>●●●</span></div>

          {/* SETTINGS */}
          {screen==="settings" && (
            <>
              <div style={S.hdr}>
                <div><h1 style={S.hTitle}>Affiliate Links</h1><p style={S.hSub}>Earn commission on purchases</p></div>
                <button style={S.backBtn} onClick={()=>setScreen("home")}>✕</button>
              </div>
              <div style={S.body}>
                <div style={{background:"#FEF9C3",borderRadius:14,padding:"10px 14px",marginBottom:16,border:"1px solid #FDE68A"}}>
                  <p style={{fontSize:12,color:"#854D0E",fontFamily:"sans-serif",margin:0,lineHeight:1.6}}>
                    💡 Sign up for affiliate programs, get your unique IDs, and paste them here. Every purchase earns you a commission.
                  </p>
                </div>
                {[
                  {key:"amazon",label:"Amazon Associates",placeholder:"e.g. giftly-20",   url:"https://affiliate-program.amazon.com",color:"#C2410C"},
                  {key:"etsy",  label:"Etsy Affiliate",   placeholder:"e.g. 12345678",    url:"https://www.etsy.com/affiliates",    color:"#BE123C"},
                  {key:"target",label:"Target Affiliates",placeholder:"e.g. giftlyapp",   url:"https://affiliates.target.com",      color:"#CC0000"},
                ].map(({key,label,placeholder,url,color})=>(
                  <div key={key} style={{marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:13,fontWeight:600,fontFamily:"sans-serif",color:"#1A1A1A"}}>{label}</span>
                      <a href={url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color,fontFamily:"sans-serif",textDecoration:"none",fontWeight:500}}>Sign up →</a>
                    </div>
                    <input style={S.affInput} placeholder={placeholder} value={affIds[key]} onChange={e=>setAffIds(a=>({...a,[key]:e.target.value}))} />
                  </div>
                ))}
                {affSaved && <div style={{background:"#DCFCE7",color:"#166534",borderRadius:10,padding:"8px 14px",fontSize:13,fontFamily:"sans-serif",textAlign:"center",marginBottom:8}}>✓ Saved!</div>}
                <button style={S.btn(false)} onClick={saveAffIds}>Save affiliate IDs</button>
              </div>
            </>
          )}

          {/* RESULTS */}
          {screen==="results" && (
            <>
              <div style={{padding:"8px 24px 14px",borderBottom:"1px solid #EDEAE3"}}>
                <button style={S.backBtn} onClick={()=>setScreen("home")}>← Back</button>
                <h1 style={{...S.hTitle,marginTop:8}}>Gifts for {selectedFriend?.name}</h1>
                <p style={S.hSub}>{form.occasion} · {form.budget}</p>
              </div>
              <div style={S.body}>
                {gifts.map((g,i)=>{
                  const link=buildLink(g.where,g.searchQuery||g.title,affIds);
                  return (
                    <div key={i} style={{background:"#FFF",borderRadius:20,padding:16,marginBottom:12,border:"1.5px solid #EDEAE3"}}>
                      <div style={{display:"flex",gap:12}}>
                        <div style={{fontSize:28,lineHeight:1}}>{g.emoji}</div>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <span style={{fontSize:15,fontWeight:700,color:"#1A1A1A",fontFamily:"sans-serif"}}>{g.title}</span>
                            <span style={{fontSize:14,fontWeight:600,fontFamily:"sans-serif",marginLeft:8,whiteSpace:"nowrap"}}>{g.price}</span>
                          </div>
                          <p style={{fontSize:13,color:"#666",fontFamily:"sans-serif",margin:"4px 0 0",lineHeight:1.5}}>{g.description}</p>
                          <a href={link} target="_blank" rel="noopener noreferrer" style={S.shopBtn(g.where)}>
                            <span>🛍</span><span>Shop on {g.where}</span><span style={{marginLeft:"auto",opacity:0.6,fontSize:10}}>↗</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button style={S.btn(false)} onClick={()=>{setGifts([]);setScreen("home");}}>Search again</button>
              </div>
            </>
          )}

          {/* HOME */}
          {screen==="home" && (
            <>
              <div style={S.hdr}>
                <div><h1 style={S.hTitle}>Giftly</h1><p style={S.hSub}>Find the perfect gift for anyone</p></div>
                <button style={S.settingsIcon} onClick={()=>setScreen("settings")}>⚙️</button>
              </div>
              <div style={S.tabBar}>
                <button style={S.tab(activeTab==="gifts")}     onClick={()=>setActiveTab("gifts")}>🎁 Gift Finder</button>
                <button style={S.tab(activeTab==="reminders")} onClick={()=>setActiveTab("reminders")}>🔔 Reminders {reminders.length>0&&`(${reminders.length})`}</button>
              </div>

              {/* GIFT FINDER TAB */}
              {activeTab==="gifts" && (
                <div style={S.body}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:18,marginBottom:8}}>
                    <div style={S.lbl}>Your friends</div>
                    <button
                      onClick={importFromContacts}
                      style={{fontSize:11,fontFamily:"sans-serif",background:"#1A1A1A",color:"#FAF8F3",border:"none",borderRadius:999,padding:"4px 12px",cursor:"pointer",fontWeight:600}}
                    >
                      {contactLoading ? "Importing..." : hasContactPicker ? "＋ From contacts" : "＋ Add friend"}
                    </button>
                  </div>

                  {/* Manual add friend form */}
                  {showAddFriend && (
                    <div style={{background:"#FFF",borderRadius:16,border:"1.5px solid #DEDAD2",padding:14,marginBottom:12}}>
                      <p style={{fontSize:12,color:"#999",fontFamily:"sans-serif",margin:"0 0 8px"}}>Add a friend manually</p>
                      <input style={{...S.inp,marginBottom:8}} placeholder="Full name" value={newFriend.name} onChange={e=>setNewFriend(f=>({...f,name:e.target.value}))} />
                      <input style={{...S.inp,marginBottom:8}} placeholder="Short bio e.g. 30 • Loves coffee" value={newFriend.bio} onChange={e=>setNewFriend(f=>({...f,bio:e.target.value}))} />
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>setShowAddFriend(false)} style={{flex:1,padding:"9px",borderRadius:12,border:"1.5px solid #DEDAD2",background:"#FFF",fontSize:13,fontFamily:"sans-serif",cursor:"pointer",color:"#555"}}>Cancel</button>
                        <button onClick={addFriendManually} style={{flex:1,padding:"9px",borderRadius:12,border:"none",background:"#1A1A1A",color:"#FFF",fontSize:13,fontFamily:"sans-serif",cursor:"pointer",fontWeight:600}}>Add</button>
                      </div>
                    </div>
                  )}

                  {friends.map(f=>(
                    <div key={f.id}>
                      <div style={S.friendRow(selectedFriend?.id===f.id)} onClick={()=>setSelectedFriend(f)}>
                        <div style={S.av(f.color,f.textColor)}>{f.initials||initials(f.name)}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:15,fontWeight:600,color:selectedFriend?.id===f.id?"#FAF8F3":"#1A1A1A",fontFamily:"sans-serif"}}>{f.name}</div>
                          {f.bio && <div style={{fontSize:12,color:selectedFriend?.id===f.id?"#AAA":"#999",fontFamily:"sans-serif"}}>{f.bio}</div>}
                        </div>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          {selectedFriend?.id===f.id && <span style={{color:"#FAF8F3",fontSize:14}}>✓</span>}
                          <button onClick={e=>startEditFriend(f,e)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:selectedFriend?.id===f.id?"#AAA":"#999",padding:"2px 4px",fontFamily:"sans-serif"}}>✏️</button>
                          <button onClick={e=>deleteFriend(f.id,e)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:selectedFriend?.id===f.id?"#AAA":"#CCC",padding:"2px 4px"}}>×</button>
                        </div>
                      </div>
                      {/* Inline edit form */}
                      {editFriendId===f.id && (
                        <div style={{background:"#FFF",borderRadius:14,border:"1.5px solid #DEDAD2",padding:12,marginTop:-4,marginBottom:8}}>
                          <input style={{...S.inp,marginBottom:8}} placeholder="Full name" value={editFriendData.name} onChange={e=>setEditFriendData(d=>({...d,name:e.target.value}))} />
                          <input style={{...S.inp,marginBottom:10}} placeholder="Short bio e.g. 30 • Loves coffee" value={editFriendData.bio} onChange={e=>setEditFriendData(d=>({...d,bio:e.target.value}))} />
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={()=>setEditFriendId(null)} style={{flex:1,padding:"8px",borderRadius:12,border:"1.5px solid #DEDAD2",background:"#FFF",fontSize:13,fontFamily:"sans-serif",cursor:"pointer",color:"#555"}}>Cancel</button>
                            <button onClick={saveEditFriend} style={{flex:1,padding:"8px",borderRadius:12,border:"none",background:"#1A1A1A",color:"#FFF",fontSize:13,fontFamily:"sans-serif",cursor:"pointer",fontWeight:600}}>Save</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div style={S.lbl}>Occasion</div>
                  <div style={{display:"flex",flexWrap:"wrap"}}>{OCCASIONS.map(o=><span key={o} style={S.chip(form.occasion===o)} onClick={()=>setForm(f=>({...f,occasion:o}))}>{o}</span>)}</div>
                  <div style={S.lbl}>Budget</div>
                  <div style={{display:"flex",flexWrap:"wrap"}}>{BUDGET_OPTIONS.map(b=><span key={b} style={S.chip(form.budget===b)} onClick={()=>setForm(f=>({...f,budget:b}))}>{b}</span>)}</div>
                  <div style={S.lbl}>Their interests (optional)</div>
                  <div style={{display:"flex",flexWrap:"wrap"}}>{INTERESTS_LIST.map(i=><span key={i} style={S.chip(form.interests.includes(i))} onClick={()=>toggleInterest(i)}>{i}</span>)}</div>
                  <div style={S.lbl}>Anything else? (optional)</div>
                  <input style={S.inp} placeholder="e.g. they just moved to a new city..." value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} />
                  {error && <p style={{color:"#C0392B",fontSize:13,fontFamily:"sans-serif",marginTop:10}}>{error}</p>}
                  <button style={S.btn(!canSubmit||loading)} disabled={!canSubmit||loading} onClick={getRecommendations}>
                    {loading?"Finding gifts...":"Find perfect gifts"}
                  </button>
                </div>
              )}

              {/* REMINDERS TAB */}
              {activeTab==="reminders" && (
                <div style={S.body}>
                  {sortedReminders.length>0 && (
                    <>
                      <div style={S.lbl}>Upcoming occasions</div>
                      {sortedReminders.map(r=>{
                        const days=daysUntil(r.date);
                        const urg=urgencyStyle(days);
                        return (
                          <div key={r.id} style={{background:"#FFF",borderRadius:18,border:"1.5px solid #EDEAE3",padding:"12px 14px",marginBottom:10}}>
                            <div style={{display:"flex",alignItems:"center",gap:10}}>
                              <div style={{...S.av(r.color,r.textColor),width:36,height:36,fontSize:12}}>{r.initials}</div>
                              <div style={{flex:1}}>
                                <div style={{display:"flex",alignItems:"center",gap:5}}>
                                  <span style={{fontSize:14,fontWeight:600,color:"#1A1A1A",fontFamily:"sans-serif"}}>{r.friendName}</span>
                                  <span style={{fontSize:13}}>{OCCASION_EMOJI[r.occasion]||"📅"}</span>
                                </div>
                                <div style={{fontSize:11,color:"#999",fontFamily:"sans-serif"}}>{r.occasion} · {r.remindBefore}</div>
                                {/* Add to Calendar button */}
                                <button style={S.calBtn} onClick={()=>handleCalendarExport(r)}>
                                  📅 {calExported===r.id ? "Added! Check your calendar" : "Add to Calendar"}
                                </button>
                              </div>
                              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                                <div style={{background:urg.bg,color:urg.text,fontSize:11,fontWeight:600,fontFamily:"sans-serif",padding:"3px 8px",borderRadius:999,whiteSpace:"nowrap"}}>
                                  <span style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:urg.dot,marginRight:4,verticalAlign:"middle"}}></span>
                                  {days===0?"Today!":days===1?"Tomorrow":`${days} days`}
                                </div>
                                <button onClick={()=>setDeleteId(deleteId===r.id?null:r.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:15,color:"#CCC",padding:0}}>×</button>
                              </div>
                            </div>
                            {deleteId===r.id && (
                              <div style={{marginTop:10,padding:"8px 10px",background:"#FEF2F2",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                                <span style={{fontSize:12,color:"#991B1B",fontFamily:"sans-serif"}}>Remove this reminder?</span>
                                <div style={{display:"flex",gap:6}}>
                                  <button onClick={()=>setDeleteId(null)} style={{fontSize:11,fontFamily:"sans-serif",background:"none",border:"1px solid #CCC",borderRadius:8,padding:"3px 9px",cursor:"pointer",color:"#555"}}>Cancel</button>
                                  <button onClick={()=>{setReminders(p=>p.filter(x=>x.id!==r.id));setDeleteId(null);}} style={{fontSize:11,fontFamily:"sans-serif",background:"#991B1B",border:"none",borderRadius:8,padding:"3px 9px",cursor:"pointer",color:"#FFF"}}>Remove</button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}

                  <div style={S.lbl}>Add a reminder</div>
                  <div style={{background:"#FFF",borderRadius:18,border:"1.5px solid #EDEAE3",padding:14}}>
                    <div style={{fontSize:12,color:"#999",fontFamily:"sans-serif",marginBottom:6}}>Friend</div>
                    <select style={S.sel} value={rForm.friendId} onChange={e=>setRForm(f=>({...f,friendId:e.target.value}))}>
                      <option value="">Select friend...</option>
                      {friends.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    <div style={{fontSize:12,color:"#999",fontFamily:"sans-serif",marginBottom:8}}>Occasion</div>
                    <div style={{display:"flex",flexWrap:"wrap",marginBottom:4}}>
                      {REMINDER_OCCASIONS.map(o=>(
                        <span key={o} style={{...S.chip(rForm.occasion===o),fontSize:11,padding:"5px 10px"}} onClick={()=>setRForm(f=>({...f,occasion:o}))}>
                          {OCCASION_EMOJI[o]} {o}
                        </span>
                      ))}
                    </div>
                    <div style={{fontSize:12,color:"#999",fontFamily:"sans-serif",marginBottom:6,marginTop:10}}>Date</div>
                    <input type="date" style={{...S.inp,marginBottom:10}} value={rForm.date} onChange={e=>setRForm(f=>({...f,date:e.target.value}))} />
                    <div style={{fontSize:12,color:"#999",fontFamily:"sans-serif",marginBottom:6}}>Remind me</div>
                    <select style={S.sel} value={rForm.remindBefore} onChange={e=>setRForm(f=>({...f,remindBefore:e.target.value}))}>
                      <option value="">How early?</option>
                      {REMIND_BEFORE.map(b=><option key={b} value={b}>{b}</option>)}
                    </select>
                    {reminderSuccess && (
                      <div style={{background:"#DCFCE7",color:"#166534",borderRadius:10,padding:"8px 12px",fontSize:13,fontFamily:"sans-serif",textAlign:"center",marginBottom:6}}>✓ Reminder set!</div>
                    )}
                    <button style={{...S.btn(!canAddReminder),marginTop:6}} disabled={!canAddReminder} onClick={addReminder}>Set reminder 🔔</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
