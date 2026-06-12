import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  auth, db, googleProvider,
  signInWithGoogle, signOutUser, onAuthChange,
  loadFirestoreData, saveFirestoreData, subscribeToData,
} from "./firebase.js";

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Ico = ({ d, size=18, stroke="currentColor", fill="none", sw=1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    {Array.isArray(d)?d.map((p,i)=><path key={i} d={p}/>):<path d={d}/>}
  </svg>
);
const IC = {
  dash:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  fuel:    ["M3 22V8l7-6 7 6v14","M10 22V17h4v5","M3 13h14","M15 13V8l4 4"],
  oil:     "M12 2C8 2 5 6 5 10c0 5.25 7 12 7 12s7-6.75 7-12c0-4-3-8-7-8z",
  wrench:  "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  tire:    ["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  bell:    ["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"],
  dollar:  ["M12 2v20","M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"],
  chart:   ["M18 20V10","M12 20V4","M6 20v-6"],
  plus:    "M12 5v14M5 12h14",
  x:       "M18 6L6 18M6 6l12 12",
  check:   "M20 6L9 17l-5-5",
  edit:    ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  trash:   ["M3 6h18","M8 6V4h8v2","M19 6l-1 14H6L5 6"],
  alert:   ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
  car:     ["M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2","M14 17H9","M7 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0","M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0"],
  person:  ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  doc:     ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  shield:  ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  fire:    "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z",
  tag:     ["M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z","M7 7h.01"],
  settings:["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
  trend:   "M23 6l-9.5 9.5-5-5L1 18",
  calendar:["M3 4h18v18H3z","M16 2v4","M8 2v4","M3 10h18"],
  download:["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
  upload:  ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M17 8l-5-5-5 5","M12 3v12"],
  calc:    ["M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z","M8 6h8","M8 10h8","M8 14h4"],
  posto:   ["M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 5h14M9 19a1 1 0 1 0 2 0 1 1 0 0 0-2 0M18 19a1 1 0 1 0 2 0 1 1 0 0 0-2 0"],
  menu:    "M3 12h18M3 6h18M3 18h18",
  search:  "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z",
  sun:     ["M12 1v2","M12 21v2","M4.22 4.22l1.42 1.42","M18.36 18.36l1.42 1.42","M1 12h2","M21 12h2","M4.22 19.78l1.42-1.42","M18.36 5.64l1.42-1.42","M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"],
  moon:    "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  filter:  ["M22 3H2l8 9.46V19l4 2v-8.54L22 3z"],
  bolt:    "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  report:  ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  km:      ["M12 2L2 7l10 5 10-5-10-5z","M2 17l10 5 10-5","M2 12l10 5 10-5"],
  warn:    ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
};

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const DARK = {
  bg:"#090B10", surf:"#0E1118", card:"#141720", card2:"#1A1E2C",
  border:"#222638", accent:"#E8A020", red:"#E05555", green:"#2ECC8E",
  blue:"#4A90E2", purple:"#9B6DFF", teal:"#1CB8A0",
  muted:"#4E566E", sub:"#7B88A0", text:"#D8DEF0", white:"#EEF2FF",
};
const LIGHT = {
  bg:"#F0F2F8", surf:"#FFFFFF", card:"#FFFFFF", card2:"#F5F7FF",
  border:"#DDE2EF", accent:"#D4880A", red:"#D44444", green:"#1AA870",
  blue:"#2E74CC", purple:"#7B52E0", teal:"#0FA08A",
  muted:"#8895B0", sub:"#606880", text:"#1A2040", white:"#0A0E20",
};

const PESSOAS = ["Eliseu","Elias"];
const PC = (T) => ({ Eliseu:T.accent, Elias:T.blue });
const fmtR  = v=>`R$ ${(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}`;
const fmt1  = v=>v!=null?Number(v).toFixed(1):"—";
const fmt2  = v=>v!=null?Number(v).toFixed(2):"—";
const fmtKm = v=>v?Number(v).toLocaleString("pt-BR"):"0";
const URGC  = (T) => ({ alta:T.red, media:T.accent, baixa:T.blue });
const SK    = "golf_v4";
const mesNome = m => ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(m)-1]||m;

const GOLF_SPECS = {
  motor:"1.6 8V (EA111)", potencia:"101 cv @ 5.400 rpm", torque:"14,5 kgfm @ 3.200 rpm",
  combustivel:"Gasolina / Etanol", tanque:"55 litros",
  consumoUrbano:"9,0 km/L (gasolina)", consumoEstrada:"11,5 km/L (gasolina)",
  cambio:"Manual 5 marchas", tracao:"Dianteira",
  freios:"Discos dianteiros / Tambores traseiros", pneus:"195/65 R15",
};
const MANUTENCAO = [
  {item:"Troca de óleo + filtro",       intervalo:"10.000 km / 12 meses", urgencia:"alta",  km:10000},
  {item:"Filtro de ar do motor",        intervalo:"20.000 km",            urgencia:"media", km:20000},
  {item:"Filtro de ar habitáculo",      intervalo:"15.000 km / 12 meses", urgencia:"baixa", km:15000},
  {item:"Filtro de combustível",        intervalo:"40.000 km",            urgencia:"media", km:40000},
  {item:"Velas de ignição",             intervalo:"20.000 km",            urgencia:"media", km:20000},
  {item:"Correia dentada + tensor",     intervalo:"60.000 km / 4 anos",   urgencia:"alta",  km:60000},
  {item:"Fluido de freio",              intervalo:"30.000 km / 2 anos",   urgencia:"alta",  km:30000},
  {item:"Fluido de arrefecimento",      intervalo:"40.000 km / 2 anos",   urgencia:"media", km:40000},
  {item:"Alinhamento e balanceamento",  intervalo:"10.000 km",            urgencia:"media", km:10000},
  {item:"Revisão de freios",            intervalo:"20.000 km",            urgencia:"alta",  km:20000},
  {item:"Rotação de pneus",             intervalo:"10.000 km",            urgencia:"baixa", km:10000},
  {item:"Bateria (verificar)",          intervalo:"24 meses",             urgencia:"media", km:null},
];
const INITIAL = {
  car:{marca:"Volkswagen",modelo:"Golf Generation",ano:2004,motor:"1.6 8v",placa:"",cor:"",kmAtual:0},
  abastecimentos:[], trocasOleo:[], servicos:[], pneus:[],
  alertas:[], documentos:[], despesasFixas:[],
  onboardingDone: false,
};
// Local fallback (used while loading from Firestore)
const memStore = {};
function loadLocalData(){ try{ const r=localStorage.getItem(SK); if(r) return {...INITIAL,...JSON.parse(r)}; }catch(e){ try{ const r=memStore[SK]; if(r) return {...INITIAL,...JSON.parse(r)}; }catch(e2){} } return INITIAL; }
function saveLocalData(d){ const s=JSON.stringify(d); try{ localStorage.setItem(SK,s); }catch(e){ memStore[SK]=s; } }

// ─── CHARTS ──────────────────────────────────────────────────────────────────
function LineChart({ data, color, h=80, labels, yLabel="" }) {
  const [tip, setTip] = useState(null);
  if (!data || data.length < 2) return <div style={{color:"#4E566E",fontSize:12,textAlign:"center",padding:"20px 0"}}>Registre mais dados para ver o gráfico.</div>;
  const W=560, H=h, P=10;
  const min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const pts=data.map((v,i)=>({x:(i/(data.length-1))*(W-P*2)+P, y:H-((v-min)/range)*(H-P*2)-P, v, l:labels?.[i]||""}));
  const poly=pts.map(p=>`${p.x},${p.y}`).join(" ");
  const area=`${pts[0].x},${H} ${poly} ${pts[pts.length-1].x},${H}`;
  const gid=`lg${color.replace(/[^a-z0-9]/gi,"")}`;
  return (
    <div style={{width:"100%",overflowX:"auto"}}>
      <svg width={W} height={H+22} viewBox={`0 0 ${W} ${H+22}`} style={{display:"block",maxWidth:"100%"}} onMouseLeave={()=>setTip(null)}>
        <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
        {[0,.25,.5,.75,1].map(p=>{const y=H-p*(H-P*2)-P; return <g key={p}><line x1={P} y1={y} x2={W-P} y2={y} stroke="#222638" strokeWidth={1} strokeDasharray="4,4"/><text x={P} y={y-3} fontSize={9} fill="#4E566E">{(min+p*range).toFixed(1)}{yLabel}</text></g>;})}
        <polygon points={area} fill={`url(#${gid})`}/>
        <polyline points={poly} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i)=>(
          <g key={i} onMouseEnter={()=>setTip(p)} style={{cursor:"pointer"}}>
            <circle cx={p.x} cy={p.y} r={10} fill="transparent"/>
            <circle cx={p.x} cy={p.y} r={tip?.x===p.x?6:4} fill={color} stroke="#141720" strokeWidth={2}/>
          </g>
        ))}
        {pts.map((p,i)=>{const skip=Math.ceil(pts.length/8); if(i%skip!==0&&i!==pts.length-1)return null; return <text key={i} x={p.x} y={H+18} fontSize={9} fill="#4E566E" textAnchor="middle">{p.l}</text>;})}
        {tip&&<g><rect x={Math.min(tip.x+8,W-100)} y={tip.y-30} width={92} height={22} rx={6} fill="#1A1E2C" stroke="#222638" strokeWidth={1}/><text x={Math.min(tip.x+54,W-46)} y={tip.y-15} fontSize={11} fill="#EEF2FF" textAnchor="middle" fontWeight="700">{tip.l}: {tip.v.toFixed(2)}{yLabel}</text></g>}
      </svg>
    </div>
  );
}

function StackedBarChart({ labels, series, h=130, T }) {
  const [tip,setTip] = useState(null);
  if(!labels||!labels.length) return null;
  const totals=labels.map((_,i)=>series.reduce((a,s)=>a+(s.values[i]||0),0));
  const max=Math.max(...totals)||1;
  return (
    <div style={{overflowX:"auto"}} onMouseLeave={()=>setTip(null)}>
      <div style={{display:"flex",alignItems:"flex-end",gap:5,height:h+44,minWidth:labels.length*28,position:"relative"}}>
        {labels.map((lbl,i)=>{
          const total=totals[i]; let bot=0;
          const bars=series.map(s=>{const val=s.values[i]||0; const pct=max?val/max:0; const b={val,pct,color:s.color,label:s.label,bot}; bot+=pct; return b;}).filter(b=>b.val>0);
          return (
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,minWidth:24}}>
              <div style={{fontSize:9,color:T.muted,marginBottom:2,height:14}}>{total>0?`${Math.round(total)}`:""}</div>
              <div style={{width:"100%",height:h,position:"relative",cursor:"pointer"}} onMouseEnter={e=>setTip({i,lbl,total,bars,x:e.clientX,y:e.clientY})}>
                {bars.map((b,j)=><div key={j} style={{position:"absolute",bottom:`${b.bot*100}%`,left:1,right:1,height:`${b.pct*100}%`,background:b.color,borderRadius:j===bars.length-1?"3px 3px 0 0":"0",opacity:.9}}/>)}
              </div>
              <div style={{fontSize:9,color:T.muted,marginTop:3,textAlign:"center"}}>{lbl}</div>
            </div>
          );
        })}
        {tip&&(
          <div style={{position:"fixed",top:tip.y-130,left:Math.min(tip.x-60,window.innerWidth-170),background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",zIndex:999,minWidth:160,pointerEvents:"none",boxShadow:"0 8px 32px rgba(0,0,0,.6)"}}>
            <div style={{fontWeight:700,fontSize:12,color:T.white,marginBottom:6}}>{tip.lbl}</div>
            {tip.bars.map((b,j)=><div key={j} style={{display:"flex",justifyContent:"space-between",gap:14,fontSize:11,marginBottom:3}}><span style={{color:b.color}}>■ {b.label}</span><span style={{fontWeight:600,color:T.text}}>{fmtR(b.val)}</span></div>)}
            <div style={{borderTop:`1px solid ${T.border}`,marginTop:5,paddingTop:5,fontSize:12,fontWeight:700,color:T.white,display:"flex",justifyContent:"space-between"}}><span>Total</span><span>{fmtR(tip.total)}</span></div>
          </div>
        )}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"6px 14px",marginTop:4}}>
        {series.map(s=><div key={s.label} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.sub}}><div style={{width:8,height:8,borderRadius:2,background:s.color}}/>{s.label}</div>)}
      </div>
    </div>
  );
}

// ─── UI PRIMITIVES ───────────────────────────────────────────────────────────
const mkBtn = T => (v="primary",sm)=>({display:"inline-flex",alignItems:"center",gap:6,borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"all .15s",padding:sm?"7px 13px":"10px 18px",fontSize:sm?12:13,background:v==="primary"?T.accent:v==="danger"?T.red:v==="green"?T.green:T.card2,color:v==="primary"?"#000":v==="danger"?"#fff":v==="green"?"#000":T.text,border:v==="sec"?`1px solid ${T.border}`:"none",boxSizing:"border-box"});

function Field({T,label,type="text",value,onChange,placeholder,step,readOnly,autoFocus}){
  return <div style={{marginBottom:13}}>
    <label style={{fontSize:12,fontWeight:600,color:T.sub,marginBottom:5,display:"block"}}>{label}</label>
    <input type={type} value={value??""} placeholder={placeholder} step={step} readOnly={readOnly} autoFocus={autoFocus}
      onChange={e=>onChange&&onChange(e.target.value)}
      style={{width:"100%",background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 13px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",opacity:readOnly?.55:1}}/>
  </div>;
}
function Sel({T,label,value,onChange,children}){
  return <div style={{marginBottom:13}}>
    <label style={{fontSize:12,fontWeight:600,color:T.sub,marginBottom:5,display:"block"}}>{label}</label>
    <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 13px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}>{children}</select>
  </div>;
}

function MWrap({T,onClose,children,wide}){
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:24,width:"100%",maxWidth:wide?700:490,maxHeight:"92vh",overflowY:"auto"}}>{children}</div>
  </div>;
}
function MHead({T,title,onClose}){
  return <div style={{fontSize:16,fontWeight:800,color:T.white,marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    {title}<button style={{background:"none",border:"none",cursor:"pointer",color:T.muted,padding:4}} onClick={onClose}><Ico d={IC.x} size={20}/></button></div>;
}

function ConfirmModal({T,title,desc,onConfirm,onCancel}){
  const b=mkBtn(T);
  return <MWrap T={T} onClose={onCancel}>
    <MHead T={T} title="⚠️ Confirmar exclusão" onClose={onCancel}/>
    <div style={{fontWeight:600,color:T.white,marginBottom:6}}>{title}</div>
    <div style={{fontSize:13,color:T.sub,marginBottom:20}}>{desc}</div>
    <div style={{display:"flex",gap:10}}>
      <button style={{...b("sec"),flex:1,justifyContent:"center"}} onClick={onCancel}>Cancelar</button>
      <button style={{...b("danger"),flex:1,justifyContent:"center"}} onClick={onConfirm}><Ico d={IC.trash} size={14}/>Excluir</button>
    </div>
  </MWrap>;
}

function Badge({c,children}){return <span style={{display:"inline-flex",alignItems:"center",padding:"3px 8px",borderRadius:6,fontSize:11,fontWeight:700,background:c+"20",color:c,letterSpacing:"0.03em",flexShrink:0,whiteSpace:"nowrap"}}>{children}</span>;}
function ABox({c,children}){return <div style={{background:c+"12",border:`1px solid ${c}30`,borderRadius:12,padding:"13px 15px",display:"flex",gap:11,marginBottom:11,alignItems:"flex-start"}}>{children}</div>;}
function Div({T}){return <div style={{height:1,background:T.border,margin:"13px 0"}}/>;}
function BTrack({c,pct}){return <div style={{height:5,background:"#222638",borderRadius:3,overflow:"hidden",marginTop:7}}><div style={{height:"100%",background:c,borderRadius:3,width:`${Math.min(pct||0,100)}%`,transition:"width .5s"}}/></div>;}
function SCard({T,c,children}){return <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:18,borderTop:`2px solid ${c||T.accent}`}}>{children}</div>;}
function Card({T,children,style}){return <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:18,...style}}>{children}</div>;}
function CTitle({T,icon,children}){return <div style={{fontSize:11,fontWeight:700,color:T.sub,marginBottom:13,display:"flex",alignItems:"center",gap:7,textTransform:"uppercase",letterSpacing:"0.06em"}}><Ico d={icon} size={13} stroke={T.sub}/>{children}</div>;}
function Grid({cols,gap,children,mb}){return <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fit,minmax(${cols||200}px,1fr))`,gap:gap||14,marginBottom:mb||18}}>{children}</div>;}
function PageHdr({T,title,sub,action}){return <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}><div><div style={{fontSize:22,fontWeight:800,color:T.white,letterSpacing:"-0.4px"}}>{title}</div>{sub&&<div style={{fontSize:13,color:T.sub,marginTop:3}}>{sub}</div>}</div>{action}</div>;}
function Empty({T,icon,text,onAdd,btnLabel}){const b=mkBtn(T); return <div style={{textAlign:"center",padding:"56px 20px",color:T.muted}}><Ico d={icon} size={44} stroke={T.border}/><div style={{marginTop:14,fontSize:14}}>{text}</div>{onAdd&&<button style={{...b("primary"),marginTop:16}} onClick={onAdd}><Ico d={IC.plus} size={15} stroke="#000"/>{btnLabel}</button>}</div>;}
function Toasts({list}){return <div style={{position:"fixed",bottom:24,right:24,zIndex:500,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none"}}>{list.map(t=><div key={t.id} style={{background:"#1A1E2C",border:`1px solid ${(t.color||"#2ECC8E")}40`,borderRadius:12,padding:"11px 16px",fontSize:13,fontWeight:600,color:"#EEF2FF",display:"flex",alignItems:"center",gap:9,boxShadow:"0 6px 28px rgba(0,0,0,.5)",minWidth:210}}><Ico d={t.icon||IC.check} size={15} stroke={t.color||"#2ECC8E"}/>{t.msg}</div>)}</div>;}

// ─── QUICK ADD (mobile fast entry) ───────────────────────────────────────────
function QuickAdd({T,data,onSave,onClose}){
  const b=mkBtn(T);
  const [km,setKm]=useState(data.car.kmAtual||"");
  const [litros,setLitros]=useState("");
  const [precoL,setPrecoL]=useState("");
  const [posto,setPosto]=useState("");
  const [pessoa,setPessoa]=useState(PESSOAS[0]);
  const total=litros&&precoL?+(+litros*+precoL).toFixed(2):0;
  const today=new Date().toISOString().slice(0,10);
  return <MWrap T={T} onClose={onClose}>
    <MHead T={T} title="⚡ Abastecimento Rápido" onClose={onClose}/>
    <div style={{fontSize:13,color:T.sub,marginBottom:16}}>Registro simplificado — 3 campos obrigatórios.</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <Field T={T} label="Km atual *" type="number" value={km} onChange={setKm} autoFocus/>
      <Field T={T} label="Litros *" type="number" step="0.01" value={litros} onChange={setLitros}/>
      <Field T={T} label="Preço/L (R$) *" type="number" step="0.01" value={precoL} onChange={setPrecoL}/>
      <Field T={T} label="Posto" value={posto} onChange={setPosto}/>
    </div>
    <Sel T={T} label="Quem abasteceu" value={pessoa} onChange={setPessoa}>
      {PESSOAS.map(p=><option key={p}>{p}</option>)}
    </Sel>
    {total>0&&<div style={{background:T.card2,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:13,color:T.sub}}>Total calculado</span>
      <span style={{fontSize:20,fontWeight:800,color:T.accent}}>{fmtR(total)}</span>
    </div>}
    <button style={{...b("primary"),width:"100%",justifyContent:"center"}} onClick={()=>{
      if(!km||!litros||!precoL){alert("Preencha km, litros e preço/L");return;}
      onSave({data:today,km:+km,litros:+litros,valorLitro:+precoL,total,posto,pessoa,tipo:"Gasolina"});
    }}><Ico d={IC.bolt} size={15} stroke="#000"/>Registrar Agora</button>
  </MWrap>;
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function Onboarding({T,onFinish}){
  const b=mkBtn(T);
  const [step,setStep]=useState(0);
  const [f,setF]=useState({placa:"",cor:"",kmAtual:"",modelo:"Golf Generation"});
  const ff=(k,v)=>setF(x=>({...x,[k]:v}));
  const steps=[
    {title:"Bem-vindo ao Golf Manager 🚗",sub:"Seu controle pessoal e completo para o Golf Generation 2004.",content:<div style={{textAlign:"center",padding:"20px 0"}}><div style={{fontSize:64,marginBottom:16}}>🚗</div><div style={{fontSize:14,color:T.sub,lineHeight:1.7}}>Controle de abastecimento, manutenção, gastos, alertas automáticos e muito mais — tudo num só lugar.</div></div>},
    {title:"Dados do seu carro",sub:"Preencha para personalizar o app.",content:<><Field T={T} label="Placa" value={f.placa} onChange={v=>ff("placa",v)} placeholder="ABC-1234"/><Field T={T} label="Cor" value={f.cor} onChange={v=>ff("cor",v)} placeholder="Ex: Prata, Preto..."/><Field T={T} label="Km atual do odômetro" type="number" value={f.kmAtual} onChange={v=>ff("kmAtual",v)} placeholder="Ex: 263000" autoFocus/></>},
    {title:"Tudo pronto! ✅",sub:"Seu Golf Manager está configurado.",content:<div style={{textAlign:"center",padding:"16px 0"}}><div style={{fontSize:56,marginBottom:16}}>✅</div><div style={{fontSize:14,color:T.sub,lineHeight:1.7,marginBottom:12}}>Comece registrando o primeiro abastecimento ou troca de óleo pelo menu lateral.</div><div style={{background:T.card2,borderRadius:12,padding:14,fontSize:13,color:T.sub,textAlign:"left"}}><div style={{fontWeight:700,color:T.white,marginBottom:8}}>💡 Dicas rápidas:</div><div style={{marginBottom:4}}>⚡ Use o botão de abastecimento rápido no celular</div><div style={{marginBottom:4}}>📊 O Dashboard calcula tudo automaticamente</div><div style={{marginBottom:4}}>🔔 Alertas automáticos de manutenção por km</div><div>💾 Dados salvos automaticamente</div></div></div>},
  ];
  const cur=steps[step];
  return (
    <div style={{position:"fixed",inset:0,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:20}}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:24,padding:32,width:"100%",maxWidth:420}}>
        <div style={{display:"flex",gap:6,marginBottom:24,justifyContent:"center"}}>{steps.map((_,i)=><div key={i} style={{width:i===step?24:8,height:8,borderRadius:4,background:i===step?T.accent:T.border,transition:"all .3s"}}/>)}</div>
        <div style={{fontSize:20,fontWeight:800,color:T.white,marginBottom:4}}>{cur.title}</div>
        <div style={{fontSize:13,color:T.sub,marginBottom:20}}>{cur.sub}</div>
        {cur.content}
        <div style={{display:"flex",gap:10,marginTop:16}}>
          {step>0&&<button style={{...b("sec"),flex:1,justifyContent:"center"}} onClick={()=>setStep(s=>s-1)}>Voltar</button>}
          <button style={{...b("primary"),flex:1,justifyContent:"center"}} onClick={()=>{
            if(step<steps.length-1){setStep(s=>s+1);}
            else{onFinish({placa:f.placa,cor:f.cor,kmAtual:+(f.kmAtual||0)});}
          }}>{step<steps.length-1?"Continuar":"Começar a usar"} →</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App(){
  const [data,setData]     = useState(loadLocalData);
  const [tab,setTab]       = useState("dashboard");
  const [modal,setModal]   = useState(null);
  const [form,setForm]     = useState({});
  const [toasts,setToasts] = useState([]);
  const [darkMode,setDark] = useState(true);
  const [mobile,setMobile] = useState(typeof window!=="undefined"&&window.innerWidth<700);
  const [user,setUser]     = useState(null);   // Firebase auth user
  const [authLoading,setAuthLoading] = useState(true);
  const [syncing,setSyncing] = useState(false);
  const saveTimeout = useRef(null);
  const [showMenu,setShowMenu] = useState(false);
  const [confirm,setConfirm]   = useState(null);
  const [searchQ,setSearchQ]   = useState("");
  const [filterPessoa,setFilterPessoa] = useState("Todos");
  const [filterMes,setFilterMes]       = useState("Todos");
  const [calcGas,setCalcGas] = useState("");
  const [calcEta,setCalcEta] = useState("");
  const hoje0=new Date();
  const [mesSel,setMesSel] = useState(`${hoje0.getFullYear()}-${String(hoje0.getMonth()+1).padStart(2,"0")}`);

  const T = darkMode ? DARK : LIGHT;
  const b = mkBtn(T);
  const Pc = PC(T);
  const Uc = URGC(T);

  useEffect(()=>{ const h=()=>setMobile(window.innerWidth<700); window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h); },[]);
  // ── AUTH LISTENER ─────────────────────────────────────────────────────────
  useEffect(()=>{
    const unsub = onAuthChange(async (u)=>{
      setUser(u);
      setAuthLoading(false);
      if(u){
        // Load from Firestore on login
        setSyncing(true);
        const remote = await loadFirestoreData();
        if(remote){ setData({...INITIAL,...remote}); saveLocalData({...INITIAL,...remote}); }
        setSyncing(false);
      }
    });
    return unsub;
  },[]);

  // ── REALTIME SYNC (listen to Firestore changes from other devices) ──────────
  useEffect(()=>{
    if(!user) return;
    const unsub = subscribeToData((remote)=>{
      setData(d=>{
        // Only update if remote is newer (has more records or different km)
        const remoteTotal = (remote.abastecimentos||[]).length + (remote.servicos||[]).length;
        const localTotal  = (d.abastecimentos||[]).length   + (d.servicos||[]).length;
        if(remoteTotal >= localTotal) return {...INITIAL,...remote};
        return d;
      });
    });
    return unsub;
  },[user]);

  // ── SAVE: local always, Firestore debounced when logged in ─────────────────
  useEffect(()=>{
    saveLocalData(data);
    if(!user) return;
    if(saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(()=>{
      setSyncing(true);
      saveFirestoreData(data).finally(()=>setSyncing(false));
    }, 1500);
    return ()=>{ if(saveTimeout.current) clearTimeout(saveTimeout.current); };
  },[data,user]);

  const toast=useCallback((msg,color,icon)=>{ const id=Date.now(); setToasts(t=>[...t,{id,msg,color,icon}]); setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),2800); },[]);

  const openModal=(type,item=null)=>{ setModal({type,item}); setForm(item?{...item}:{}); };
  const closeModal=()=>{ setModal(null); setForm({}); };
  const ff=(k,v)=>setForm(f=>({...f,[k]:v}));

  // Auto-update km when saving a record with higher km
  const saveItem=(col,item)=>{
    const newKm=+(item.km||0);
    setData(d=>{
      const list=d[col];
      const updated=item.id?list.map(i=>i.id===item.id?item:i):[{...item,id:Date.now()},...list];
      const newCar=newKm>d.car.kmAtual?{...d.car,kmAtual:newKm}:d.car;
      return {...d,[col]:updated,car:newCar};
    });
    if(newKm>data.car.kmAtual) toast(`Km atualizado para ${fmtKm(newKm)}`,T.accent,IC.km);
    else toast("Salvo ✓",T.green,IC.check);
    closeModal();
  };

  const askDel=(col,id,title)=>setConfirm({col,id,title});
  const confirmDel=()=>{ if(confirm){ setData(d=>({...d,[confirm.col]:d[confirm.col].filter(i=>i.id!==confirm.id)})); toast("Removido",T.red,IC.trash); setConfirm(null); } };

  const updateCar=p=>setData(d=>({...d,car:{...d.car,...p}}));
  const gotoTab=t=>{ setTab(t); setShowMenu(false); };

  // Export / Import
  const exportJSON=()=>{ const j=JSON.stringify(data,null,2); try{ const bl=new Blob([j],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(bl); a.download=`golf_${new Date().toISOString().slice(0,10)}.json`; a.click(); toast("Backup exportado!",T.green,IC.download); }catch(e){ openModal("exportview"); setForm({json:j}); } };
  const importJSON=()=>openModal("importview");

  // ── SMART ALERTS ──────────────────────────────────────────────────────────
  const smartAlerts=useMemo(()=>{
    const km=data.car.kmAtual, alerts=[];
    const lo=data.trocasOleo[0];
    if(lo?.proxKm){ const d=lo.proxKm-km; if(d<=1000) alerts.push({id:"oleo",titulo:"Troca de óleo",desc:d<=0?`Vencida há ${Math.abs(d).toLocaleString()} km`:`Faltam ${d.toLocaleString()} km`,urgencia:d<=0?"alta":"media",cat:"km"}); }
    if(km>0){
      const lServ=data.servicos.reduce((acc,s)=>{ if(!acc[s.tipo]||s.km>acc[s.tipo]) acc[s.tipo]=s.km; return acc; },{});
      MANUTENCAO.filter(m=>m.km).forEach(m=>{ const bk=lServ[m.item]||0; if(bk>0){ const d=(bk+m.km)-km; if(d<=2000) alerts.push({id:`rev_${m.item}`,titulo:m.item,desc:d<=0?`Vencida há ${Math.abs(d).toLocaleString()} km`:`Faltam ${d.toLocaleString()} km`,urgencia:d<=0?"alta":"media",cat:"revisao"}); } });
    }
    const hoje=new Date(); hoje.setHours(0,0,0,0);
    data.documentos.filter(d=>!d.pago&&d.vencimento).forEach(d=>{ const v=new Date(d.vencimento+"T00:00:00"); const dias=Math.round((v-hoje)/86400000); if(dias<=90) alerts.push({id:`doc_${d.id}`,titulo:`${d.tipo} vencendo`,desc:dias<=0?`Venceu há ${Math.abs(dias)} dia${Math.abs(dias)!==1?"s":""}!`:`Vence em ${dias} dia${dias!==1?"s":""}`,urgencia:dias<=0?"alta":dias<=30?"media":"baixa",cat:"doc"}); });
    return alerts;
  },[data]);

  // ── STATISTICS ────────────────────────────────────────────────────────────
  const S=useMemo(()=>{
    const ab=data.abastecimentos, n=ab.length;
    const tAb=ab.reduce((a,i)=>a+(i.total||0),0);
    const tOleo=data.trocasOleo.reduce((a,i)=>a+(i.valor||0),0);
    const tServ=data.servicos.reduce((a,i)=>a+(i.valor||0),0);
    const tPneu=data.pneus.reduce((a,i)=>a+(i.valor||0),0);
    const tDocs=data.documentos.reduce((a,i)=>a+(i.valor||0),0);
    const tFix=data.despesasFixas.reduce((a,i)=>a+(i.valor||0),0);
    const total=tAb+tOleo+tServ+tPneu+tDocs+tFix;
    const abE=ab.filter(i=>i.pessoa==="Eliseu").reduce((a,i)=>a+(i.total||0),0);
    const abEl=ab.filter(i=>i.pessoa==="Elias").reduce((a,i)=>a+(i.total||0),0);

    const sorted=[...ab].filter(a=>a.km>0&&a.litros>0).sort((a,b)=>a.km-b.km);
    const kmLEntries=[]; for(let i=1;i<sorted.length;i++){ const dk=sorted[i].km-sorted[i-1].km,L=sorted[i].litros; if(dk>0&&dk<800&&L>0) kmLEntries.push({v:+(dk/L).toFixed(2),l:sorted[i].data?.slice(5)||""}); }
    const kmLArr=kmLEntries.map(e=>e.v);
    const mediaKmL=kmLArr.length?+(kmLArr.reduce((a,b)=>a+b,0)/kmLArr.length).toFixed(2):null;
    const melhorKmL=kmLArr.length?Math.max(...kmLArr):null;
    const piorKmL=kmLArr.length?Math.min(...kmLArr):null;
    const mediaPreco=n?+(ab.reduce((a,b)=>a+(b.valorLitro||0),0)/n).toFixed(2):null;
    const mediaGasto=n?+(tAb/n).toFixed(2):null;
    const mediaLit=n?+(ab.reduce((a,b)=>a+(b.litros||0),0)/n).toFixed(1):null;

    // preço combustível ao longo do tempo
    const precosLinha=ab.filter(a=>a.data&&a.valorLitro).sort((a,b)=>a.data.localeCompare(b.data)).map(a=>({v:a.valorLitro,l:a.data.slice(5)}));

    // gastos mensais stacked
    const mesMap={};
    const addM=(item,cat)=>{ const d=item.data||item.vencimento; if(!d)return; const m=d.slice(0,7); if(!mesMap[m]) mesMap[m]={ab:0,oleo:0,serv:0,pneu:0,doc:0}; mesMap[m][cat]+=(item.total||item.valor||0); };
    ab.forEach(i=>addM(i,"ab")); data.trocasOleo.forEach(i=>addM(i,"oleo")); data.servicos.forEach(i=>addM(i,"serv")); data.pneus.forEach(i=>addM(i,"pneu")); data.documentos.forEach(i=>addM(i,"doc"));
    const meses=Object.keys(mesMap).sort().slice(-8);
    const mesLabels=meses.map(m=>{ const[y,mo]=m.split("-"); return `${mesNome(mo)}/${y.slice(2)}`; });
    const stackSeries=[{label:"Combustível",color:T.accent,values:meses.map(m=>mesMap[m].ab)},{label:"Óleo",color:T.green,values:meses.map(m=>mesMap[m].oleo)},{label:"Serviços",color:T.blue,values:meses.map(m=>mesMap[m].serv)},{label:"Pneus",color:T.purple,values:meses.map(m=>mesMap[m].pneu)},{label:"Docs",color:T.teal,values:meses.map(m=>mesMap[m].doc)}];

    // relatório mensal atual
    const hoje=new Date();
    const mesAtual=`${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}`;
    const mesAnt=meses[meses.length-2]||null;
    const totalMesAtual=mesMap[mesAtual]?Object.values(mesMap[mesAtual]).reduce((a,b)=>a+b,0):0;
    const totalMesAnt=mesAnt&&mesMap[mesAnt]?Object.values(mesMap[mesAnt]).reduce((a,b)=>a+b,0):0;
    const varMes=totalMesAnt>0?((totalMesAtual-totalMesAnt)/totalMesAnt)*100:0;

    // km rodados por mês
    const kmMesMap={};
    sorted.forEach(a=>{ if(!a.data)return; const m=a.data.slice(0,7); if(!kmMesMap[m]) kmMesMap[m]={min:a.km,max:a.km}; else{ kmMesMap[m].min=Math.min(kmMesMap[m].min,a.km); kmMesMap[m].max=Math.max(kmMesMap[m].max,a.km); } });
    const kmPorMes=Object.entries(kmMesMap).sort(([a],[b])=>a.localeCompare(b)).map(([m,v])=>({m,km:v.max-v.min}));
    const mediaKmMes=kmPorMes.length?+(kmPorMes.reduce((a,b)=>a+b.km,0)/kmPorMes.length).toFixed(0):null;

    // projeção anual
    const mesesComDados=meses.length;
    const projecaoAnual=mesesComDados>0?+(total/mesesComDados*12).toFixed(2):null;

    // ranking postos
    const pm={};
    ab.filter(a=>a.posto&&a.valorLitro).forEach(a=>{ if(!pm[a.posto]) pm[a.posto]={nome:a.posto,precos:[],total:0,count:0}; pm[a.posto].precos.push(a.valorLitro); pm[a.posto].total+=a.total||0; pm[a.posto].count++; });
    const rankPostos=Object.values(pm).map(p=>({...p,mediaPreco:+(p.precos.reduce((a,b)=>a+b,0)/p.precos.length).toFixed(2)})).sort((a,b)=>a.mediaPreco-b.mediaPreco);

    // gasolina vs etanol médias separadas
    const gasAb=ab.filter(a=>a.tipo==="Gasolina"&&a.litros>0);
    const etaAb=ab.filter(a=>a.tipo==="Etanol"&&a.litros>0);

    const lo=data.trocasOleo[0]||null;
    const proxOleo=lo?.proxKm||null;
    const kmFaltOleo=proxOleo?proxOleo-data.car.kmAtual:null;
    const kmRodados=sorted.length>=2?sorted[sorted.length-1].km-sorted[0].km:0;
    const custoPorKm=kmRodados>0?+(total/kmRodados).toFixed(2):null;

    return {tAb,tOleo,tServ,tPneu,tDocs,tFix,total,abE,abEl,
            kmLEntries,kmLArr,mediaKmL,melhorKmL,piorKmL,
            precosLinha,stackSeries,mesLabels,meses,mesMap,
            mediaPreco,mediaGasto,mediaLit,rankPostos,
            totalMesAtual,totalMesAnt,varMes,mediaKmMes,projecaoAnual,
            gasAb,etaAb,lo,proxOleo,kmFaltOleo,kmRodados,custoPorKm,n};
  },[data,T]);

  const alertCount=(data.alertas.filter(a=>a.ativo).length)+smartAlerts.length;

  // ── NAV ───────────────────────────────────────────────────────────────────
  const NAV=[
    {g:"Principal",items:[{id:"dashboard",l:"Dashboard",icon:IC.dash},{id:"specs",l:"Ficha Golf",icon:IC.car},{id:"revisoes",l:"Revisões",icon:IC.settings}]},
    {g:"Controle",items:[{id:"abast",l:"Abastecimento",icon:IC.fuel},{id:"oleo",l:"Óleo",icon:IC.oil},{id:"servicos",l:"Serviços",icon:IC.wrench},{id:"pneus",l:"Pneus",icon:IC.tire}]},
    {g:"Financeiro",items:[{id:"docs",l:"Docs/IPVA",icon:IC.doc},{id:"fixas",l:"Fixas",icon:IC.tag},{id:"gastos",l:"Relatório",icon:IC.chart},{id:"mensal",l:"Relatório Mensal",icon:IC.report}]},
    {g:"Ferramentas",items:[{id:"calc",l:"Calculadora",icon:IC.calc},{id:"postos",l:"Postos",icon:IC.posto},{id:"alertas",l:"Alertas",icon:IC.bell}]},
  ];
  const ALL=[...NAV.flatMap(g=>g.items)];
  const BOTTOM_NAV=[{id:"dashboard",l:"Início",icon:IC.dash},{id:"abast",l:"Abast.",icon:IC.fuel},{id:"gastos",l:"Gastos",icon:IC.chart},{id:"alertas",l:"Alertas",icon:IC.bell},{id:"mais",l:"Mais",icon:IC.menu}];

  // ── FILTERED RECORDS ─────────────────────────────────────────────────────
  const filteredAb=useMemo(()=>{
    let r=data.abastecimentos;
    if(filterPessoa!=="Todos") r=r.filter(a=>a.pessoa===filterPessoa);
    if(filterMes!=="Todos") r=r.filter(a=>a.data?.slice(0,7)===filterMes);
    if(searchQ) r=r.filter(a=>(a.posto||"").toLowerCase().includes(searchQ.toLowerCase()));
    return r;
  },[data.abastecimentos,filterPessoa,filterMes,searchQ]);

  // available months for filter
  const availMeses=useMemo(()=>[...new Set(data.abastecimentos.map(a=>a.data?.slice(0,7)).filter(Boolean))].sort().reverse(),[data.abastecimentos]);

  // ─── SHARED PAGE PROPS ───────────────────────────────────────────────────
  const pp={T,b,Pc,Uc,data,S,smartAlerts,alertCount,modal,form,tab,setTab:gotoTab,openModal,closeModal,ff,saveItem,askDel,updateCar,setData,toast,exportJSON,importJSON,INITIAL,searchQ,setSearchQ,filterPessoa,setFilterPessoa,filterMes,setFilterMes,filteredAb,availMeses,calcGas,setCalcGas,calcEta,setCalcEta,mesSel,setMesSel};

  // ─── ONBOARDING ──────────────────────────────────────────────────────────
  // ── AUTH LOADING ──────────────────────────────────────────────────────────
  if(authLoading) return (
    <div style={{minHeight:"100vh",background:DARK.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{width:40,height:40,border:`3px solid ${DARK.border}`,borderTop:`3px solid ${DARK.accent}`,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      <div style={{color:DARK.sub,fontSize:14}}>Carregando...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if(!user) return (
    <div style={{minHeight:"100vh",background:DARK.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:DARK.card,border:`1px solid ${DARK.border}`,borderRadius:24,padding:40,width:"100%",maxWidth:380,textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:16}}>🚗</div>
        <div style={{fontSize:24,fontWeight:800,color:DARK.white,marginBottom:8,letterSpacing:"-0.5px"}}>Golf Manager</div>
        <div style={{fontSize:14,color:DARK.sub,marginBottom:32,lineHeight:1.6}}>Controle completo do seu<br/>VW Golf Generation 2004</div>
        <button onClick={()=>signInWithGoogle().catch(e=>console.error(e))} style={{display:"flex",alignItems:"center",gap:12,background:DARK.white,color:"#1A2040",border:"none",borderRadius:12,padding:"14px 24px",fontSize:15,fontWeight:700,cursor:"pointer",width:"100%",justifyContent:"center",marginBottom:16}}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Entrar com Google
        </button>
        <div style={{fontSize:12,color:DARK.muted,lineHeight:1.6}}>
          Os dados ficam sincronizados entre<br/>todos os seus dispositivos automaticamente.
        </div>
      </div>
    </div>
  );

  if(!data.onboardingDone) return (
    <>
      <Onboarding T={T} onFinish={f=>{ setData(d=>({...d,car:{...d.car,...f},onboardingDone:true})); toast("Bem-vindo ao Golf Manager!",T.green,IC.check); }}/>
      <Toasts list={toasts}/>
    </>
  );

  const SidebarContent=()=>(
    <>
      {/* User info */}
      <div style={{padding:"12px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10}}>
        {user?.photoURL&&<img src={user.photoURL} alt="" style={{width:32,height:32,borderRadius:"50%",flexShrink:0}}/>}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:700,color:T.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.displayName||"Usuário"}</div>
          <div style={{fontSize:10,color:syncing?T.accent:T.green,marginTop:1}}>{syncing?"⏳ Sincronizando...":"☁️ Sincronizado"}</div>
        </div>
        <button onClick={()=>signOutUser()} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,cursor:"pointer",color:T.muted,padding:"4px 8px",fontSize:11,fontFamily:"inherit"}} title="Sair">Sair</button>
      </div>
      <div style={{padding:"14px 14px 12px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{fontSize:10,fontWeight:700,color:T.muted,letterSpacing:"0.08em",marginBottom:9,textTransform:"uppercase"}}>Meu Carro</div>
        <div style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 12px"}}>
          <div style={{fontSize:13,fontWeight:800,color:T.white}}>{data.car.modelo}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:1}}>{data.car.ano} · {data.car.motor}</div>
          <div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
            <div style={{fontSize:10,color:T.muted,marginBottom:2}}>KM ATUAL</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:16,fontWeight:800,color:T.accent}}>{fmtKm(data.car.kmAtual)}</span>
              <button style={{background:"none",border:"none",cursor:"pointer",color:T.muted,padding:0}} onClick={()=>openModal("editkm")}><Ico d={IC.edit} size={12}/></button>
            </div>
          </div>
        </div>
      </div>
      <nav style={{padding:"8px",flex:1,overflowY:"auto"}}>
        {NAV.map(g=>(
          <div key={g.g} style={{marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted,padding:"0 8px",marginBottom:4}}>{g.g}</div>
            {g.items.map(item=>(
              <button key={item.id} onClick={()=>gotoTab(item.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:tab===item.id?600:400,background:tab===item.id?T.accent+"22":"transparent",color:tab===item.id?T.accent:T.sub,width:"100%",textAlign:"left",marginBottom:2,fontFamily:"inherit",transition:"all .15s"}}>
                <Ico d={item.icon} size={14} stroke={tab===item.id?T.accent:T.muted}/>
                {item.l}
                {item.id==="alertas"&&alertCount>0&&<Badge c={T.red}>{alertCount}</Badge>}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div style={{padding:"10px 8px",borderTop:`1px solid ${T.border}`}}>
        <div style={{display:"flex",gap:5,marginBottom:6}}>
          <button style={{...b("sec",true),flex:1,justifyContent:"center"}} onClick={exportJSON}><Ico d={IC.download} size={13}/>Backup</button>
          <button style={{...b("sec",true),flex:1,justifyContent:"center"}} onClick={importJSON}><Ico d={IC.upload} size={13}/>Import</button>
        </div>
        <button style={{...b("sec",true),width:"100%",justifyContent:"center"}} onClick={()=>setDark(x=>!x)}>
          <Ico d={darkMode?IC.sun:IC.moon} size={13}/>{darkMode?"Modo Claro":"Modo Escuro"}
        </button>
      </div>
    </>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>

      {!mobile?(
        <div style={{display:"flex",flex:1,minHeight:0}}>
          <aside style={{width:224,background:T.surf,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",overflowY:"auto",flexShrink:0}}>
            <SidebarContent/>
          </aside>
          <main style={{flex:1,overflowY:"auto",padding:"26px 30px",boxSizing:"border-box"}}>
            <PageContent {...pp}/>
          </main>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",flex:1,paddingBottom:64}}>
          <div style={{background:T.surf,borderBottom:`1px solid ${T.border}`,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {user?.photoURL&&<img src={user.photoURL} alt="" style={{width:28,height:28,borderRadius:"50%"}}/>}
              <div><div style={{fontSize:14,fontWeight:800,color:T.white}}>{ALL.find(i=>i.id===tab)?.l||"Golf Manager"}</div><div style={{fontSize:10,color:syncing?T.accent:T.green}}>{syncing?"⏳ Sincronizando...":"☁️ Salvo"}</div></div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {alertCount>0&&<Badge c={T.red}>{alertCount}</Badge>}
              <button style={{...b("primary",true)}} onClick={()=>openModal("quickadd")}><Ico d={IC.bolt} size={14} stroke="#000"/>Abastecer</button>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"14px"}}><PageContent {...pp}/></div>
          <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.surf,borderTop:`1px solid ${T.border}`,display:"flex",zIndex:100}}>
            {BOTTOM_NAV.map(item=>(
              <button key={item.id} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 4px",background:"none",border:"none",cursor:"pointer",color:tab===item.id?T.accent:T.muted,fontFamily:"inherit",position:"relative"}} onClick={()=>item.id==="mais"?setShowMenu(m=>!m):gotoTab(item.id)}>
                <Ico d={item.icon} size={20} stroke={tab===item.id?T.accent:T.muted}/>
                <span style={{fontSize:10,fontWeight:tab===item.id?700:400}}>{item.l}</span>
                {item.id==="alertas"&&alertCount>0&&<div style={{position:"absolute",top:6,right:"20%",width:8,height:8,borderRadius:"50%",background:T.red}}/>}
              </button>
            ))}
          </div>
          {showMenu&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:200,overflowY:"auto",paddingBottom:20}} onClick={()=>setShowMenu(false)}>
              <div style={{background:T.surf,borderBottom:`1px solid ${T.border}`,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:700,color:T.white}}>Menu</span>
                <div style={{display:"flex",gap:8}}>
                  <button style={{...b("sec",true)}} onClick={e=>{e.stopPropagation();setDark(x=>!x);}}><Ico d={darkMode?IC.sun:IC.moon} size={14}/></button>
                  <button style={{background:"none",border:"none",cursor:"pointer",color:T.muted}} onClick={()=>setShowMenu(false)}><Ico d={IC.x} size={22}/></button>
                </div>
              </div>
              {NAV.map(g=><div key={g.g} style={{padding:"12px 16px 0"}}><div style={{fontSize:10,fontWeight:700,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{g.g}</div>{g.items.map(item=><button key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:`1px solid ${T.border}`,cursor:"pointer",fontSize:14,fontWeight:600,background:T.card,color:T.text,width:"100%",textAlign:"left",marginBottom:6,fontFamily:"inherit"}} onClick={()=>gotoTab(item.id)}><Ico d={item.icon} size={18} stroke={T.sub}/>{item.l}</button>)}</div>)}
              <div style={{padding:"12px 16px"}}><div style={{display:"flex",gap:8}}><button style={{...b("sec"),flex:1,justifyContent:"center"}} onClick={()=>{setShowMenu(false);exportJSON();}}><Ico d={IC.download} size={14}/>Backup</button><button style={{...b("sec"),flex:1,justifyContent:"center"}} onClick={()=>{setShowMenu(false);importJSON();}}><Ico d={IC.upload} size={14}/>Importar</button></div></div>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {modal&&(()=>{
        const M=modal.type;
        if(M==="quickadd") return <QuickAdd T={T} data={data} onSave={item=>{saveItem("abastecimentos",item);}} onClose={closeModal}/>;
        if(M==="editkm") return <MWrap T={T} onClose={closeModal}><MHead T={T} title="Atualizar Km Atual" onClose={closeModal}/><Field T={T} label="Km atual" type="number" value={form.km??data.car.kmAtual} onChange={v=>ff("km",v)} autoFocus/><button style={{...b("primary"),width:"100%",justifyContent:"center",marginTop:8}} onClick={()=>{updateCar({kmAtual:+form.km});toast("Km atualizado",T.accent,IC.km);closeModal();}}><Ico d={IC.check} size={15} stroke="#000"/>Atualizar</button></MWrap>;
        if(M==="editcar") return <MWrap T={T} onClose={closeModal}><MHead T={T} title="Dados do Carro" onClose={closeModal}/><Field T={T} label="Placa" value={form.placa??data.car.placa} onChange={v=>ff("placa",v)} placeholder="ABC-1234"/><Field T={T} label="Cor" value={form.cor??data.car.cor} onChange={v=>ff("cor",v)}/><Field T={T} label="Km atual" type="number" value={form.kmAtual??data.car.kmAtual} onChange={v=>ff("kmAtual",v)}/><button style={{...b("primary"),width:"100%",justifyContent:"center",marginTop:8}} onClick={()=>{setData(d=>({...d,car:{...d.car,...form,kmAtual:+form.kmAtual}}));toast("Salvo",T.green,IC.check);closeModal();}}><Ico d={IC.check} size={15} stroke="#000"/>Salvar</button></MWrap>;
        if(M==="abast") return <MWrap T={T} onClose={closeModal}><MHead T={T} title={modal.item?"Editar Abastecimento":"Novo Abastecimento"} onClose={closeModal}/><Field T={T} label="Data" type="date" value={form.data||""} onChange={v=>ff("data",v)}/><Field T={T} label="Km" type="number" value={form.km||""} onChange={v=>ff("km",+v)}/><Sel T={T} label="Pessoa" value={form.pessoa||""} onChange={v=>ff("pessoa",v)}><option value="">— selecione —</option>{PESSOAS.map(p=><option key={p}>{p}</option>)}</Sel><Sel T={T} label="Combustível" value={form.tipo||"Gasolina"} onChange={v=>ff("tipo",v)}><option>Gasolina</option><option>Etanol</option><option>Diesel</option><option>GNV</option></Sel><Field T={T} label="Litros" type="number" step="0.01" value={form.litros||""} onChange={v=>setForm(f=>({...f,litros:+v,total:+((+v)*(f.valorLitro||0)).toFixed(2)}))}/><Field T={T} label="Preço/L (R$)" type="number" step="0.01" value={form.valorLitro||""} onChange={v=>setForm(f=>({...f,valorLitro:+v,total:+((f.litros||0)*(+v)).toFixed(2)}))}/><Field T={T} label="Total (R$)" type="number" step="0.01" value={form.total||""} onChange={v=>ff("total",+v)}/><Field T={T} label="Posto" value={form.posto||""} onChange={v=>ff("posto",v)}/><button style={{...b("primary"),width:"100%",justifyContent:"center",marginTop:8}} onClick={()=>saveItem("abastecimentos",form)}><Ico d={IC.check} size={15} stroke="#000"/>{modal.item?"Salvar":"Registrar"}</button></MWrap>;
        if(M==="oleo") return <MWrap T={T} onClose={closeModal}><MHead T={T} title={modal.item?"Editar Troca":"Registrar Troca de Óleo"} onClose={closeModal}/><Field T={T} label="Data" type="date" value={form.data||""} onChange={v=>ff("data",v)}/><Field T={T} label="Km" type="number" value={form.km||""} onChange={v=>ff("km",+v)}/><Field T={T} label="Tipo de óleo" value={form.tipo||""} onChange={v=>ff("tipo",v)} placeholder="Ex: Sintético 5W-30"/><Field T={T} label="Próxima troca (km)" type="number" value={form.proxKm||""} onChange={v=>ff("proxKm",+v)}/><Field T={T} label="Valor (R$)" type="number" step="0.01" value={form.valor||""} onChange={v=>ff("valor",+v)}/><Field T={T} label="Obs" value={form.obs||""} onChange={v=>ff("obs",v)}/><button style={{...b("primary"),width:"100%",justifyContent:"center",marginTop:8}} onClick={()=>saveItem("trocasOleo",form)}><Ico d={IC.check} size={15} stroke="#000"/>{modal.item?"Salvar":"Registrar"}</button></MWrap>;
        if(M==="servico") return <MWrap T={T} onClose={closeModal}><MHead T={T} title={modal.item?"Editar Serviço":"Novo Serviço"} onClose={closeModal}/><Field T={T} label="Data" type="date" value={form.data||""} onChange={v=>ff("data",v)}/><Field T={T} label="Tipo" value={form.tipo||""} onChange={v=>ff("tipo",v)} placeholder="Ex: Freios, Correia..."/><Field T={T} label="Km" type="number" value={form.km||""} onChange={v=>ff("km",+v)}/><Field T={T} label="Oficina" value={form.oficina||""} onChange={v=>ff("oficina",v)}/><Field T={T} label="Valor (R$)" type="number" step="0.01" value={form.valor||""} onChange={v=>ff("valor",+v)}/><Sel T={T} label="Status" value={form.status||"Concluído"} onChange={v=>ff("status",v)}><option>Concluído</option><option>Agendado</option><option>Em andamento</option></Sel><Field T={T} label="Obs" value={form.obs||""} onChange={v=>ff("obs",v)}/><button style={{...b("primary"),width:"100%",justifyContent:"center",marginTop:8}} onClick={()=>saveItem("servicos",form)}><Ico d={IC.check} size={15} stroke="#000"/>{modal.item?"Salvar":"Registrar"}</button></MWrap>;
        if(M==="pneu") return <MWrap T={T} onClose={closeModal}><MHead T={T} title={modal.item?"Editar Pneu":"Registrar Pneu"} onClose={closeModal}/><Field T={T} label="Data" type="date" value={form.data||""} onChange={v=>ff("data",v)}/><Field T={T} label="Km" type="number" value={form.km||""} onChange={v=>ff("km",+v)}/><Field T={T} label="Marca" value={form.marca||""} onChange={v=>ff("marca",v)}/><Field T={T} label="Modelo" value={form.modelo||""} onChange={v=>ff("modelo",v)}/><Field T={T} label="Posição" value={form.posicao||""} onChange={v=>ff("posicao",v)} placeholder="Ex: Todos 4"/><Field T={T} label="Vida estimada (km)" type="number" value={form.proxKm||""} onChange={v=>ff("proxKm",+v)}/><Field T={T} label="Valor (R$)" type="number" step="0.01" value={form.valor||""} onChange={v=>ff("valor",+v)}/><button style={{...b("primary"),width:"100%",justifyContent:"center",marginTop:8}} onClick={()=>saveItem("pneus",form)}><Ico d={IC.check} size={15} stroke="#000"/>{modal.item?"Salvar":"Registrar"}</button></MWrap>;
        if(M==="doc") return <MWrap T={T} onClose={closeModal}><MHead T={T} title={modal.item?"Editar":"Novo Documento/Taxa"} onClose={closeModal}/><Sel T={T} label="Tipo" value={form.tipo||"IPVA"} onChange={v=>ff("tipo",v)}><option>IPVA</option><option>Licenciamento</option><option>Seguro obrigatório (DPVAT)</option><option>Seguro voluntário</option><option>Vistoria</option><option>Multa</option><option>Outro</option></Sel><Field T={T} label="Vencimento" type="date" value={form.vencimento||""} onChange={v=>ff("vencimento",v)}/><Field T={T} label="Ano ref." value={form.anoRef||""} onChange={v=>ff("anoRef",v)} placeholder="2025"/><Field T={T} label="Valor (R$)" type="number" step="0.01" value={form.valor||""} onChange={v=>ff("valor",+v)}/><Sel T={T} label="Status" value={form.pago?"sim":"nao"} onChange={v=>ff("pago",v==="sim")}><option value="nao">Pendente</option><option value="sim">Pago</option></Sel><Field T={T} label="Obs" value={form.obs||""} onChange={v=>ff("obs",v)}/><button style={{...b("primary"),width:"100%",justifyContent:"center",marginTop:8}} onClick={()=>saveItem("documentos",form)}><Ico d={IC.check} size={15} stroke="#000"/>{modal.item?"Salvar":"Registrar"}</button></MWrap>;
        if(M==="fixa") return <MWrap T={T} onClose={closeModal}><MHead T={T} title={modal.item?"Editar":"Nova Despesa Fixa"} onClose={closeModal}/><Field T={T} label="Nome" value={form.nome||""} onChange={v=>ff("nome",v)} placeholder="Ex: Seguro, Rastreador..."/><Field T={T} label="Valor (R$)" type="number" step="0.01" value={form.valor||""} onChange={v=>ff("valor",+v)}/><Sel T={T} label="Periodicidade" value={form.periodicidade||"mensal"} onChange={v=>ff("periodicidade",v)}><option value="mensal">Mensal</option><option value="anual">Anual</option><option value="semestral">Semestral</option></Sel><Field T={T} label="Obs" value={form.obs||""} onChange={v=>ff("obs",v)}/><button style={{...b("primary"),width:"100%",justifyContent:"center",marginTop:8}} onClick={()=>saveItem("despesasFixas",form)}><Ico d={IC.check} size={15} stroke="#000"/>{modal.item?"Salvar":"Registrar"}</button></MWrap>;
        if(M==="alerta") return <MWrap T={T} onClose={closeModal}><MHead T={T} title="Novo Alerta Manual" onClose={closeModal}/><Field T={T} label="Título" value={form.titulo||""} onChange={v=>ff("titulo",v)}/><Field T={T} label="Descrição" value={form.desc||""} onChange={v=>ff("desc",v)}/><Field T={T} label="Vencimento (opcional)" type="date" value={form.vencimento||""} onChange={v=>ff("vencimento",v)}/><Sel T={T} label="Urgência" value={form.urgencia||"media"} onChange={v=>ff("urgencia",v)}><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></Sel><button style={{...b("primary"),width:"100%",justifyContent:"center",marginTop:8}} onClick={()=>saveItem("alertas",{...form,ativo:true})}><Ico d={IC.check} size={15} stroke="#000"/>Criar Alerta</button></MWrap>;
        if(M==="exportview") return <MWrap T={T} onClose={closeModal}><MHead T={T} title="Backup JSON" onClose={closeModal}/><div style={{fontSize:12,color:T.sub,marginBottom:9}}>Copie o JSON abaixo para guardar como backup.</div><textarea readOnly value={form.json||""} style={{width:"100%",background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:10,color:T.text,fontSize:11,fontFamily:"monospace",height:200,boxSizing:"border-box",resize:"vertical"}}/><button style={{...b("primary"),width:"100%",justifyContent:"center",marginTop:10}} onClick={()=>{try{navigator.clipboard.writeText(form.json||"");toast("Copiado!",T.green,IC.check);}catch(e){}}}><Ico d={IC.check} size={15} stroke="#000"/>Copiar JSON</button></MWrap>;
        if(M==="importview") return <MWrap T={T} onClose={closeModal}><MHead T={T} title="Importar Dados" onClose={closeModal}/><div style={{fontSize:12,color:T.sub,marginBottom:9}}>Cole o JSON de backup abaixo.</div><textarea value={form.json||""} onChange={e=>ff("json",e.target.value)} placeholder="Cole o JSON aqui..." style={{width:"100%",background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:10,color:T.text,fontSize:11,fontFamily:"monospace",height:200,boxSizing:"border-box",resize:"vertical"}}/><button style={{...b("primary"),width:"100%",justifyContent:"center",marginTop:10}} onClick={()=>{try{setData({...INITIAL,...JSON.parse(form.json||"")});toast("Importado!",T.green,IC.upload);closeModal();}catch(e){toast("JSON inválido",T.red,IC.warn);}}}><Ico d={IC.upload} size={15} stroke="#000"/>Importar</button></MWrap>;
        return null;
      })()}

      {confirm&&<ConfirmModal T={T} title={`Excluir "${confirm.title}"?`} desc="Essa ação não pode ser desfeita." onConfirm={confirmDel} onCancel={()=>setConfirm(null)}/>}
      <Toasts list={toasts}/>
    </div>
  );
}

// ─── PAGE CONTENT ─────────────────────────────────────────────────────────────
function PageContent({T,b,Pc,Uc,data,S,smartAlerts,alertCount,tab,setTab,openModal,closeModal,ff,saveItem,askDel,updateCar,setData,toast,exportJSON,importJSON,INITIAL,searchQ,setSearchQ,filterPessoa,setFilterPessoa,filterMes,setFilterMes,filteredAb,availMeses,calcGas,setCalcGas,calcEta,setCalcEta,mesSel,setMesSel}){

  const CritAlerts=()=><>{[...smartAlerts.filter(a=>a.urgencia==="alta"),...data.alertas.filter(a=>a.ativo&&a.urgencia==="alta")].map((a,i)=><ABox key={i} c={T.red}><Ico d={IC.warn} size={17} stroke={T.red}/><div><div style={{fontWeight:700,color:T.red,fontSize:14}}>{a.titulo}</div><div style={{fontSize:13,color:T.sub,marginTop:2}}>{a.desc}</div></div></ABox>)}</>;

  const ListItem=({left,right,onEdit,onDelete,col,id,title})=>(
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 18px",marginBottom:9,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
      <div style={{flex:1,minWidth:0}}>{left}</div>
      <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        {right}
        <div style={{display:"flex",gap:6}}>
          {onEdit&&<button style={b("sec",true)} onClick={onEdit}><Ico d={IC.edit} size={13}/></button>}
          <button style={b("danger",true)} onClick={()=>askDel(col,id,title)}><Ico d={IC.trash} size={13}/></button>
        </div>
      </div>
    </div>
  );

  // ══ DASHBOARD ══
  if(tab==="dashboard") return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div><div style={{fontSize:22,fontWeight:800,color:T.white,letterSpacing:"-0.4px"}}>Dashboard</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>Golf Generation 2004 · {fmtKm(data.car.kmAtual)} km</div></div>
        <button style={b("sec")} onClick={()=>openModal("editcar")}><Ico d={IC.settings} size={14}/>Editar</button>
      </div>
      <CritAlerts/>
      <Grid cols={150}>
        {[{l:"Km Atual",v:fmtKm(data.car.kmAtual),s:"quilômetros",c:T.accent},{l:"Consumo Médio",v:`${fmt1(S.mediaKmL)} km/L`,s:"Fábrica: 9,0 km/L",c:T.green},{l:"Total Gasto",v:fmtR(S.total),s:"todos os registros",c:T.blue},{l:"Custo/km",v:S.custoPorKm?`R$ ${fmt2(S.custoPorKm)}`:"—",s:"por km rodado",c:T.purple},{l:"Km/mês médio",v:S.mediaKmMes?fmtKm(S.mediaKmMes):"—",s:"km por mês",c:T.teal},{l:"Projeção anual",v:S.projecaoAnual?fmtR(S.projecaoAnual):"—",s:"estimativa do ano",c:T.red}].map(k=>(
          <SCard T={T} key={k.l} c={k.c}><div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>{k.l}</div><div style={{fontSize:20,fontWeight:800,color:k.c,lineHeight:1.1,letterSpacing:"-0.5px"}}>{k.v}</div><div style={{fontSize:11,color:T.muted,marginTop:4}}>{k.s}</div></SCard>
        ))}
      </Grid>
      {/* Mês atual vs anterior */}
      {S.totalMesAtual>0&&<Card T={T} style={{marginBottom:16}}><CTitle T={T} icon={IC.calendar}>Este mês vs mês anterior</CTitle><div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}><div><div style={{fontSize:11,color:T.muted}}>Este mês</div><div style={{fontSize:24,fontWeight:800,color:T.white}}>{fmtR(S.totalMesAtual)}</div></div><div style={{display:"flex",alignItems:"center",gap:6,background:S.varMes<=0?T.green+"20":T.red+"20",borderRadius:8,padding:"6px 12px"}}><Ico d={IC.trend} size={14} stroke={S.varMes<=0?T.green:T.red}/><span style={{fontSize:14,fontWeight:700,color:S.varMes<=0?T.green:T.red}}>{S.varMes>0?"+":""}{S.varMes.toFixed(1)}%</span></div><div><div style={{fontSize:11,color:T.muted}}>Mês anterior</div><div style={{fontSize:18,fontWeight:700,color:T.sub}}>{fmtR(S.totalMesAnt)}</div></div></div></Card>}
      <Grid cols={280}>
        <Card T={T}><CTitle T={T} icon={IC.chart}>Distribuição de gastos</CTitle>{[{l:"Combustível",v:S.tAb,c:T.accent},{l:"Serviços",v:S.tServ,c:T.blue},{l:"Óleo",v:S.tOleo,c:T.green},{l:"Pneus",v:S.tPneu,c:T.purple},{l:"Documentos",v:S.tDocs,c:T.teal},{l:"Fixas",v:S.tFix,c:T.red}].map(it=><div key={it.l} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:2}}><span style={{color:T.sub}}>{it.l}</span><span style={{fontWeight:700,color:it.c}}>{fmtR(it.v)}</span></div><BTrack c={it.c} pct={S.total?(it.v/S.total)*100:0}/></div>)}</Card>
        <Card T={T}><CTitle T={T} icon={IC.person}>Combustível por pessoa</CTitle>{PESSOAS.map(p=>{const v=p==="Eliseu"?S.abE:S.abEl;return <div key={p} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:2}}><span style={{fontWeight:700,color:Pc[p]}}>{p}</span><span style={{fontWeight:800,color:T.white}}>{fmtR(v)}</span></div><BTrack c={Pc[p]} pct={S.tAb?(v/S.tAb)*100:0}/><div style={{fontSize:11,color:T.muted,marginTop:2}}>{S.tAb?((v/S.tAb)*100).toFixed(1):0}%</div></div>;})}
        <Div T={T}/><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}><span style={{color:T.muted}}>Preço médio/L</span><span style={{fontWeight:700}}>R$ {fmt2(S.mediaPreco)}</span></div><div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:T.muted}}>Próx. óleo</span><span style={{fontWeight:700,color:S.kmFaltOleo!=null&&S.kmFaltOleo<=0?T.red:T.white}}>{S.proxOleo?`${fmtKm(S.proxOleo)} km`:"—"}</span></div></Card>
      </Grid>
      {S.kmLArr.length>=2&&<Card T={T} style={{marginBottom:16}}><CTitle T={T} icon={IC.trend}>Consumo km/L por abastecimento</CTitle><div style={{display:"flex",gap:20,marginBottom:10,flexWrap:"wrap"}}><div><div style={{fontSize:11,color:T.muted}}>Média</div><div style={{fontSize:22,fontWeight:800,color:T.green}}>{fmt1(S.mediaKmL)}<span style={{fontSize:13,fontWeight:500}}> km/L</span></div></div><div><div style={{fontSize:11,color:T.muted}}>Melhor</div><div style={{fontSize:16,fontWeight:700,color:T.green}}>{fmt1(S.melhorKmL)}</div></div><div><div style={{fontSize:11,color:T.muted}}>Pior</div><div style={{fontSize:16,fontWeight:700,color:T.red}}>{fmt1(S.piorKmL)}</div></div></div><LineChart data={S.kmLArr} color={T.green} h={80} labels={S.kmLEntries.map(e=>e.l)} yLabel=" km/L"/></Card>}
      {S.mesLabels.length>1&&<Card T={T} style={{marginBottom:16}}><CTitle T={T} icon={IC.chart}>Gastos mensais</CTitle><StackedBarChart labels={S.mesLabels} series={S.stackSeries} h={110} T={T}/></Card>}
      <Card T={T}><CTitle T={T} icon={IC.calendar}>Últimos lançamentos</CTitle>
        {[...data.abastecimentos.slice(0,2).map(a=>({t:"Abastecimento",d:`${a.posto||"Posto"} · ${a.litros}L · ${a.pessoa||""}`,v:a.total,dt:a.data,c:T.accent})),...data.trocasOleo.slice(0,1).map(a=>({t:"Troca de óleo",d:a.tipo||"",v:a.valor,dt:a.data,c:T.green})),...data.servicos.slice(0,2).map(a=>({t:a.tipo,d:`${a.oficina||""} · ${a.status||""}`,v:a.valor,dt:a.data,c:T.blue}))].sort((a,b)=>(b.dt||"").localeCompare(a.dt||"")).slice(0,5).map((it,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:7,height:7,borderRadius:"50%",background:it.c,flexShrink:0}}/><div><div style={{fontSize:13,fontWeight:600}}>{it.t}</div><div style={{fontSize:11,color:T.muted}}>{it.dt} · {it.d}</div></div></div>
            <div style={{fontWeight:700,color:it.c,fontSize:14}}>{fmtR(it.v)}</div>
          </div>
        ))}
        {!data.abastecimentos.length&&!data.servicos.length&&!data.trocasOleo.length&&<div style={{textAlign:"center",padding:"28px 0",color:T.muted,fontSize:13}}>Nenhum lançamento ainda.</div>}
      </Card>
    </div>
  );

  // ══ FICHA ══
  if(tab==="specs") return <div><PageHdr T={T} title="Ficha Técnica" sub="Volkswagen Golf Generation 1.6 2004" action={<button style={b("sec")} onClick={()=>openModal("editcar")}><Ico d={IC.edit} size={14}/>Editar</button>}/><Grid cols={280}><Card T={T}><CTitle T={T} icon={IC.car}>Motor e Performance</CTitle>{[["Motor",GOLF_SPECS.motor],["Potência",GOLF_SPECS.potencia],["Torque",GOLF_SPECS.torque],["Câmbio",GOLF_SPECS.cambio],["Tração",GOLF_SPECS.tracao]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}><span style={{color:T.sub}}>{k}</span><span style={{fontWeight:600,color:T.white}}>{v}</span></div>)}</Card><Card T={T}><CTitle T={T} icon={IC.fuel}>Combustível e Tanque</CTitle>{[["Combustível",GOLF_SPECS.combustivel],["Tanque",GOLF_SPECS.tanque],["Consumo urbano",GOLF_SPECS.consumoUrbano],["Consumo estrada",GOLF_SPECS.consumoEstrada],["Pneus padrão",GOLF_SPECS.pneus]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}><span style={{color:T.sub}}>{k}</span><span style={{fontWeight:600,color:T.white}}>{v}</span></div>)}<ABox c={T.green}><Ico d={IC.fire} size={14} stroke={T.green}/><div style={{fontSize:12,color:T.sub}}>Seu consumo: <strong style={{color:T.green}}>{fmt1(S.mediaKmL)} km/L</strong> {S.mediaKmL?(S.mediaKmL>=8.5?"✅ dentro do esperado":"⚠️ abaixo do esperado"):"(sem dados)"}</div></ABox></Card><Card T={T}><CTitle T={T} icon={IC.shield}>Freios e Chassi</CTitle>{[["Freios",GOLF_SPECS.freios],["Suspensão diant.","McPherson c/ barra estab."],["Suspensão tras.","Semi-independente torsion beam"],["Direção","Hidráulica (HPower)"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}><span style={{color:T.sub}}>{k}</span><span style={{fontWeight:600,color:T.white,textAlign:"right",maxWidth:170}}>{v}</span></div>)}</Card><Card T={T}><CTitle T={T} icon={IC.settings}>Seus Dados</CTitle>{[["Placa",data.car.placa||"—"],["Cor",data.car.cor||"—"],["Km atual",`${fmtKm(data.car.kmAtual)} km`]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}><span style={{color:T.sub}}>{k}</span><span style={{fontWeight:600,color:T.accent}}>{v}</span></div>)}</Card></Grid></div>;

  // ══ REVISÕES ══
  if(tab==="revisoes") return <div><PageHdr T={T} title="Revisões Preventivas" sub="Intervalos recomendados · Golf 1.6 2004"/><ABox c={T.accent}><Ico d={IC.warn} size={17} stroke={T.accent}/><div style={{fontSize:13,color:T.sub}}>Km atual: <strong style={{color:T.white}}>{fmtKm(data.car.kmAtual)} km</strong></div></ABox>{MANUTENCAO.map((m,i)=><div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"13px 17px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><div style={{width:9,height:9,borderRadius:"50%",background:Uc[m.urgencia],marginTop:4,flexShrink:0}}/><div><div style={{fontWeight:700,fontSize:14,color:T.white,marginBottom:2}}>{m.item}</div><div style={{fontSize:12,color:T.muted}}>{m.intervalo}</div></div></div><Badge c={Uc[m.urgencia]}>{m.urgencia}</Badge></div>)}<ABox c={T.red}><Ico d={IC.warn} size={16} stroke={T.red}/><div style={{fontSize:12,color:T.sub}}><strong>⚠️ Correia dentada EA111:</strong> Pode quebrar sem aviso. Falha = motor destruído. Nunca negligencie!</div></ABox></div>;

  // ══ ABASTECIMENTO ══
  if(tab==="abast"){
    const ab=data.abastecimentos;
    const mesesFiltro=[...new Set(ab.map(a=>a.data?.slice(0,7)).filter(Boolean))].sort().reverse();
    return (
      <div>
        <PageHdr T={T} title="Abastecimento" sub={`${ab.length} registro${ab.length!==1?"s":""} · ${fmtR(S.tAb)}`} action={<button style={b("primary")} onClick={()=>openModal("abast")}><Ico d={IC.plus} size={15} stroke="#000"/>Novo</button>}/>
        {ab.length>0&&<>
          <Grid cols={140}>{[{l:"Consumo médio",v:`${fmt1(S.mediaKmL)} km/L`,s:`Melhor: ${fmt1(S.melhorKmL)} · Pior: ${fmt1(S.piorKmL)}`,c:T.green},{l:"Preço médio/L",v:`R$ ${fmt2(S.mediaPreco)}`,s:`Último: R$ ${fmt2(ab[0]?.valorLitro)}/L`,c:T.accent},{l:"Gasto médio",v:fmtR(S.mediaGasto),s:`Total: ${fmtR(S.tAb)}`,c:T.blue},{l:"Litros médio",v:`${fmt1(S.mediaLit)}L`,s:"Tanque: 55L",c:T.purple}].map(s=><SCard T={T} key={s.l} c={s.c}><div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>{s.l}</div><div style={{fontSize:18,fontWeight:800,color:s.c,lineHeight:1.1}}>{s.v}</div><div style={{fontSize:11,color:T.muted,marginTop:4}}>{s.s}</div></SCard>)}</Grid>
          <Grid cols={200}>{PESSOAS.map(p=>{const v=p==="Eliseu"?S.abE:S.abEl;return <SCard T={T} key={p} c={Pc[p]}><div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>{p}</div><div style={{fontSize:20,fontWeight:800,color:Pc[p]}}>{fmtR(v)}</div><div style={{fontSize:11,color:T.muted,marginTop:4}}>{S.tAb?((v/S.tAb)*100).toFixed(1):0}% do total</div></SCard>;})}
          </Grid>
          {S.kmLArr.length>=2&&<Card T={T} style={{marginBottom:14}}><CTitle T={T} icon={IC.trend}>Consumo km/L</CTitle><LineChart data={S.kmLArr} color={T.green} h={80} labels={S.kmLEntries.map(e=>e.l)} yLabel=" km/L"/></Card>}
          {S.precosLinha.length>=2&&<Card T={T} style={{marginBottom:14}}><CTitle T={T} icon={IC.trend}>Evolução do preço (R$/L)</CTitle><LineChart data={S.precosLinha.map(p=>p.v)} color={T.accent} h={70} labels={S.precosLinha.map(p=>p.l)} yLabel=" R$/L"/></Card>}
          {/* Gasolina vs Etanol separados */}
          {S.gasAb.length>0&&S.etaAb.length>0&&<Card T={T} style={{marginBottom:14}}><CTitle T={T} icon={IC.fuel}>Gasolina vs Etanol — seus dados reais</CTitle><Grid cols={200}><div style={{background:T.card2,borderRadius:11,padding:14}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Gasolina ({S.gasAb.length}x)</div><div style={{fontSize:18,fontWeight:800,color:T.accent}}>R$ {fmt2(S.gasAb.reduce((a,b)=>a+b.valorLitro,0)/S.gasAb.length)}/L</div><div style={{fontSize:12,color:T.muted,marginTop:3}}>Total: {fmtR(S.gasAb.reduce((a,b)=>a+(b.total||0),0))}</div></div><div style={{background:T.card2,borderRadius:11,padding:14}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:6}}>Etanol ({S.etaAb.length}x)</div><div style={{fontSize:18,fontWeight:800,color:T.green}}>R$ {fmt2(S.etaAb.reduce((a,b)=>a+b.valorLitro,0)/S.etaAb.length)}/L</div><div style={{fontSize:12,color:T.muted,marginTop:3}}>Total: {fmtR(S.etaAb.reduce((a,b)=>a+(b.total||0),0))}</div></div></Grid></Card>}
        </>}
        {/* FILTROS */}
        {ab.length>0&&<div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:1,minWidth:160}}>
            <Ico d={IC.search} size={14} stroke={T.muted} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}/>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Buscar posto..." style={{width:"100%",background:T.card,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 10px 8px 32px",color:T.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
          </div>
          <select value={filterPessoa} onChange={e=>setFilterPessoa(e.target.value)} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 10px",color:T.text,fontSize:13,outline:"none",fontFamily:"inherit"}}>
            <option value="Todos">Todos</option>{PESSOAS.map(p=><option key={p}>{p}</option>)}
          </select>
          <select value={filterMes} onChange={e=>setFilterMes(e.target.value)} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 10px",color:T.text,fontSize:13,outline:"none",fontFamily:"inherit"}}>
            <option value="Todos">Todo período</option>{mesesFiltro.map(m=>{const[y,mo]=m.split("-");return <option key={m} value={m}>{mesNome(mo)}/{y.slice(2)}</option>;})}
          </select>
          {(searchQ||filterPessoa!=="Todos"||filterMes!=="Todos")&&<button style={b("sec",true)} onClick={()=>{setSearchQ("");setFilterPessoa("Todos");setFilterMes("Todos");}}>Limpar</button>}
        </div>}
        {filteredAb.length===0&&ab.length>0?<div style={{textAlign:"center",padding:"40px 20px",color:T.muted,fontSize:13}}>Nenhum resultado para os filtros aplicados.</div>:null}
        {ab.length===0?<Empty T={T} icon={IC.fuel} text="Nenhum abastecimento registrado." onAdd={()=>openModal("abast")} btnLabel="Registrar"/>
        :filteredAb.map(a=>(
          <ListItem key={a.id} col="abastecimentos" id={a.id} title={a.posto||"Abastecimento"} onEdit={()=>openModal("abast",a)} onDelete={()=>askDel("abastecimentos",a.id,a.posto||"Abastecimento")}
            left={<><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap"}}><div style={{fontWeight:700,fontSize:14,color:T.white}}>{a.posto||"Posto não informado"}</div><Badge c={a.tipo==="Gasolina"?T.accent:a.tipo==="Etanol"?T.green:T.blue}>{a.tipo}</Badge>{a.pessoa&&<Badge c={Pc[a.pessoa]||T.muted}>{a.pessoa}</Badge>}</div><div style={{fontSize:12,color:T.muted}}>📅 {a.data} · 🛣 {fmtKm(a.km)} km · {a.litros}L · R$ {fmt2(a.valorLitro)}/L</div></>}
            right={<div style={{fontSize:17,fontWeight:800,color:T.accent}}>{fmtR(a.total)}</div>}
          />
        ))}
      </div>
    );
  }

  // ══ ÓLEO ══
  if(tab==="oleo") return (
    <div>
      <PageHdr T={T} title="Troca de Óleo" sub="Intervalo: 10.000 km ou 12 meses" action={<button style={b("primary")} onClick={()=>openModal("oleo")}><Ico d={IC.plus} size={15} stroke="#000"/>Registrar</button>}/>
      {S.kmFaltOleo!==null&&<ABox c={S.kmFaltOleo<=0?T.red:S.kmFaltOleo<=1000?T.accent:T.green}><Ico d={IC.oil} size={15} stroke={S.kmFaltOleo<=0?T.red:S.kmFaltOleo<=1000?T.accent:T.green}/><div style={{fontSize:13,color:T.sub}}>{S.kmFaltOleo<=0?<><strong style={{color:T.red}}>Vencida!</strong> {Math.abs(S.kmFaltOleo).toLocaleString()} km atrasado.</>:<><strong style={{color:T.white}}>Próxima em {fmtKm(S.proxOleo)} km.</strong> Faltam {S.kmFaltOleo.toLocaleString()} km.</>}</div></ABox>}
      {data.trocasOleo.length===0?<Empty T={T} icon={IC.oil} text="Nenhuma troca registrada." onAdd={()=>openModal("oleo")} btnLabel="Registrar Troca"/>
      :data.trocasOleo.map(t=><ListItem key={t.id} col="trocasOleo" id={t.id} title={t.tipo||"Troca de óleo"} onEdit={()=>openModal("oleo",t)}
        left={<><div style={{fontWeight:700,fontSize:14,color:T.white,marginBottom:4}}>{t.tipo||"Troca de óleo"}</div><div style={{fontSize:12,color:T.muted}}>📅 {t.data} · 🛣 {fmtKm(t.km)} km · Próxima: {fmtKm(t.proxKm)} km</div>{t.obs&&<div style={{fontSize:12,color:T.muted,marginTop:3}}>💬 {t.obs}</div>}</>}
        right={<div style={{fontSize:17,fontWeight:800,color:T.accent}}>{fmtR(t.valor)}</div>}/>)}
    </div>
  );

  // ══ SERVIÇOS ══
  if(tab==="servicos") return (
    <div>
      <PageHdr T={T} title="Serviços" sub={`Total: ${fmtR(S.tServ)}`} action={<button style={b("primary")} onClick={()=>openModal("servico")}><Ico d={IC.plus} size={15} stroke="#000"/>Novo</button>}/>
      {data.servicos.length===0?<Empty T={T} icon={IC.wrench} text="Nenhum serviço registrado." onAdd={()=>openModal("servico")} btnLabel="Novo Serviço"/>
      :data.servicos.map(sv=><ListItem key={sv.id} col="servicos" id={sv.id} title={sv.tipo} onEdit={()=>openModal("servico",sv)}
        left={<><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}><div style={{fontWeight:700,fontSize:14,color:T.white}}>{sv.tipo}</div><Badge c={sv.status==="Concluído"?T.green:sv.status==="Agendado"?T.accent:T.blue}>{sv.status}</Badge></div><div style={{fontSize:12,color:T.muted}}>📅 {sv.data} · 🛣 {fmtKm(sv.km)} km · 🏪 {sv.oficina}</div>{sv.obs&&<div style={{fontSize:12,color:T.muted,marginTop:3}}>💬 {sv.obs}</div>}</>}
        right={<div style={{fontSize:17,fontWeight:800,color:T.accent}}>{fmtR(sv.valor)}</div>}/>)}
    </div>
  );

  // ══ PNEUS ══
  if(tab==="pneus") return (
    <div>
      <PageHdr T={T} title="Pneus" sub="Padrão: 195/65 R15 · Alinhar a cada 10.000 km" action={<button style={b("primary")} onClick={()=>openModal("pneu")}><Ico d={IC.plus} size={15} stroke="#000"/>Registrar</button>}/>
      {data.pneus.length===0?<Empty T={T} icon={IC.tire} text="Nenhum registro de pneu." onAdd={()=>openModal("pneu")} btnLabel="Registrar Pneu"/>
      :data.pneus.map(p=><ListItem key={p.id} col="pneus" id={p.id} title={`${p.marca} ${p.modelo}`} onEdit={()=>openModal("pneu",p)}
        left={<><div style={{fontWeight:700,fontSize:14,color:T.white,marginBottom:4}}>{p.marca} {p.modelo}</div><div style={{fontSize:12,color:T.muted}}>📅 {p.data} · 🛣 {fmtKm(p.km)} km · {p.posicao}</div>{p.proxKm&&<div style={{fontSize:12,color:T.green,marginTop:3}}>Vida estimada até {fmtKm(p.proxKm)} km</div>}</>}
        right={<div style={{fontSize:17,fontWeight:800,color:T.accent}}>{fmtR(p.valor)}</div>}/>)}
    </div>
  );

  // ══ DOCS ══
  if(tab==="docs") return (
    <div>
      <PageHdr T={T} title="Documentos e Taxas" sub={`IPVA · Seguro · Licenciamento · ${fmtR(S.tDocs)}`} action={<button style={b("primary")} onClick={()=>openModal("doc")}><Ico d={IC.plus} size={15} stroke="#000"/>Adicionar</button>}/>
      {data.documentos.length===0?<Empty T={T} icon={IC.doc} text="Nenhum documento ou taxa." onAdd={()=>openModal("doc")} btnLabel="Adicionar"/>
      :data.documentos.map(d=><ListItem key={d.id} col="documentos" id={d.id} title={d.tipo} onEdit={()=>openModal("doc",d)}
        left={<><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}><div style={{fontWeight:700,fontSize:14,color:T.white}}>{d.tipo}</div><Badge c={d.pago?T.green:T.red}>{d.pago?"Pago":"Pendente"}</Badge></div><div style={{fontSize:12,color:T.muted}}>📅 Vencimento: {d.vencimento} · Ano: {d.anoRef||"—"}</div>{d.obs&&<div style={{fontSize:12,color:T.muted,marginTop:3}}>💬 {d.obs}</div>}</>}
        right={<div style={{fontSize:17,fontWeight:800,color:d.pago?T.green:T.red}}>{fmtR(d.valor)}</div>}/>)}
    </div>
  );

  // ══ FIXAS ══
  if(tab==="fixas") return (
    <div>
      <PageHdr T={T} title="Despesas Fixas" sub={`Seguro · Rastreador · Garagem · ${fmtR(S.tFix)}`} action={<button style={b("primary")} onClick={()=>openModal("fixa")}><Ico d={IC.plus} size={15} stroke="#000"/>Adicionar</button>}/>
      {data.despesasFixas.length===0?<Empty T={T} icon={IC.tag} text="Nenhuma despesa fixa." onAdd={()=>openModal("fixa")} btnLabel="Adicionar Despesa"/>
      :data.despesasFixas.map(d=><ListItem key={d.id} col="despesasFixas" id={d.id} title={d.nome} onEdit={()=>openModal("fixa",d)}
        left={<><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}><div style={{fontWeight:700,fontSize:14,color:T.white}}>{d.nome}</div><Badge c={T.purple}>{d.periodicidade||"mensal"}</Badge></div><div style={{fontSize:12,color:T.muted}}>{d.obs||""}</div></>}
        right={<div style={{fontSize:17,fontWeight:800,color:T.purple}}>{fmtR(d.valor)}</div>}/>)}
    </div>
  );

  // ══ RELATÓRIO GERAL ══
  if(tab==="gastos") return (
    <div>
      <PageHdr T={T} title="Relatório Financeiro" sub="Controle completo de todos os gastos"/>
      <SCard T={T} c={T.accent} style={{marginBottom:18}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>Total Geral Investido</div><div style={{fontSize:32,fontWeight:800,color:T.white,letterSpacing:"-1px"}}>{fmtR(S.total)}</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>{S.custoPorKm?`R$ ${fmt2(S.custoPorKm)}/km · ${fmtKm(S.kmRodados)} km registrados`:""}</div></div><Ico d={IC.dollar} size={44} stroke={T.accent+"40"}/></div></SCard>
      {S.projecaoAnual&&<div style={{background:T.blue+"12",border:`1px solid ${T.blue}30`,borderRadius:12,padding:"12px 16px",display:"flex",gap:10,marginBottom:16,alignItems:"center"}}><Ico d={IC.trend} size={16} stroke={T.blue}/><div style={{fontSize:13,color:T.sub}}>Projeção para 12 meses: <strong style={{color:T.white}}>{fmtR(S.projecaoAnual)}</strong> com base nos últimos {S.meses.length} meses.</div></div>}
      <Grid cols={260}>{[{l:"Combustível",v:S.tAb,c:T.accent,icon:IC.fuel,n:data.abastecimentos.length},{l:"Serviços",v:S.tServ,c:T.blue,icon:IC.wrench,n:data.servicos.length},{l:"Troca de Óleo",v:S.tOleo,c:T.green,icon:IC.oil,n:data.trocasOleo.length},{l:"Pneus",v:S.tPneu,c:T.purple,icon:IC.tire,n:data.pneus.length},{l:"Documentos",v:S.tDocs,c:T.teal,icon:IC.doc,n:data.documentos.length},{l:"Despesas Fixas",v:S.tFix,c:T.red,icon:IC.tag,n:data.despesasFixas.length}].map(it=><SCard T={T} key={it.l} c={it.c}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>{it.l}</div><div style={{fontSize:22,fontWeight:800,color:it.c}}>{fmtR(it.v)}</div><div style={{fontSize:11,color:T.muted,marginTop:3}}>{it.n} registros</div></div><Ico d={it.icon} size={20} stroke={it.c+"60"}/></div><BTrack c={it.c} pct={S.total?(it.v/S.total)*100:0}/><div style={{fontSize:10,color:T.muted,marginTop:3}}>{S.total?((it.v/S.total)*100).toFixed(1):0}% do total</div></SCard>)}</Grid>
      {S.mesLabels.length>1&&<Card T={T} style={{marginBottom:16}}><CTitle T={T} icon={IC.chart}>Gastos mensais por categoria</CTitle><StackedBarChart labels={S.mesLabels} series={S.stackSeries} h={130} T={T}/></Card>}
      <Card T={T}><CTitle T={T} icon={IC.person}>Combustível por pessoa</CTitle><Grid cols={200}>{PESSOAS.map(p=>{const v=p==="Eliseu"?S.abE:S.abEl;const n=data.abastecimentos.filter(a=>a.pessoa===p).length;return <div key={p} style={{background:T.card2,borderRadius:11,padding:14,border:`1px solid ${T.border}`}}><div style={{fontWeight:700,color:Pc[p],marginBottom:7,fontSize:14}}>{p}</div><div style={{fontSize:20,fontWeight:800,color:T.white}}>{fmtR(v)}</div><div style={{fontSize:11,color:T.muted,marginTop:3}}>{n} abastecimentos</div><BTrack c={Pc[p]} pct={S.tAb?(v/S.tAb)*100:0}/><div style={{fontSize:10,color:T.muted,marginTop:3}}>{S.tAb?((v/S.tAb)*100).toFixed(1):0}% do combustível</div></div>;})}
      </Grid></Card>
    </div>
  );

  // ══ RELATÓRIO MENSAL ══
  if(tab==="mensal"){
    const hoje=new Date();
    const mesAtual=`${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}`;
    
    const mesData=S.mesMap[mesSel]||{ab:0,oleo:0,serv:0,pneu:0,doc:0};
    const totalMes=Object.values(mesData).reduce((a,b)=>a+b,0);
    const abMes=data.abastecimentos.filter(a=>a.data?.slice(0,7)===mesSel);
    const servMes=data.servicos.filter(s=>s.data?.slice(0,7)===mesSel);
    const oleoMes=data.trocasOleo.filter(s=>s.data?.slice(0,7)===mesSel);
    const kmMes=abMes.length>=2?Math.max(...abMes.map(a=>a.km||0))-Math.min(...abMes.map(a=>a.km||0)):0;
    const litrosMes=abMes.reduce((a,b)=>a+(b.litros||0),0);
    const abEliseuMes=abMes.filter(a=>a.pessoa==="Eliseu").reduce((a,b)=>a+(b.total||0),0);
    const abEliasMes=abMes.filter(a=>a.pessoa==="Elias").reduce((a,b)=>a+(b.total||0),0);
    return (
      <div>
        <PageHdr T={T} title="Relatório Mensal" sub="Resumo detalhado por mês"/>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
          <select value={mesSel} onChange={e=>setMesSel(e.target.value)} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.white,fontSize:14,fontWeight:700,outline:"none",fontFamily:"inherit"}}>
            {[...new Set([mesAtual,...Object.keys(S.mesMap)])].sort().reverse().map(m=>{const[y,mo]=m.split("-");return <option key={m} value={m}>{mesNome(mo)} {y}</option>;})}
          </select>
          {totalMes===0&&<span style={{fontSize:13,color:T.muted}}>Nenhum gasto registrado neste mês.</span>}
        </div>
        {totalMes>0&&<>
          <Grid cols={150}>
            {[{l:"Total do Mês",v:fmtR(totalMes),c:T.accent},{l:"Km Rodados",v:kmMes?fmtKm(kmMes)+" km":"—",c:T.blue},{l:"Litros",v:litrosMes?`${litrosMes.toFixed(1)}L`:"—",c:T.green},{l:"Abastecimentos",v:String(abMes.length),c:T.purple}].map(k=><SCard T={T} key={k.l} c={k.c}><div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>{k.l}</div><div style={{fontSize:20,fontWeight:800,color:k.c}}>{k.v}</div></SCard>)}
          </Grid>
          <Grid cols={280}>
            <Card T={T}><CTitle T={T} icon={IC.chart}>Gastos do mês</CTitle>{[{l:"Combustível",v:mesData.ab,c:T.accent},{l:"Óleo",v:mesData.oleo,c:T.green},{l:"Serviços",v:mesData.serv,c:T.blue},{l:"Pneus",v:mesData.pneu,c:T.purple},{l:"Documentos",v:mesData.doc,c:T.teal}].filter(it=>it.v>0).map(it=><div key={it.l} style={{marginBottom:9}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:2}}><span style={{color:T.sub}}>{it.l}</span><span style={{fontWeight:700,color:it.c}}>{fmtR(it.v)}</span></div><BTrack c={it.c} pct={totalMes?(it.v/totalMes)*100:0}/></div>)}</Card>
            <Card T={T}><CTitle T={T} icon={IC.person}>Combustível por pessoa</CTitle>{[[{l:"Eliseu",v:abEliseuMes,c:Pc.Eliseu},{l:"Elias",v:abEliasMes,c:Pc.Elias}].map(p=><div key={p.l} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:2}}><span style={{fontWeight:700,color:p.c}}>{p.l}</span><span style={{fontWeight:800,color:T.white}}>{fmtR(p.v)}</span></div><BTrack c={p.c} pct={mesData.ab?(p.v/mesData.ab)*100:0}/></div>)]}</Card>
          </Grid>
          {abMes.length>0&&<Card T={T} style={{marginBottom:14}}><CTitle T={T} icon={IC.fuel}>Abastecimentos do mês</CTitle>{abMes.map((a,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}><div><span style={{fontWeight:600}}>{a.posto||"Posto"}</span><span style={{color:T.muted,marginLeft:8}}>{a.data} · {a.litros}L · {a.pessoa||""}</span></div><span style={{fontWeight:700,color:T.accent}}>{fmtR(a.total)}</span></div>)}</Card>}
          {(servMes.length>0||oleoMes.length>0)&&<Card T={T}><CTitle T={T} icon={IC.wrench}>Manutenção do mês</CTitle>{[...oleoMes.map(s=>({...s,cat:"Óleo"})),...servMes].map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}><div><span style={{fontWeight:600}}>{s.tipo||s.cat}</span><span style={{color:T.muted,marginLeft:8}}>{s.data} · {s.oficina||""}</span></div><span style={{fontWeight:700,color:T.accent}}>{fmtR(s.valor)}</span></div>)}</Card>}
        </>}
      </div>
    );
  }

  // ══ CALCULADORA ══
  if(tab==="calc"){
    const mKmL=S.mediaKmL||9.0,ratio=0.70;
    const cG=calcGas?+(+calcGas/mKmL).toFixed(3):null;
    const cE=calcEta?+(+calcEta/(mKmL*ratio)).toFixed(3):null;
    const melhor=cG&&cE?(cE<cG?"etanol":"gasolina"):null;
    const be=calcGas?+(+calcGas*ratio).toFixed(2):null;
    const kPA=S.mediaLit&&S.mediaKmL?S.mediaLit*S.mediaKmL:null;
    const ultKm=data.abastecimentos[0]?.km;
    const prevKm=ultKm&&kPA?Math.round(ultKm+kPA):null;
    return (
      <div>
        <PageHdr T={T} title="Calculadora" sub="Gasolina vs Etanol · Previsão de abastecimento"/>
        <Card T={T} style={{marginBottom:16}}>
          <CTitle T={T} icon={IC.calc}>Qual compensa hoje?</CTitle>
          <div style={{fontSize:13,color:T.sub,marginBottom:14}}>Consumo registrado: <strong style={{color:T.white}}>{fmt1(mKmL)} km/L</strong> (gasolina). Etanol rende ~{Math.round(ratio*100)}% no 1.6.</div>
          <Grid cols={200}><div><label style={{fontSize:12,fontWeight:600,color:T.sub,marginBottom:5,display:"block"}}>Gasolina (R$/L)</label><input type="number" step="0.01" placeholder="Ex: 6.29" value={calcGas} onChange={e=>setCalcGas(e.target.value)} style={{width:"100%",background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 13px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/></div><div><label style={{fontSize:12,fontWeight:600,color:T.sub,marginBottom:5,display:"block"}}>Etanol (R$/L)</label><input type="number" step="0.01" placeholder="Ex: 4.19" value={calcEta} onChange={e=>setCalcEta(e.target.value)} style={{width:"100%",background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 13px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/></div></Grid>
          {(cG||cE)&&<><Grid cols={200}><div style={{background:T.card2,borderRadius:11,padding:14,border:`2px solid ${melhor==="gasolina"?T.accent:T.border}`}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:5}}>Gasolina</div><div style={{fontSize:22,fontWeight:800,color:T.accent}}>R$ {cG}<span style={{fontSize:12}}>/km</span></div><div style={{fontSize:11,color:T.muted,marginTop:3}}>{calcGas} R$/L ÷ {fmt1(mKmL)} km/L</div>{melhor==="gasolina"&&<div style={{marginTop:7}}><Badge c={T.accent}>✅ Compensa mais</Badge></div>}</div><div style={{background:T.card2,borderRadius:11,padding:14,border:`2px solid ${melhor==="etanol"?T.green:T.border}`}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:5}}>Etanol</div><div style={{fontSize:22,fontWeight:800,color:T.green}}>R$ {cE}<span style={{fontSize:12}}>/km</span></div><div style={{fontSize:11,color:T.muted,marginTop:3}}>{calcEta} R$/L ÷ {fmt1(mKmL*ratio)} km/L</div>{melhor==="etanol"&&<div style={{marginTop:7}}><Badge c={T.green}>✅ Compensa mais</Badge></div>}</div></Grid>{be&&<ABox c={T.blue}><Ico d={IC.warn} size={15} stroke={T.blue}/><div style={{fontSize:13,color:T.sub}}>Ponto de equilíbrio: etanol compensa se custar menos que <strong style={{color:T.white}}>R$ {be}/L</strong> (70% da gasolina).</div></ABox>}</>}
        </Card>
        <Card T={T}><CTitle T={T} icon={IC.fuel}>Previsão do próximo abastecimento</CTitle>
          {kPA?<><div style={{fontSize:13,color:T.sub,marginBottom:14}}>Média de <strong style={{color:T.white}}>{fmt1(S.mediaLit)}L</strong> × <strong style={{color:T.white}}>{fmt1(S.mediaKmL)} km/L</strong> = <strong style={{color:T.accent}}>~{Math.round(kPA).toLocaleString()} km</strong> por abastecimento.</div><Grid cols={200}><div style={{background:T.card2,borderRadius:11,padding:14}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Último abastecimento</div><div style={{fontSize:20,fontWeight:800,color:T.white}}>{fmtKm(ultKm)} km</div></div><div style={{background:T.card2,borderRadius:11,padding:14,border:`1px solid ${T.accent}40`}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Próximo abastecimento</div><div style={{fontSize:20,fontWeight:800,color:T.accent}}>{fmtKm(prevKm)} km</div><div style={{fontSize:11,color:T.muted,marginTop:3}}>Faltam ~{Math.max(0,(prevKm||0)-data.car.kmAtual).toLocaleString()} km</div></div></Grid></>:<div style={{textAlign:"center",padding:"28px 0",color:T.muted,fontSize:13}}>Registre pelo menos 2 abastecimentos com km para calcular.</div>}</Card>
      </div>
    );
  }

  // ══ POSTOS ══
  if(tab==="postos") return (
    <div>
      <PageHdr T={T} title="Ranking de Postos" sub="Baseado no seu histórico"/>
      {S.rankPostos.length===0?<Empty T={T} icon={IC.posto} text="Nenhum posto registrado." onAdd={()=>setTab("abast")} btnLabel="Ir para Abastecimento"/>
      :S.rankPostos.map((p,i)=>(
        <div key={p.nome} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 18px",marginBottom:9,display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:i===0?T.accent+"22":T.card2,border:`2px solid ${i===0?T.accent:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:i===0?T.accent:T.muted,flexShrink:0}}>{i+1}</div>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:T.white}}>{p.nome}</div><div style={{fontSize:12,color:T.muted}}>{p.count} abastecimento{p.count!==1?"s":""} · Total: {fmtR(p.total)}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:19,fontWeight:800,color:i===0?T.green:T.white}}>R$ {fmt2(p.mediaPreco)}/L</div>{i===0&&<Badge c={T.green}>Mais barato</Badge>}</div>
        </div>
      ))}
    </div>
  );

  // ══ ALERTAS ══
  if(tab==="alertas") return (
    <div>
      <PageHdr T={T} title="Alertas" sub={`${alertCount} ativo${alertCount!==1?"s":""}`} action={<button style={b("primary")} onClick={()=>openModal("alerta")}><Ico d={IC.plus} size={15} stroke="#000"/>Novo</button>}/>
      {smartAlerts.length>0&&<><div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>Automáticos ({smartAlerts.length})</div>{smartAlerts.map(a=><ABox key={a.id} c={Uc[a.urgencia]}><Ico d={IC.warn} size={17} stroke={Uc[a.urgencia]}/><div style={{flex:1}}><div style={{fontWeight:700,color:Uc[a.urgencia],fontSize:14}}>{a.titulo}</div><div style={{fontSize:13,color:T.sub,marginTop:2}}>{a.desc}</div><div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}><Badge c={Uc[a.urgencia]}>{a.urgencia}</Badge><span style={{fontSize:11,color:T.muted}}>automático · {a.cat==="doc"?"📄 documento":a.cat==="revisao"?"🔧 revisão":"🛣 km"}</span></div></div></ABox>)}<Div T={T}/></>}
      {data.alertas.length>0&&<div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>Manuais</div>}
      {data.alertas.length===0&&smartAlerts.length===0?<Empty T={T} icon={IC.bell} text="Nenhum alerta." onAdd={()=>openModal("alerta")} btnLabel="Novo Alerta"/>
      :data.alertas.map(a=><ABox key={a.id} c={Uc[a.urgencia]}><Ico d={IC.warn} size={17} stroke={Uc[a.urgencia]}/><div style={{flex:1,opacity:a.ativo?1:.45}}><div style={{fontWeight:700,color:Uc[a.urgencia],fontSize:14}}>{a.titulo}</div><div style={{fontSize:13,color:T.sub,marginTop:2}}>{a.desc}</div><div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}><Badge c={Uc[a.urgencia]}>{a.urgencia}</Badge>{a.vencimento&&<span style={{fontSize:11,color:T.muted}}>📅 {a.vencimento}</span>}</div></div><div style={{display:"flex",gap:6,flexShrink:0}}><button style={b("sec",true)} onClick={()=>setData(d=>({...d,alertas:d.alertas.map(al=>al.id===a.id?{...al,ativo:!al.ativo}:al)}))}><Ico d={IC.check} size={13}/></button><button style={b("danger",true)} onClick={()=>askDel("alertas",a.id,a.titulo)}><Ico d={IC.trash} size={13}/></button></div></ABox>)}
    </div>
  );

  return <div style={{padding:"60px 20px",textAlign:"center",color:T.muted}}>Selecione uma seção no menu.</div>;
}
