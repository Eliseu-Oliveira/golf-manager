import { useState, useMemo, useEffect, useCallback, useRef } from "react";

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
  back:    "M19 12H5M12 5l-7 7 7 7",
};

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  bg:"#090B10", surf:"#0E1118", card:"#141720", card2:"#1A1E2C",
  border:"#222638", border2:"#2C3247",
  accent:"#E8A020", red:"#E05555", green:"#2ECC8E",
  blue:"#4A90E2", purple:"#9B6DFF", teal:"#1CB8A0", orange:"#E87820",
  muted:"#4E566E", sub:"#7B88A0", text:"#D8DEF0", white:"#EEF2FF",
};
const PESSOAS = ["Eliseu","Elias"];
const PC = { Eliseu:T.accent, Elias:T.blue };
const fmtR  = v=>`R$ ${(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}`;
const fmt1  = v=>v!=null?Number(v).toFixed(1):"—";
const fmt2  = v=>v!=null?Number(v).toFixed(2):"—";
const fmtKm = v=>v?Number(v).toLocaleString("pt-BR"):"0";
const URGC  = { alta:T.red, media:T.accent, baixa:T.blue };
const SK    = "golf_v3";
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
};
const memStore = {};
function loadData(){ try{ const r=localStorage.getItem(SK); if(r) return {...INITIAL,...JSON.parse(r)}; }catch(e){ try{ const r=memStore[SK]; if(r) return {...INITIAL,...JSON.parse(r)}; }catch(e2){} } return INITIAL; }
function saveData(d){ const s=JSON.stringify(d); try{ localStorage.setItem(SK,s); }catch(e){ memStore[SK]=s; } }

// ─── CHART COMPONENTS ────────────────────────────────────────────────────────
function LineChart({ data, color, h=80, labels, yLabel="" }) {
  const ref = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  if (!data || data.length < 2) return <div style={{color:T.muted,fontSize:12,textAlign:"center",padding:"20px 0"}}>Registre mais abastecimentos para ver o gráfico.</div>;
  const W=560, H=h, PAD=8;
  const min=Math.min(...data), max=Math.max(...data), range=max-min||1;
  const pts=data.map((v,i)=>({ x:(i/(data.length-1))*(W-PAD*2)+PAD, y:H-((v-min)/range)*(H-PAD*2)-PAD, v, label:labels?.[i]||"" }));
  const polyline=pts.map(p=>`${p.x},${p.y}`).join(" ");
  const area=`${pts[0].x},${H} ${polyline} ${pts[pts.length-1].x},${H}`;
  return (
    <div ref={ref} style={{position:"relative",width:"100%",overflowX:"auto"}}>
      <svg width={W} height={H+20} viewBox={`0 0 ${W} ${H+20}`} style={{display:"block",maxWidth:"100%"}}
        onMouseLeave={()=>setTooltip(null)}>
        <defs>
          <linearGradient id={`g_${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* grid lines */}
        {[0,.25,.5,.75,1].map(p=>{
          const y=H-p*(H-PAD*2)-PAD;
          const val=(min+p*range).toFixed(1);
          return <g key={p}>
            <line x1={PAD} y1={y} x2={W-PAD} y2={y} stroke={T.border} strokeWidth={1} strokeDasharray="4,4"/>
            <text x={PAD} y={y-3} fontSize={9} fill={T.muted}>{val}{yLabel}</text>
          </g>;
        })}
        {/* area fill */}
        <polygon points={area} fill={`url(#g_${color.replace("#","")})`}/>
        {/* line */}
        <polyline points={polyline} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
        {/* dots + hover */}
        {pts.map((p,i)=>(
          <g key={i} onMouseEnter={()=>setTooltip({x:p.x,y:p.y,v:p.v,label:p.label})}>
            <circle cx={p.x} cy={p.y} r={10} fill="transparent"/>
            <circle cx={p.x} cy={p.y} r={4} fill={color} stroke={T.card} strokeWidth={2}/>
          </g>
        ))}
        {/* x labels (every N) */}
        {pts.map((p,i)=>{
          const skip=Math.ceil(pts.length/8);
          if(i%skip!==0&&i!==pts.length-1) return null;
          return <text key={i} x={p.x} y={H+16} fontSize={9} fill={T.muted} textAnchor="middle">{p.label}</text>;
        })}
        {/* tooltip */}
        {tooltip&&(
          <g>
            <rect x={Math.min(tooltip.x+8,W-90)} y={tooltip.y-28} width={82} height={22} rx={6} fill={T.card2} stroke={T.border} strokeWidth={1}/>
            <text x={Math.min(tooltip.x+49,W-49)} y={tooltip.y-13} fontSize={11} fill={T.white} textAnchor="middle" fontWeight="700">{tooltip.label}: {tooltip.v.toFixed(2)}{yLabel}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

function StackedBarChart({ labels, series, h=130 }) {
  const [tooltip,setTooltip] = useState(null);
  if(!labels||!labels.length) return null;
  const totals=labels.map((_,i)=>series.reduce((a,s)=>a+(s.values[i]||0),0));
  const max=Math.max(...totals)||1;
  const BW=Math.max(18,Math.min(40,Math.floor(480/labels.length)-6));
  return (
    <div style={{overflowX:"auto"}}>
      <div style={{display:"flex",alignItems:"flex-end",gap:6,height:h+40,minWidth:labels.length*26,position:"relative"}}
        onMouseLeave={()=>setTooltip(null)}>
        {labels.map((lbl,i)=>{
          const total=totals[i];
          let bottom=0;
          const bars=series.map(s=>{
            const val=s.values[i]||0;
            const pct=max?val/max:0;
            const bar={val,pct,color:s.color,label:s.label,bottom};
            bottom+=pct;
            return bar;
          }).filter(b=>b.val>0);
          return (
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,minWidth:BW}}>
              <div style={{fontSize:10,color:T.muted,marginBottom:3,height:14,display:"flex",alignItems:"center"}}>{total>0?`R$${Math.round(total)}`:""}</div>
              <div style={{width:"100%",maxWidth:BW,height:h,position:"relative",cursor:"pointer"}}
                onMouseEnter={e=>setTooltip({i,lbl,total,bars,x:e.clientX,y:e.clientY})}>
                {bars.map((b,j)=>(
                  <div key={j} style={{position:"absolute",bottom:`${b.bottom*100}%`,left:0,right:0,height:`${b.pct*100}%`,background:b.color,borderRadius:j===bars.length-1?"4px 4px 0 0":"0",opacity:.85,transition:"height .4s"}}/>
                ))}
              </div>
              <div style={{fontSize:9,color:T.muted,marginTop:3,textAlign:"center"}}>{lbl}</div>
            </div>
          );
        })}
        {tooltip&&(
          <div style={{position:"fixed",top:tooltip.y-120,left:tooltip.x-60,background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",zIndex:999,minWidth:140,pointerEvents:"none",boxShadow:"0 8px 32px rgba(0,0,0,.6)"}}>
            <div style={{fontWeight:700,fontSize:12,color:T.white,marginBottom:6}}>{tooltip.lbl}</div>
            {tooltip.bars.map((b,j)=>(
              <div key={j} style={{display:"flex",justifyContent:"space-between",gap:16,fontSize:11,color:T.sub}}>
                <span style={{color:b.color}}>■ {b.label}</span>
                <span style={{fontWeight:600,color:T.text}}>{fmtR(b.val)}</span>
              </div>
            ))}
            <div style={{borderTop:`1px solid ${T.border}`,marginTop:6,paddingTop:6,fontSize:12,fontWeight:700,color:T.white,display:"flex",justifyContent:"space-between"}}>
              <span>Total</span><span>{fmtR(tooltip.total)}</span>
            </div>
          </div>
        )}
      </div>
      {/* legend */}
      <div style={{display:"flex",flexWrap:"wrap",gap:"8px 16px",marginTop:4}}>
        {series.map(s=><div key={s.label} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.sub}}>
          <div style={{width:8,height:8,borderRadius:2,background:s.color}}/>{s.label}
        </div>)}
      </div>
    </div>
  );
}

function MiniSparkline({ data, color, h=36, w=100 }) {
  if (!data||data.length<2) return null;
  const min=Math.min(...data),max=Math.max(...data),range=max-min||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/range)*(h-6)-3}`).join(" ");
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow:"visible"}}>
    <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    {data.map((v,i)=>{const x=(i/(data.length-1))*w,y=h-((v-min)/range)*(h-6)-3;return <circle key={i} cx={x} cy={y} r={2.5} fill={color}/>;})}</svg>;
}

// ─── SMALL UI COMPONENTS ─────────────────────────────────────────────────────
function Field({label,type="text",value,onChange,placeholder,step,readOnly}){
  return <div style={{marginBottom:13}}>
    <label style={{fontSize:12,fontWeight:600,color:T.sub,marginBottom:5,display:"block"}}>{label}</label>
    <input type={type} value={value} placeholder={placeholder} step={step} readOnly={readOnly} onChange={e=>onChange&&onChange(e.target.value)}
      style={{width:"100%",background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 13px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",opacity:readOnly?.55:1}}/>
  </div>;
}
function Sel({label,value,onChange,children}){
  return <div style={{marginBottom:13}}>
    <label style={{fontSize:12,fontWeight:600,color:T.sub,marginBottom:5,display:"block"}}>{label}</label>
    <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 13px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}>{children}</select>
  </div>;
}
function Empty({icon,text,onAdd,btnLabel}){
  return <div style={{textAlign:"center",padding:"56px 20px",color:T.muted}}>
    <Ico d={icon} size={44} stroke={T.border}/>
    <div style={{marginTop:14,fontSize:14}}>{text}</div>
    {onAdd&&<button style={{...btn("primary"),marginTop:16}} onClick={onAdd}><Ico d={IC.plus} size={15} stroke="#000"/>{btnLabel}</button>}
  </div>;
}
function MWrap({onClose,children}){
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:24,width:"100%",maxWidth:490,maxHeight:"90vh",overflowY:"auto"}}>{children}</div>
  </div>;
}
function MHead({title,onClose}){
  return <div style={{fontSize:16,fontWeight:800,color:T.white,marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    {title}<button style={{background:"none",border:"none",cursor:"pointer",color:T.muted}} onClick={onClose}><Ico d={IC.x} size={20}/></button></div>;
}
const btn = (v="primary",sm)=>({display:"inline-flex",alignItems:"center",gap:6,borderRadius:10,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600,transition:"opacity .15s",padding:sm?"7px 13px":"10px 18px",fontSize:sm?12:13,background:v==="primary"?T.accent:v==="danger"?T.red:T.card2,color:v==="primary"?"#000":v==="danger"?"#fff":T.text,border:v==="ghost"||v==="sec"?`1px solid ${T.border}`:"none"});
function SaveBtn({onClick,label="Salvar"}){return <button style={{...btn("primary"),width:"100%",justifyContent:"center",marginTop:8}} onClick={onClick}><Ico d={IC.check} size={15} stroke="#000"/>{label}</button>;}
function ActBtns({onEdit,onDelete}){return <div style={{display:"flex",gap:6,flexShrink:0}}>{onEdit&&<button style={btn("sec",true)} onClick={onEdit}><Ico d={IC.edit} size={13}/></button>}<button style={btn("danger",true)} onClick={onDelete}><Ico d={IC.trash} size={13}/></button></div>;}
function Badge({c,children}){return <span style={{display:"inline-flex",alignItems:"center",padding:"3px 8px",borderRadius:6,fontSize:11,fontWeight:700,background:c+"20",color:c,letterSpacing:"0.03em",flexShrink:0}}>{children}</span>;}
function AlertBox({c,children}){return <div style={{background:c+"12",border:`1px solid ${c}30`,borderRadius:12,padding:"13px 15px",display:"flex",gap:11,marginBottom:11,alignItems:"flex-start"}}>{children}</div>;}
function Divider(){return <div style={{height:1,background:T.border,margin:"13px 0"}}/>;}
function BarTrack({c,pct}){return <div style={{height:5,background:T.border,borderRadius:3,overflow:"hidden",marginTop:7}}><div style={{height:"100%",background:c,borderRadius:3,width:`${Math.min(pct||0,100)}%`,transition:"width .5s"}}/></div>;}
function Card({children,style}){return <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:18,...style}}>{children}</div>;}
function SCard({c,children}){return <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:18,borderTop:`2px solid ${c||T.accent}`}}>{children}</div>;}
function SLabel({children}){return <div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5}}>{children}</div>;}
function SVal({c,sz,children}){return <div style={{fontSize:sz||26,fontWeight:800,color:c||T.white,lineHeight:1.1,letterSpacing:"-0.5px"}}>{children}</div>;}
function SSub({children}){return <div style={{fontSize:11,color:T.muted,marginTop:4}}>{children}</div>;}
function CTitle({icon,children}){return <div style={{fontSize:11,fontWeight:700,color:T.sub,marginBottom:13,display:"flex",alignItems:"center",gap:7,textTransform:"uppercase",letterSpacing:"0.06em"}}><Ico d={icon} size={13} stroke={T.sub}/>{children}</div>;}
function Grid({cols,gap,children,style}){return <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fit,minmax(${cols||200}px,1fr))`,gap:gap||14,marginBottom:18,...style}}>{children}</div>;}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toasts({list}){return <div style={{position:"fixed",bottom:24,right:24,zIndex:500,display:"flex",flexDirection:"column",gap:8}}>{list.map(t=><div key={t.id} style={{background:T.card2,border:`1px solid ${(t.color||T.green)}40`,borderRadius:12,padding:"11px 16px",fontSize:13,fontWeight:600,color:T.white,display:"flex",alignItems:"center",gap:9,boxShadow:"0 6px 28px rgba(0,0,0,.5)",minWidth:210}}><Ico d={t.icon||IC.check} size={15} stroke={t.color||T.green}/>{t.msg}</div>)}</div>;}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]       = useState("dashboard");
  const [data,setData]     = useState(loadData);
  const [modal,setModal]   = useState(null);
  const [form,setForm]     = useState({});
  const [toasts,setToasts] = useState([]);
  const [saved,setSaved]   = useState(false);
  const [mobile,setMobile] = useState(window.innerWidth<700);
  const [calcGas,setCalcGas] = useState("");
  const [calcEta,setCalcEta] = useState("");

  useEffect(()=>{
    const h=()=>setMobile(window.innerWidth<700);
    window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h);
  },[]);
  useEffect(()=>{ saveData(data); setSaved(true); const t=setTimeout(()=>setSaved(false),1400); return()=>clearTimeout(t); },[data]);

  const toast=useCallback((msg,color,icon)=>{ const id=Date.now(); setToasts(t=>[...t,{id,msg,color,icon}]); setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),2800); },[]);
  const openModal=(type,item=null)=>{ setModal({type,item}); setForm(item?{...item}:{}); };
  const closeModal=()=>{ setModal(null); setForm({}); };
  const ff=(k,v)=>setForm(f=>({...f,[k]:v}));
  const saveItem=(col,item)=>{ setData(d=>{ const list=d[col]; if(item.id) return {...d,[col]:list.map(i=>i.id===item.id?item:i)}; return {...d,[col]:[{...item,id:Date.now()},...list]}; }); toast("Salvo ✓",T.green,IC.check); closeModal(); };
  const del=(col,id)=>{ setData(d=>({...d,[col]:d[col].filter(i=>i.id!==id)})); toast("Removido",T.red,IC.trash); };
  const updateCar=p=>setData(d=>({...d,car:{...d.car,...p}}));

  // ── SMART ALERTS ──────────────────────────────────────────────────────────
  const smartAlerts = useMemo(()=>{
    const km=data.car.kmAtual;
    const alerts=[];
    // 1. Troca de óleo
    const lo=data.trocasOleo[0];
    if(lo?.proxKm){
      const diff=lo.proxKm-km;
      if(diff<=1000) alerts.push({id:"oleo",titulo:"Troca de óleo",desc:diff<=0?`Vencida há ${Math.abs(diff).toLocaleString()} km!`:`Faltam ${diff.toLocaleString()} km (${fmtKm(lo.proxKm)} km)`,urgencia:diff<=0?"alta":"media",cat:"km"});
    }
    // 2. Revisões preventivas baseadas em km
    if(km>0){
      const lastServ=data.servicos.reduce((acc,s)=>{ if(!acc[s.tipo]||s.km>acc[s.tipo]) acc[s.tipo]=s.km; return acc; },{});
      MANUTENCAO.filter(m=>m.km).forEach(m=>{
        const baseKm=lastServ[m.item]||0;
        const proxKm=baseKm>0?baseKm+m.km:null;
        if(proxKm){
          const diff=proxKm-km;
          if(diff<=2000) alerts.push({id:`rev_${m.item}`,titulo:m.item,desc:diff<=0?`Vencida há ${Math.abs(diff).toLocaleString()} km!`:`Faltam ${diff.toLocaleString()} km`,urgencia:diff<=0?"alta":"media",cat:"revisao"});
        }
      });
    }
    // 3. Documentos vencendo
    const hoje=new Date(); hoje.setHours(0,0,0,0);
    data.documentos.filter(d=>!d.pago&&d.vencimento).forEach(d=>{
      const venc=new Date(d.vencimento+"T00:00:00");
      const dias=Math.round((venc-hoje)/86400000);
      if(dias<=90) alerts.push({id:`doc_${d.id}`,titulo:`${d.tipo} vencendo`,desc:dias<=0?`Venceu há ${Math.abs(dias)} dia${Math.abs(dias)!==1?"s":""}!`:`Vence em ${dias} dia${dias!==1?"s":""}`,urgencia:dias<=0?"alta":dias<=30?"media":"baixa",cat:"doc"});
    });
    return alerts;
  },[data]);

  // ── STATISTICS ────────────────────────────────────────────────────────────
  const S = useMemo(()=>{
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

    // km/L
    const sorted=[...ab].filter(a=>a.km>0&&a.litros>0).sort((a,b)=>a.km-b.km);
    const kmLEntries=[]; // {v, label, date}
    for(let i=1;i<sorted.length;i++){
      const dk=sorted[i].km-sorted[i-1].km, L=sorted[i].litros;
      if(dk>0&&dk<800&&L>0) kmLEntries.push({v:+(dk/L).toFixed(2),label:sorted[i].data||"",date:sorted[i].data||""});
    }
    const kmLArr=kmLEntries.map(e=>e.v);
    const mediaKmL=kmLArr.length?+(kmLArr.reduce((a,b)=>a+b,0)/kmLArr.length).toFixed(2):null;
    const melhorKmL=kmLArr.length?Math.max(...kmLArr):null;
    const piorKmL=kmLArr.length?Math.min(...kmLArr):null;
    const mediaPreco=n?+(ab.reduce((a,b)=>a+(b.valorLitro||0),0)/n).toFixed(2):null;
    const mediaGasto=n?+(tAb/n).toFixed(2):null;
    const mediaLit=n?+(ab.reduce((a,b)=>a+(b.litros||0),0)/n).toFixed(1):null;

    // preço combustível ao longo do tempo
    const precosLinha=ab.filter(a=>a.data&&a.valorLitro).sort((a,b)=>a.data.localeCompare(b.data)).map(a=>({v:a.valorLitro,label:a.data.slice(5),tipo:a.tipo}));

    // gastos mensais por categoria (stacked)
    const mesMap={};
    const addMes=(item,cat)=>{ const d=item.data||item.vencimento; if(!d)return; const m=d.slice(0,7); if(!mesMap[m]) mesMap[m]={ab:0,oleo:0,serv:0,pneu:0,doc:0}; mesMap[m][cat]+=(item.total||item.valor||0); };
    ab.forEach(i=>addMes(i,"ab")); data.trocasOleo.forEach(i=>addMes(i,"oleo")); data.servicos.forEach(i=>addMes(i,"serv")); data.pneus.forEach(i=>addMes(i,"pneu")); data.documentos.forEach(i=>addMes(i,"doc"));
    const meses=Object.keys(mesMap).sort().slice(-8);
    const mesLabels=meses.map(m=>`${m.slice(5)}/${m.slice(2,4)}`);
    const stackSeries=[
      {label:"Combustível",color:T.accent,values:meses.map(m=>mesMap[m].ab)},
      {label:"Óleo",       color:T.green, values:meses.map(m=>mesMap[m].oleo)},
      {label:"Serviços",   color:T.blue,  values:meses.map(m=>mesMap[m].serv)},
      {label:"Pneus",      color:T.purple,values:meses.map(m=>mesMap[m].pneu)},
      {label:"Docs",       color:T.teal,  values:meses.map(m=>mesMap[m].doc)},
    ];

    // ranking postos
    const pm={};
    ab.filter(a=>a.posto&&a.valorLitro).forEach(a=>{ if(!pm[a.posto]) pm[a.posto]={nome:a.posto,precos:[],total:0,count:0}; pm[a.posto].precos.push(a.valorLitro); pm[a.posto].total+=a.total||0; pm[a.posto].count++; });
    const rankPostos=Object.values(pm).map(p=>({...p,mediaPreco:+(p.precos.reduce((a,b)=>a+b,0)/p.precos.length).toFixed(2)})).sort((a,b)=>a.mediaPreco-b.mediaPreco);

    const lo=data.trocasOleo[0]||null;
    const proxOleo=lo?.proxKm||null;
    const kmFaltOleo=proxOleo?proxOleo-data.car.kmAtual:null;
    const kmRodados=sorted.length>=2?sorted[sorted.length-1].km-sorted[0].km:0;
    const custoPorKm=kmRodados>0?+(total/kmRodados).toFixed(2):null;

    return {tAb,tOleo,tServ,tPneu,tDocs,tFix,total,abE,abEl,
            kmLEntries,kmLArr,mediaKmL,melhorKmL,piorKmL,
            precosLinha,stackSeries,mesLabels,
            mediaPreco,mediaGasto,mediaLit,rankPostos,
            lo,proxOleo,kmFaltOleo,kmRodados,custoPorKm,n};
  },[data]);

  const alertCount=(data.alertas.filter(a=>a.ativo).length)+smartAlerts.length;

  // ── NAVIGATION ─────────────────────────────────────────────────────────────
  const NAV=[
    {g:"Principal",items:[
      {id:"dashboard",label:"Dashboard",    icon:IC.dash},
      {id:"specs",    label:"Ficha Golf",   icon:IC.car},
      {id:"revisoes", label:"Revisões",     icon:IC.settings},
    ]},
    {g:"Controle",items:[
      {id:"abast",    label:"Abastecimento",icon:IC.fuel},
      {id:"oleo",     label:"Óleo",         icon:IC.oil},
      {id:"servicos", label:"Serviços",     icon:IC.wrench},
      {id:"pneus",    label:"Pneus",        icon:IC.tire},
    ]},
    {g:"Financeiro",items:[
      {id:"docs",     label:"Docs/IPVA",    icon:IC.doc},
      {id:"fixas",    label:"Fixas",        icon:IC.tag},
      {id:"gastos",   label:"Relatório",    icon:IC.chart},
    ]},
    {g:"Ferramentas",items:[
      {id:"calc",     label:"Calculadora",  icon:IC.calc},
      {id:"postos",   label:"Postos",       icon:IC.posto},
      {id:"alertas",  label:"Alertas",      icon:IC.bell},
    ]},
  ];
  const ALL_ITEMS=NAV.flatMap(g=>g.items);
  // Mobile bottom nav: show 5 most important
  const BOTTOM_NAV=[
    {id:"dashboard",label:"Início",  icon:IC.dash},
    {id:"abast",    label:"Abast.",  icon:IC.fuel},
    {id:"gastos",   label:"Gastos",  icon:IC.chart},
    {id:"alertas",  label:"Alertas", icon:IC.bell},
    {id:"mais",     label:"Mais",    icon:IC.menu},
  ];
  const [showMobileMenu,setShowMobileMenu]=useState(false);

  const gotoTab=t=>{ setTab(t); setShowMobileMenu(false); };

  // ── EXPORT / IMPORT ────────────────────────────────────────────────────────
  const exportJSON=()=>{ const j=JSON.stringify(data,null,2); try{ const b=new Blob([j],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=`golf_${new Date().toISOString().slice(0,10)}.json`; a.click(); toast("Backup exportado!",T.green,IC.download); }catch(e){ openModal("exportview"); setForm({json:j}); } };
  const importJSON=()=>openModal("importview");

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>

      {/* ── DESKTOP LAYOUT ── */}
      {!mobile&&(
        <div style={{display:"flex",flex:1,minHeight:0}}>
          {/* Sidebar */}
          <aside style={{width:220,background:T.surf,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",overflowY:"auto",flexShrink:0}}>
            <div style={{padding:"18px 14px 12px",borderBottom:`1px solid ${T.border}`}}>
              <div style={{fontSize:10,fontWeight:700,color:T.muted,letterSpacing:"0.08em",marginBottom:9,textTransform:"uppercase"}}>Meu Carro</div>
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 12px"}}>
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
            <nav style={{padding:"8px",flex:1}}>
              {NAV.map(g=>(
                <div key={g.g} style={{marginBottom:16}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted,padding:"0 8px",marginBottom:4}}>{g.g}</div>
                  {g.items.map(item=>(
                    <button key={item.id} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:tab===item.id?600:400,background:tab===item.id?T.accent+"22":"transparent",color:tab===item.id?T.accent:T.sub,width:"100%",textAlign:"left",marginBottom:2,fontFamily:"inherit"}} onClick={()=>setTab(item.id)}>
                      <Ico d={item.icon} size={14} stroke={tab===item.id?T.accent:T.muted}/>
                      {item.label}
                      {item.id==="alertas"&&alertCount>0&&<Badge c={T.red} style={{marginLeft:"auto",fontSize:10,padding:"1px 6px"}}>{alertCount}</Badge>}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
            <div style={{padding:"10px 8px",borderTop:`1px solid ${T.border}`}}>
              <div style={{fontSize:9,color:T.muted,marginBottom:5,paddingLeft:8,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Dados {saved&&<span style={{color:T.green}}>✓</span>}</div>
              <div style={{display:"flex",gap:5}}>
                <button style={{...btn("sec",true),flex:1,justifyContent:"center"}} onClick={exportJSON}><Ico d={IC.download} size={13}/>Backup</button>
                <button style={{...btn("sec",true),flex:1,justifyContent:"center"}} onClick={importJSON}><Ico d={IC.upload} size={13}/>Import</button>
              </div>
            </div>
          </aside>
          {/* Main */}
          <main style={{flex:1,overflowY:"auto",padding:"26px 30px",boxSizing:"border-box"}}>
            <PageContent tab={tab} data={data} S={S} smartAlerts={smartAlerts} alertCount={alertCount} modal={modal} form={form} saved={saved} calcGas={calcGas} calcEta={calcEta} setCalcGas={setCalcGas} setCalcEta={setCalcEta} setTab={setTab} openModal={openModal} closeModal={closeModal} ff={ff} saveItem={saveItem} del={del} updateCar={updateCar} setData={setData} toast={toast} exportJSON={exportJSON} importJSON={importJSON} INITIAL={INITIAL}/>
          </main>
        </div>
      )}

      {/* ── MOBILE LAYOUT ── */}
      {mobile&&(
        <div style={{display:"flex",flexDirection:"column",flex:1,paddingBottom:64}}>
          {/* Mobile top bar */}
          <div style={{background:T.surf,borderBottom:`1px solid ${T.border}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:T.white}}>{ALL_ITEMS.find(i=>i.id===tab)?.label||"Golf Manager"}</div>
              <div style={{fontSize:11,color:T.muted}}>{data.car.modelo} · {fmtKm(data.car.kmAtual)} km</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {alertCount>0&&<Badge c={T.red}>{alertCount}</Badge>}
              <button style={{...btn("sec",true),padding:"7px 10px"}} onClick={()=>openModal("editkm")}><Ico d={IC.edit} size={14}/></button>
            </div>
          </div>
          {/* Mobile content */}
          <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
            <PageContent tab={tab} data={data} S={S} smartAlerts={smartAlerts} alertCount={alertCount} modal={modal} form={form} saved={saved} calcGas={calcGas} calcEta={calcEta} setCalcGas={setCalcGas} setCalcEta={setCalcEta} setTab={setTab} openModal={openModal} closeModal={closeModal} ff={ff} saveItem={saveItem} del={del} updateCar={updateCar} setData={setData} toast={toast} exportJSON={exportJSON} importJSON={importJSON} INITIAL={INITIAL}/>
          </div>
          {/* Bottom Nav */}
          <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.surf,borderTop:`1px solid ${T.border}`,display:"flex",zIndex:100}}>
            {BOTTOM_NAV.map(item=>(
              <button key={item.id} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 4px",background:"none",border:"none",cursor:"pointer",color:tab===item.id?T.accent:T.muted,fontFamily:"inherit",position:"relative"}} onClick={()=>item.id==="mais"?setShowMobileMenu(m=>!m):gotoTab(item.id)}>
                <Ico d={item.icon} size={20} stroke={tab===item.id?T.accent:T.muted}/>
                <span style={{fontSize:10,fontWeight:tab===item.id?700:400}}>{item.label}</span>
                {item.id==="alertas"&&alertCount>0&&<div style={{position:"absolute",top:6,right:"20%",width:8,height:8,borderRadius:"50%",background:T.red}}/>}
              </button>
            ))}
          </div>
          {/* Mobile full menu overlay */}
          {showMobileMenu&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:200,overflowY:"auto",paddingBottom:20}} onClick={()=>setShowMobileMenu(false)}>
              <div style={{background:T.surf,borderBottom:`1px solid ${T.border}`,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:700,color:T.white}}>Todas as seções</span>
                <button style={{background:"none",border:"none",cursor:"pointer",color:T.muted}} onClick={()=>setShowMobileMenu(false)}><Ico d={IC.x} size={22}/></button>
              </div>
              {NAV.map(g=>(
                <div key={g.g} style={{padding:"12px 16px 0"}}>
                  <div style={{fontSize:10,fontWeight:700,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{g.g}</div>
                  {g.items.map(item=>(
                    <button key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:"none",cursor:"pointer",fontSize:14,fontWeight:600,background:T.card,color:T.text,width:"100%",textAlign:"left",marginBottom:6,fontFamily:"inherit"}} onClick={()=>gotoTab(item.id)}>
                      <Ico d={item.icon} size={18} stroke={T.sub}/>{item.label}
                    </button>
                  ))}
                </div>
              ))}
              <div style={{padding:"12px 16px"}}>
                <div style={{display:"flex",gap:8}}>
                  <button style={{...btn("sec"),flex:1,justifyContent:"center"}} onClick={()=>{setShowMobileMenu(false);exportJSON();}}><Ico d={IC.download} size={14}/>Backup</button>
                  <button style={{...btn("sec"),flex:1,justifyContent:"center"}} onClick={()=>{setShowMobileMenu(false);importJSON();}}><Ico d={IC.upload} size={14}/>Importar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {modal&&(
        <MWrap onClose={closeModal}>
          {modal.type==="editkm"&&<><MHead title="Atualizar Km Atual" onClose={closeModal}/><Field label="Km atual" type="number" value={form.km??data.car.kmAtual} onChange={v=>ff("km",v)}/><SaveBtn onClick={()=>{updateCar({kmAtual:+form.km});toast("Km atualizado",T.green,IC.check);closeModal();}} label="Atualizar"/></>}
          {modal.type==="editcar"&&<><MHead title="Dados do Carro" onClose={closeModal}/><Field label="Placa" value={form.placa??data.car.placa} onChange={v=>ff("placa",v)} placeholder="ABC-1234"/><Field label="Cor" value={form.cor??data.car.cor} onChange={v=>ff("cor",v)}/><Field label="Km atual" type="number" value={form.kmAtual??data.car.kmAtual} onChange={v=>ff("kmAtual",v)}/><SaveBtn onClick={()=>{setData(d=>({...d,car:{...d.car,...form,kmAtual:+form.kmAtual}}));toast("Salvo",T.green,IC.check);closeModal();}}/></>}
          {modal.type==="abast"&&<><MHead title={modal.item?"Editar Abastecimento":"Registrar Abastecimento"} onClose={closeModal}/><Field label="Data" type="date" value={form.data||""} onChange={v=>ff("data",v)}/><Field label="Km" type="number" value={form.km||""} onChange={v=>ff("km",+v)}/><Sel label="Pessoa" value={form.pessoa||""} onChange={v=>ff("pessoa",v)}><option value="">— selecione —</option>{PESSOAS.map(p=><option key={p}>{p}</option>)}</Sel><Sel label="Combustível" value={form.tipo||"Gasolina"} onChange={v=>ff("tipo",v)}><option>Gasolina</option><option>Etanol</option><option>Diesel</option><option>GNV</option></Sel><Field label="Litros" type="number" step="0.01" value={form.litros||""} onChange={v=>setForm(f=>({...f,litros:+v,total:+((+v)*(f.valorLitro||0)).toFixed(2)}))}/><Field label="Preço/L (R$)" type="number" step="0.01" value={form.valorLitro||""} onChange={v=>setForm(f=>({...f,valorLitro:+v,total:+((f.litros||0)*(+v)).toFixed(2)}))}/><Field label="Total (R$)" type="number" step="0.01" value={form.total||""} onChange={v=>ff("total",+v)}/><Field label="Posto" value={form.posto||""} onChange={v=>ff("posto",v)}/><SaveBtn onClick={()=>saveItem("abastecimentos",form)} label={modal.item?"Salvar":"Registrar"}/></>}
          {modal.type==="oleo"&&<><MHead title={modal.item?"Editar":"Registrar Troca de Óleo"} onClose={closeModal}/><Field label="Data" type="date" value={form.data||""} onChange={v=>ff("data",v)}/><Field label="Km" type="number" value={form.km||""} onChange={v=>ff("km",+v)}/><Field label="Tipo de óleo" value={form.tipo||""} onChange={v=>ff("tipo",v)} placeholder="Ex: Sintético 5W-30"/><Field label="Próxima troca (km)" type="number" value={form.proxKm||""} onChange={v=>ff("proxKm",+v)}/><Field label="Valor (R$)" type="number" step="0.01" value={form.valor||""} onChange={v=>ff("valor",+v)}/><Field label="Obs" value={form.obs||""} onChange={v=>ff("obs",v)}/><SaveBtn onClick={()=>saveItem("trocasOleo",form)} label={modal.item?"Salvar":"Registrar"}/></>}
          {modal.type==="servico"&&<><MHead title={modal.item?"Editar":"Novo Serviço"} onClose={closeModal}/><Field label="Data" type="date" value={form.data||""} onChange={v=>ff("data",v)}/><Field label="Tipo" value={form.tipo||""} onChange={v=>ff("tipo",v)} placeholder="Ex: Freios, Correia..."/><Field label="Km" type="number" value={form.km||""} onChange={v=>ff("km",+v)}/><Field label="Oficina" value={form.oficina||""} onChange={v=>ff("oficina",v)}/><Field label="Valor (R$)" type="number" step="0.01" value={form.valor||""} onChange={v=>ff("valor",+v)}/><Sel label="Status" value={form.status||"Concluído"} onChange={v=>ff("status",v)}><option>Concluído</option><option>Agendado</option><option>Em andamento</option></Sel><Field label="Obs" value={form.obs||""} onChange={v=>ff("obs",v)}/><SaveBtn onClick={()=>saveItem("servicos",form)} label={modal.item?"Salvar":"Registrar"}/></>}
          {modal.type==="pneu"&&<><MHead title={modal.item?"Editar":"Registrar Pneu"} onClose={closeModal}/><Field label="Data" type="date" value={form.data||""} onChange={v=>ff("data",v)}/><Field label="Km" type="number" value={form.km||""} onChange={v=>ff("km",+v)}/><Field label="Marca" value={form.marca||""} onChange={v=>ff("marca",v)}/><Field label="Modelo" value={form.modelo||""} onChange={v=>ff("modelo",v)}/><Field label="Posição" value={form.posicao||""} onChange={v=>ff("posicao",v)} placeholder="Ex: Todos 4"/><Field label="Vida estimada (km)" type="number" value={form.proxKm||""} onChange={v=>ff("proxKm",+v)}/><Field label="Valor (R$)" type="number" step="0.01" value={form.valor||""} onChange={v=>ff("valor",+v)}/><SaveBtn onClick={()=>saveItem("pneus",form)} label={modal.item?"Salvar":"Registrar"}/></>}
          {modal.type==="doc"&&<><MHead title={modal.item?"Editar":"Novo Documento/Taxa"} onClose={closeModal}/><Sel label="Tipo" value={form.tipo||"IPVA"} onChange={v=>ff("tipo",v)}><option>IPVA</option><option>Licenciamento</option><option>Seguro obrigatório (DPVAT)</option><option>Seguro voluntário</option><option>Vistoria</option><option>Multa</option><option>Outro</option></Sel><Field label="Vencimento" type="date" value={form.vencimento||""} onChange={v=>ff("vencimento",v)}/><Field label="Ano ref." value={form.anoRef||""} onChange={v=>ff("anoRef",v)} placeholder="2025"/><Field label="Valor (R$)" type="number" step="0.01" value={form.valor||""} onChange={v=>ff("valor",+v)}/><Sel label="Status" value={form.pago?"sim":"nao"} onChange={v=>ff("pago",v==="sim")}><option value="nao">Pendente</option><option value="sim">Pago</option></Sel><Field label="Obs" value={form.obs||""} onChange={v=>ff("obs",v)}/><SaveBtn onClick={()=>saveItem("documentos",form)} label={modal.item?"Salvar":"Registrar"}/></>}
          {modal.type==="fixa"&&<><MHead title={modal.item?"Editar":"Nova Despesa Fixa"} onClose={closeModal}/><Field label="Nome" value={form.nome||""} onChange={v=>ff("nome",v)} placeholder="Ex: Seguro, Rastreador..."/><Field label="Valor (R$)" type="number" step="0.01" value={form.valor||""} onChange={v=>ff("valor",+v)}/><Sel label="Periodicidade" value={form.periodicidade||"mensal"} onChange={v=>ff("periodicidade",v)}><option value="mensal">Mensal</option><option value="anual">Anual</option><option value="semestral">Semestral</option></Sel><Field label="Obs" value={form.obs||""} onChange={v=>ff("obs",v)}/><SaveBtn onClick={()=>saveItem("despesasFixas",form)} label={modal.item?"Salvar":"Registrar"}/></>}
          {modal.type==="alerta"&&<><MHead title="Novo Alerta" onClose={closeModal}/><Field label="Título" value={form.titulo||""} onChange={v=>ff("titulo",v)}/><Field label="Descrição" value={form.desc||""} onChange={v=>ff("desc",v)}/><Field label="Vencimento (opcional)" type="date" value={form.vencimento||""} onChange={v=>ff("vencimento",v)}/><Sel label="Urgência" value={form.urgencia||"media"} onChange={v=>ff("urgencia",v)}><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></Sel><SaveBtn onClick={()=>saveItem("alertas",{...form,ativo:true})} label="Criar Alerta"/></>}
          {modal.type==="exportview"&&<><MHead title="Backup JSON" onClose={closeModal}/><div style={{fontSize:12,color:T.sub,marginBottom:9}}>Copie o JSON abaixo para guardar como backup.</div><textarea readOnly value={form.json||""} style={{width:"100%",background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px",color:T.text,fontSize:11,fontFamily:"monospace",height:200,boxSizing:"border-box",resize:"vertical"}}/><button style={{...btn("primary"),width:"100%",justifyContent:"center",marginTop:10}} onClick={()=>{try{navigator.clipboard.writeText(form.json||"");toast("Copiado!",T.green,IC.check);}catch(e){}}}><Ico d={IC.check} size={15} stroke="#000"/>Copiar JSON</button></>}
          {modal.type==="importview"&&<><MHead title="Importar Dados" onClose={closeModal}/><div style={{fontSize:12,color:T.sub,marginBottom:9}}>Cole o JSON de backup para restaurar seus dados.</div><textarea value={form.json||""} onChange={e=>ff("json",e.target.value)} placeholder='Cole o JSON aqui...' style={{width:"100%",background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px",color:T.text,fontSize:11,fontFamily:"monospace",height:200,boxSizing:"border-box",resize:"vertical"}}/><button style={{...btn("primary"),width:"100%",justifyContent:"center",marginTop:10}} onClick={()=>{ try{ setData({...INITIAL,...JSON.parse(form.json||"")}); toast("Importado!",T.green,IC.upload); closeModal(); }catch(e){ toast("JSON inválido",T.red,IC.alert); }}}><Ico d={IC.upload} size={15} stroke="#000"/>Importar</button></>}
        </MWrap>
      )}
      <Toasts list={toasts}/>
    </div>
  );
}

// ─── PAGE CONTENT (shared desktop + mobile) ──────────────────────────────────
function PageContent({tab,data,S,smartAlerts,alertCount,modal,form,saved,calcGas,calcEta,setCalcGas,setCalcEta,setTab,openModal,closeModal,ff,saveItem,del,updateCar,setData,toast,exportJSON,importJSON,INITIAL}){

  const CriticalAlerts=()=><>{smartAlerts.filter(a=>a.urgencia==="alta").map(a=>(
    <AlertBox key={a.id} c={T.red}><Ico d={IC.alert} size={17} stroke={T.red}/><div><div style={{fontWeight:700,color:T.red,fontSize:14}}>{a.titulo}</div><div style={{fontSize:13,color:T.sub,marginTop:2}}>{a.desc}</div></div></AlertBox>
  ))}{data.alertas.filter(a=>a.ativo&&a.urgencia==="alta").map(a=>(
    <AlertBox key={a.id} c={T.red}><Ico d={IC.alert} size={17} stroke={T.red}/><div><div style={{fontWeight:700,color:T.red,fontSize:14}}>{a.titulo}</div><div style={{fontSize:13,color:T.sub}}>{a.desc}</div></div></AlertBox>
  ))}</>;

  // ══ DASHBOARD ══
  if(tab==="dashboard") return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div><div style={{fontSize:24,fontWeight:800,color:T.white,letterSpacing:"-0.5px"}}>Dashboard</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>Golf Generation 2004 · {fmtKm(data.car.kmAtual)} km</div></div>
        <button style={btn("sec")} onClick={()=>openModal("editcar")}><Ico d={IC.settings} size={14}/>Editar</button>
      </div>
      <CriticalAlerts/>
      <Grid cols={150}>
        {[{l:"Km Atual",v:fmtKm(data.car.kmAtual),s:"quilômetros",c:T.accent},{l:"Consumo Médio",v:`${fmt1(S.mediaKmL)} km/L`,s:"Fábrica: 9,0 km/L",c:T.green},{l:"Total Gasto",v:fmtR(S.total),s:"todos os registros",c:T.blue},{l:"Custo/km",v:S.custoPorKm?`R$ ${fmt2(S.custoPorKm)}`:  "—",s:"por km rodado",c:T.purple}].map(k=>(
          <SCard key={k.l} c={k.c}><SLabel>{k.l}</SLabel><SVal c={k.c} sz={20}>{k.v}</SVal><SSub>{k.s}</SSub></SCard>
        ))}
      </Grid>
      <Grid cols={280}>
        <Card>
          <CTitle icon={IC.chart}>Distribuição de gastos</CTitle>
          {[{l:"Combustível",v:S.tAb,c:T.accent},{l:"Serviços",v:S.tServ,c:T.blue},{l:"Óleo",v:S.tOleo,c:T.green},{l:"Pneus",v:S.tPneu,c:T.purple},{l:"Documentos",v:S.tDocs,c:T.teal},{l:"Fixas",v:S.tFix,c:T.red}].map(it=>(
            <div key={it.l} style={{marginBottom:9}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:2}}><span style={{color:T.sub}}>{it.l}</span><span style={{fontWeight:700,color:it.c}}>{fmtR(it.v)}</span></div>
              <BarTrack c={it.c} pct={S.total?(it.v/S.total)*100:0}/>
            </div>
          ))}
        </Card>
        <Card>
          <CTitle icon={IC.person}>Combustível por pessoa</CTitle>
          {PESSOAS.map(p=>{const v=p==="Eliseu"?S.abE:S.abEl; return(
            <div key={p} style={{marginBottom:13}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:2}}><span style={{fontWeight:700,color:PC[p]}}>{p}</span><span style={{fontWeight:800,color:T.white}}>{fmtR(v)}</span></div><BarTrack c={PC[p]} pct={S.tAb?(v/S.tAb)*100:0}/><div style={{fontSize:11,color:T.muted,marginTop:3}}>{S.tAb?((v/S.tAb)*100).toFixed(1):0}% do combustível</div></div>
          );})}
          <Divider/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}><span style={{color:T.muted}}>Preço médio/L</span><span style={{fontWeight:700}}>R$ {fmt2(S.mediaPreco)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:T.muted}}>Próx. troca óleo</span><span style={{fontWeight:700,color:S.kmFaltOleo!=null&&S.kmFaltOleo<=0?T.red:T.white}}>{S.proxOleo?`${fmtKm(S.proxOleo)} km`:"—"}</span></div>
        </Card>
      </Grid>
      {/* Gráfico consumo */}
      {S.kmLArr.length>=2&&(
        <Card style={{marginBottom:16}}>
          <CTitle icon={IC.trend}>Consumo km/L por abastecimento</CTitle>
          <div style={{display:"flex",gap:20,marginBottom:12,flexWrap:"wrap"}}>
            <div><div style={{fontSize:11,color:T.muted}}>Média</div><div style={{fontSize:22,fontWeight:800,color:T.green}}>{fmt1(S.mediaKmL)} km/L</div></div>
            <div><div style={{fontSize:11,color:T.muted}}>Melhor</div><div style={{fontSize:16,fontWeight:700,color:T.green}}>{fmt1(S.melhorKmL)}</div></div>
            <div><div style={{fontSize:11,color:T.muted}}>Pior</div><div style={{fontSize:16,fontWeight:700,color:T.red}}>{fmt1(S.piorKmL)}</div></div>
          </div>
          <LineChart data={S.kmLArr} color={T.green} h={90} labels={S.kmLEntries.map(e=>e.label.slice(5))} yLabel=" km/L"/>
        </Card>
      )}
      {/* Gastos mensais */}
      {S.mesLabels.length>0&&(
        <Card style={{marginBottom:16}}>
          <CTitle icon={IC.chart}>Gastos mensais por categoria</CTitle>
          <StackedBarChart labels={S.mesLabels} series={S.stackSeries} h={120}/>
        </Card>
      )}
      {/* Últimos */}
      <Card>
        <CTitle icon={IC.calendar}>Últimos lançamentos</CTitle>
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
  if(tab==="specs") return (
    <div>
      <div style={{marginBottom:22}}><div style={{fontSize:24,fontWeight:800,color:T.white}}>Ficha Técnica</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>Volkswagen Golf Generation 1.6 2004</div></div>
      <Grid cols={280}>
        <Card><CTitle icon={IC.car}>Motor e Performance</CTitle>{[["Motor",GOLF_SPECS.motor],["Potência",GOLF_SPECS.potencia],["Torque",GOLF_SPECS.torque],["Câmbio",GOLF_SPECS.cambio],["Tração",GOLF_SPECS.tracao]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}><span style={{color:T.sub}}>{k}</span><span style={{fontWeight:600,color:T.white}}>{v}</span></div>)}</Card>
        <Card><CTitle icon={IC.fuel}>Combustível e Tanque</CTitle>{[["Combustível",GOLF_SPECS.combustivel],["Tanque",GOLF_SPECS.tanque],["Consumo urbano",GOLF_SPECS.consumoUrbano],["Consumo estrada",GOLF_SPECS.consumoEstrada],["Pneus padrão",GOLF_SPECS.pneus]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}><span style={{color:T.sub}}>{k}</span><span style={{fontWeight:600,color:T.white}}>{v}</span></div>)}<div style={{...{background:T.green+"12",border:`1px solid ${T.green}30`,borderRadius:12,padding:"11px 13px",display:"flex",gap:9,marginBottom:0,alignItems:"flex-start"},marginTop:12}}><Ico d={IC.fire} size={14} stroke={T.green}/><div style={{fontSize:12,color:T.sub}}>Seu consumo: <strong style={{color:T.green}}>{fmt1(S.mediaKmL)} km/L</strong> {S.mediaKmL?(S.mediaKmL>=8.5?"✅ dentro do esperado":"⚠️ abaixo do esperado"):"(sem dados)"}</div></div></Card>
        <Card><CTitle icon={IC.shield}>Freios e Chassi</CTitle>{[["Freios",GOLF_SPECS.freios],["Suspensão diant.","McPherson c/ barra estab."],["Suspensão tras.","Semi-independente torsion beam"],["Direção","Hidráulica (HPower)"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}><span style={{color:T.sub}}>{k}</span><span style={{fontWeight:600,color:T.white,textAlign:"right",maxWidth:170}}>{v}</span></div>)}</Card>
        <Card><CTitle icon={IC.settings}>Seu Carro</CTitle>{[["Placa",data.car.placa||"—"],["Cor",data.car.cor||"—"],["Km atual",`${fmtKm(data.car.kmAtual)} km`]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:13}}><span style={{color:T.sub}}>{k}</span><span style={{fontWeight:600,color:T.accent}}>{v}</span></div>)}<button style={{...btn("sec"),marginTop:13,width:"100%",justifyContent:"center"}} onClick={()=>openModal("editcar")}><Ico d={IC.edit} size={13}/>Editar</button></Card>
      </Grid>
    </div>
  );

  // ══ REVISÕES ══
  if(tab==="revisoes") return (
    <div>
      <div style={{marginBottom:22}}><div style={{fontSize:24,fontWeight:800,color:T.white}}>Revisões Preventivas</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>Intervalos recomendados · Golf 1.6 2004</div></div>
      <AlertBox c={T.accent}><Ico d={IC.alert} size={17} stroke={T.accent}/><div style={{fontSize:13,color:T.sub}}>Km atual: <strong style={{color:T.white}}>{fmtKm(data.car.kmAtual)} km</strong></div></AlertBox>
      {MANUTENCAO.map((m,i)=>(
        <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 18px",marginBottom:9,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:10}}><div style={{width:9,height:9,borderRadius:"50%",background:URGC[m.urgencia],marginTop:4,flexShrink:0}}/><div><div style={{fontWeight:700,fontSize:14,color:T.white,marginBottom:3}}>{m.item}</div><div style={{fontSize:12,color:T.muted}}>{m.intervalo}</div></div></div>
          <Badge c={URGC[m.urgencia]}>{m.urgencia}</Badge>
        </div>
      ))}
      <AlertBox c={T.red}><Ico d={IC.alert} size={16} stroke={T.red}/><div style={{fontSize:12,color:T.sub}}><strong>⚠️ Correia dentada:</strong> No EA111, a correia pode quebrar sem aviso. Falha = dano total ao motor. Nunca negligencie!</div></AlertBox>
    </div>
  );

  // ══ ABASTECIMENTO ══
  if(tab==="abast"){
    const ab=data.abastecimentos;
    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
          <div><div style={{fontSize:24,fontWeight:800,color:T.white}}>Abastecimento</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>{ab.length} registro{ab.length!==1?"s":""} · {fmtR(S.tAb)}</div></div>
          <button style={btn("primary")} onClick={()=>openModal("abast")}><Ico d={IC.plus} size={15} stroke="#000"/>Registrar</button>
        </div>
        {ab.length>0&&(
          <>
            <Grid cols={140}>
              {[{l:"Consumo médio",v:`${fmt1(S.mediaKmL)} km/L`,s:`Melhor: ${fmt1(S.melhorKmL)} · Pior: ${fmt1(S.piorKmL)}`,c:T.green},{l:"Preço médio/L",v:`R$ ${fmt2(S.mediaPreco)}`,s:`Último: R$ ${fmt2(ab[0]?.valorLitro)}/L`,c:T.accent},{l:"Gasto médio",v:fmtR(S.mediaGasto),s:`Total: ${fmtR(S.tAb)}`,c:T.blue},{l:"Litros médio",v:`${fmt1(S.mediaLit)}L`,s:"Tanque: 55L",c:T.purple}].map(s=>(
                <SCard key={s.l} c={s.c}><SLabel>{s.l}</SLabel><SVal c={s.c} sz={18}>{s.v}</SVal><SSub>{s.s}</SSub></SCard>
              ))}
            </Grid>
            <Grid cols={200}>
              {PESSOAS.map(p=>{const v=p==="Eliseu"?S.abE:S.abEl;return <SCard key={p} c={PC[p]}><SLabel>{p}</SLabel><SVal c={PC[p]} sz={20}>{fmtR(v)}</SVal><SSub>{S.tAb?((v/S.tAb)*100).toFixed(1):0}% do total</SSub></SCard>;})}
            </Grid>
            {/* Gráfico consumo km/L */}
            {S.kmLArr.length>=2&&(
              <Card style={{marginBottom:16}}>
                <CTitle icon={IC.trend}>Consumo km/L — linha do tempo</CTitle>
                <LineChart data={S.kmLArr} color={T.green} h={90} labels={S.kmLEntries.map(e=>e.label.slice(5))} yLabel=" km/L"/>
              </Card>
            )}
            {/* Gráfico preço combustível */}
            {S.precosLinha.length>=2&&(
              <Card style={{marginBottom:16}}>
                <CTitle icon={IC.trend}>Evolução do preço do combustível (R$/L)</CTitle>
                <LineChart data={S.precosLinha.map(p=>p.v)} color={T.accent} h={80} labels={S.precosLinha.map(p=>p.label)} yLabel=" R$/L"/>
              </Card>
            )}
          </>
        )}
        {ab.length===0?<Empty icon={IC.fuel} text="Nenhum abastecimento registrado." onAdd={()=>openModal("abast")} btnLabel="Registrar"/>
        :ab.map(a=>(
          <div key={a.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 18px",marginBottom:9,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
            <div><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}><div style={{fontWeight:700,fontSize:14,color:T.white}}>{a.posto||"Posto não informado"}</div><Badge c={a.tipo==="Gasolina"?T.accent:a.tipo==="Etanol"?T.green:T.blue}>{a.tipo}</Badge>{a.pessoa&&<Badge c={PC[a.pessoa]||T.muted}>{a.pessoa}</Badge>}</div><div style={{fontSize:12,color:T.muted}}>📅 {a.data} · 🛣 {fmtKm(a.km)} km · {a.litros}L · R$ {fmt2(a.valorLitro)}/L</div></div>
            <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:17,fontWeight:800,color:T.accent}}>{fmtR(a.total)}</div><ActBtns onEdit={()=>openModal("abast",a)} onDelete={()=>del("abastecimentos",a.id)}/></div>
          </div>
        ))}
      </div>
    );
  }

  // ══ ÓLEO ══
  if(tab==="oleo") return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div><div style={{fontSize:24,fontWeight:800,color:T.white}}>Troca de Óleo</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>Intervalo: 10.000 km ou 12 meses</div></div>
        <button style={btn("primary")} onClick={()=>openModal("oleo")}><Ico d={IC.plus} size={15} stroke="#000"/>Registrar</button>
      </div>
      {S.kmFaltOleo!==null&&<AlertBox c={S.kmFaltOleo<=0?T.red:S.kmFaltOleo<=1000?T.accent:T.green}><Ico d={IC.oil} size={15} stroke={S.kmFaltOleo<=0?T.red:S.kmFaltOleo<=1000?T.accent:T.green}/><div style={{fontSize:13,color:T.sub}}>{S.kmFaltOleo<=0?<><strong style={{color:T.red}}>Vencida!</strong> {Math.abs(S.kmFaltOleo).toLocaleString()} km atrasado.</>:<><strong style={{color:T.white}}>Próxima em {fmtKm(S.proxOleo)} km.</strong> Faltam {S.kmFaltOleo.toLocaleString()} km.</>}</div></AlertBox>}
      {data.trocasOleo.length===0?<Empty icon={IC.oil} text="Nenhuma troca registrada." onAdd={()=>openModal("oleo")} btnLabel="Registrar Troca"/>
      :data.trocasOleo.map(t=>(
        <div key={t.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 18px",marginBottom:9,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
          <div><div style={{fontWeight:700,fontSize:14,color:T.white,marginBottom:4}}>{t.tipo||"Troca de óleo"}</div><div style={{fontSize:12,color:T.muted}}>📅 {t.data} · 🛣 {fmtKm(t.km)} km · Próxima: {fmtKm(t.proxKm)} km</div>{t.obs&&<div style={{fontSize:12,color:T.muted,marginTop:3}}>💬 {t.obs}</div>}</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:17,fontWeight:800,color:T.accent}}>{fmtR(t.valor)}</div><ActBtns onEdit={()=>openModal("oleo",t)} onDelete={()=>del("trocasOleo",t.id)}/></div>
        </div>
      ))}
    </div>
  );

  // ══ SERVIÇOS ══
  if(tab==="servicos") return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div><div style={{fontSize:24,fontWeight:800,color:T.white}}>Serviços</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>Total: {fmtR(S.tServ)}</div></div>
        <button style={btn("primary")} onClick={()=>openModal("servico")}><Ico d={IC.plus} size={15} stroke="#000"/>Novo</button>
      </div>
      {data.servicos.length===0?<Empty icon={IC.wrench} text="Nenhum serviço registrado." onAdd={()=>openModal("servico")} btnLabel="Novo Serviço"/>
      :data.servicos.map(sv=>(
        <div key={sv.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 18px",marginBottom:9,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
          <div><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}><div style={{fontWeight:700,fontSize:14,color:T.white}}>{sv.tipo}</div><Badge c={sv.status==="Concluído"?T.green:sv.status==="Agendado"?T.accent:T.blue}>{sv.status}</Badge></div><div style={{fontSize:12,color:T.muted}}>📅 {sv.data} · 🛣 {fmtKm(sv.km)} km · 🏪 {sv.oficina}</div>{sv.obs&&<div style={{fontSize:12,color:T.muted,marginTop:3}}>💬 {sv.obs}</div>}</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:17,fontWeight:800,color:T.accent}}>{fmtR(sv.valor)}</div><ActBtns onEdit={()=>openModal("servico",sv)} onDelete={()=>del("servicos",sv.id)}/></div>
        </div>
      ))}
    </div>
  );

  // ══ PNEUS ══
  if(tab==="pneus") return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div><div style={{fontSize:24,fontWeight:800,color:T.white}}>Pneus</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>Padrão: 195/65 R15 · Alinhar a cada 10.000 km</div></div>
        <button style={btn("primary")} onClick={()=>openModal("pneu")}><Ico d={IC.plus} size={15} stroke="#000"/>Registrar</button>
      </div>
      {data.pneus.length===0?<Empty icon={IC.tire} text="Nenhum registro de pneu." onAdd={()=>openModal("pneu")} btnLabel="Registrar Pneu"/>
      :data.pneus.map(p=>(
        <div key={p.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 18px",marginBottom:9,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
          <div><div style={{fontWeight:700,fontSize:14,color:T.white,marginBottom:4}}>{p.marca} {p.modelo}</div><div style={{fontSize:12,color:T.muted}}>📅 {p.data} · 🛣 {fmtKm(p.km)} km · {p.posicao}</div>{p.proxKm&&<div style={{fontSize:12,color:T.green,marginTop:3}}>Vida estimada até {fmtKm(p.proxKm)} km</div>}</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:17,fontWeight:800,color:T.accent}}>{fmtR(p.valor)}</div><ActBtns onEdit={()=>openModal("pneu",p)} onDelete={()=>del("pneus",p.id)}/></div>
        </div>
      ))}
    </div>
  );

  // ══ DOCS ══
  if(tab==="docs") return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div><div style={{fontSize:24,fontWeight:800,color:T.white}}>Documentos e Taxas</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>IPVA · Seguro · Licenciamento · Vistoria · {fmtR(S.tDocs)}</div></div>
        <button style={btn("primary")} onClick={()=>openModal("doc")}><Ico d={IC.plus} size={15} stroke="#000"/>Adicionar</button>
      </div>
      {data.documentos.length===0?<Empty icon={IC.doc} text="Nenhum documento ou taxa." onAdd={()=>openModal("doc")} btnLabel="Adicionar"/>
      :data.documentos.map(d=>(
        <div key={d.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 18px",marginBottom:9,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
          <div><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}><div style={{fontWeight:700,fontSize:14,color:T.white}}>{d.tipo}</div><Badge c={d.pago?T.green:T.red}>{d.pago?"Pago":"Pendente"}</Badge></div><div style={{fontSize:12,color:T.muted}}>📅 Vencimento: {d.vencimento} · Ano ref: {d.anoRef||"—"}</div>{d.obs&&<div style={{fontSize:12,color:T.muted,marginTop:3}}>💬 {d.obs}</div>}</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:17,fontWeight:800,color:d.pago?T.green:T.red}}>{fmtR(d.valor)}</div><ActBtns onEdit={()=>openModal("doc",d)} onDelete={()=>del("documentos",d.id)}/></div>
        </div>
      ))}
    </div>
  );

  // ══ FIXAS ══
  if(tab==="fixas") return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div><div style={{fontSize:24,fontWeight:800,color:T.white}}>Despesas Fixas</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>Seguro · Rastreador · Garagem · {fmtR(S.tFix)}</div></div>
        <button style={btn("primary")} onClick={()=>openModal("fixa")}><Ico d={IC.plus} size={15} stroke="#000"/>Adicionar</button>
      </div>
      {data.despesasFixas.length===0?<Empty icon={IC.tag} text="Nenhuma despesa fixa." onAdd={()=>openModal("fixa")} btnLabel="Adicionar Despesa"/>
      :data.despesasFixas.map(d=>(
        <div key={d.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 18px",marginBottom:9,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
          <div><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}><div style={{fontWeight:700,fontSize:14,color:T.white}}>{d.nome}</div><Badge c={T.purple}>{d.periodicidade||"mensal"}</Badge></div><div style={{fontSize:12,color:T.muted}}>{d.obs||""}</div></div>
          <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:17,fontWeight:800,color:T.purple}}>{fmtR(d.valor)}</div><ActBtns onEdit={()=>openModal("fixa",d)} onDelete={()=>del("despesasFixas",d.id)}/></div>
        </div>
      ))}
    </div>
  );

  // ══ RELATÓRIO ══
  if(tab==="gastos") return (
    <div>
      <div style={{marginBottom:22}}><div style={{fontSize:24,fontWeight:800,color:T.white}}>Relatório Financeiro</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>Controle completo de todos os gastos</div></div>
      <SCard c={T.accent} style={{marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><SLabel>Total Geral Investido</SLabel><SVal sz={34}>{fmtR(S.total)}</SVal><SSub>{S.custoPorKm?`R$ ${fmt2(S.custoPorKm)}/km · ${fmtKm(S.kmRodados)} km registrados`:""}</SSub></div>
          <Ico d={IC.dollar} size={44} stroke={T.accent+"40"}/>
        </div>
      </SCard>
      <Grid cols={260}>
        {[{l:"Combustível",v:S.tAb,c:T.accent,icon:IC.fuel,n:data.abastecimentos.length},{l:"Serviços",v:S.tServ,c:T.blue,icon:IC.wrench,n:data.servicos.length},{l:"Troca de Óleo",v:S.tOleo,c:T.green,icon:IC.oil,n:data.trocasOleo.length},{l:"Pneus",v:S.tPneu,c:T.purple,icon:IC.tire,n:data.pneus.length},{l:"Documentos",v:S.tDocs,c:T.teal,icon:IC.doc,n:data.documentos.length},{l:"Despesas Fixas",v:S.tFix,c:T.red,icon:IC.tag,n:data.despesasFixas.length}].map(it=>(
          <SCard key={it.l} c={it.c}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><SLabel>{it.l}</SLabel><SVal c={it.c} sz={22}>{fmtR(it.v)}</SVal><SSub>{it.n} registros</SSub></div><Ico d={it.icon} size={20} stroke={it.c+"60"}/></div><BarTrack c={it.c} pct={S.total?(it.v/S.total)*100:0}/><div style={{fontSize:10,color:T.muted,marginTop:3}}>{S.total?((it.v/S.total)*100).toFixed(1):0}% do total</div></SCard>
        ))}
      </Grid>
      {/* Gráfico empilhado */}
      {S.mesLabels.length>0&&(
        <Card style={{marginBottom:16}}>
          <CTitle icon={IC.chart}>Gastos mensais por categoria</CTitle>
          <StackedBarChart labels={S.mesLabels} series={S.stackSeries} h={130}/>
        </Card>
      )}
      <Card>
        <CTitle icon={IC.person}>Combustível por pessoa</CTitle>
        <Grid cols={200}>
          {PESSOAS.map(p=>{const v=p==="Eliseu"?S.abE:S.abEl;const n=data.abastecimentos.filter(a=>a.pessoa===p).length;return(
            <div key={p} style={{background:T.card2,borderRadius:11,padding:14,border:`1px solid ${T.border}`}}>
              <div style={{fontWeight:700,color:PC[p],marginBottom:7,fontSize:14}}>{p}</div>
              <div style={{fontSize:20,fontWeight:800,color:T.white}}>{fmtR(v)}</div>
              <div style={{fontSize:11,color:T.muted,marginTop:3}}>{n} abastecimentos</div>
              <BarTrack c={PC[p]} pct={S.tAb?(v/S.tAb)*100:0}/>
              <div style={{fontSize:10,color:T.muted,marginTop:3}}>{S.tAb?((v/S.tAb)*100).toFixed(1):0}% do combustível</div>
            </div>
          );})}
        </Grid>
      </Card>
    </div>
  );

  // ══ CALCULADORA ══
  if(tab==="calc"){
    const mKmL=S.mediaKmL||9.0, ratio=0.70;
    const cG=calcGas?+(+calcGas/mKmL).toFixed(3):null;
    const cE=calcEta?+(+calcEta/(mKmL*ratio)).toFixed(3):null;
    const melhor=cG&&cE?(cE<cG?"etanol":"gasolina"):null;
    const be=calcGas?+(+calcGas*ratio).toFixed(2):null;
    const kmPorAbast=S.mediaLit&&S.mediaKmL?S.mediaLit*S.mediaKmL:null;
    const ultKm=data.abastecimentos[0]?.km;
    const prevKm=ultKm&&kmPorAbast?Math.round(ultKm+kmPorAbast):null;
    return (
      <div>
        <div style={{marginBottom:22}}><div style={{fontSize:24,fontWeight:800,color:T.white}}>Calculadora</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>Gasolina vs Etanol · Previsão de abastecimento</div></div>
        <Card style={{marginBottom:16}}>
          <CTitle icon={IC.calc}>Gasolina vs Etanol — qual compensa hoje?</CTitle>
          <div style={{fontSize:13,color:T.sub,marginBottom:14}}>Consumo registrado: <strong style={{color:T.white}}>{fmt1(mKmL)} km/L</strong> (gasolina). Etanol rende ~{Math.round(ratio*100)}% no 1.6.</div>
          <Grid cols={200}>
            <div><label style={{fontSize:12,fontWeight:600,color:T.sub,marginBottom:5,display:"block"}}>Gasolina (R$/L)</label><input type="number" step="0.01" placeholder="Ex: 6.29" value={calcGas} onChange={e=>setCalcGas(e.target.value)} style={{width:"100%",background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 13px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/></div>
            <div><label style={{fontSize:12,fontWeight:600,color:T.sub,marginBottom:5,display:"block"}}>Etanol (R$/L)</label><input type="number" step="0.01" placeholder="Ex: 4.19" value={calcEta} onChange={e=>setCalcEta(e.target.value)} style={{width:"100%",background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 13px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/></div>
          </Grid>
          {(cG||cE)&&(
            <>
              <Grid cols={200}>
                <div style={{background:T.surf,borderRadius:11,padding:14,border:`2px solid ${melhor==="gasolina"?T.accent:T.border}`}}>
                  <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:5}}>Gasolina</div>
                  <div style={{fontSize:22,fontWeight:800,color:T.accent}}>R$ {cG}<span style={{fontSize:12}}>/km</span></div>
                  <div style={{fontSize:11,color:T.muted,marginTop:3}}>{calcGas} R$/L ÷ {fmt1(mKmL)} km/L</div>
                  {melhor==="gasolina"&&<div style={{marginTop:7}}><Badge c={T.accent}>✅ Compensa mais</Badge></div>}
                </div>
                <div style={{background:T.surf,borderRadius:11,padding:14,border:`2px solid ${melhor==="etanol"?T.green:T.border}`}}>
                  <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:5}}>Etanol</div>
                  <div style={{fontSize:22,fontWeight:800,color:T.green}}>R$ {cE}<span style={{fontSize:12}}>/km</span></div>
                  <div style={{fontSize:11,color:T.muted,marginTop:3}}>{calcEta} R$/L ÷ {fmt1(mKmL*ratio)} km/L</div>
                  {melhor==="etanol"&&<div style={{marginTop:7}}><Badge c={T.green}>✅ Compensa mais</Badge></div>}
                </div>
              </Grid>
              {be&&<AlertBox c={T.blue}><Ico d={IC.alert} size={15} stroke={T.blue}/><div style={{fontSize:13,color:T.sub}}>Ponto de equilíbrio: etanol compensa se custar menos que <strong style={{color:T.white}}>R$ {be}/L</strong> (70% da gasolina).</div></AlertBox>}
            </>
          )}
        </Card>
        <Card>
          <CTitle icon={IC.fuel}>Previsão do próximo abastecimento</CTitle>
          {kmPorAbast?(
            <>
              <div style={{fontSize:13,color:T.sub,marginBottom:14}}>Média de <strong style={{color:T.white}}>{fmt1(S.mediaLit)}L</strong> × <strong style={{color:T.white}}>{fmt1(S.mediaKmL)} km/L</strong> = <strong style={{color:T.accent}}>~{Math.round(kmPorAbast).toLocaleString()} km</strong> por abastecimento.</div>
              <Grid cols={200}>
                <div style={{background:T.surf,borderRadius:11,padding:14}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Último abastecimento</div><div style={{fontSize:20,fontWeight:800,color:T.white}}>{fmtKm(ultKm)} km</div></div>
                <div style={{background:T.surf,borderRadius:11,padding:14,border:`1px solid ${T.accent}40`}}><div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Próximo abastecimento</div><div style={{fontSize:20,fontWeight:800,color:T.accent}}>{fmtKm(prevKm)} km</div><div style={{fontSize:11,color:T.muted,marginTop:3}}>Faltam ~{Math.max(0,(prevKm||0)-data.car.kmAtual).toLocaleString()} km</div></div>
              </Grid>
            </>
          ):<div style={{textAlign:"center",padding:"28px 0",color:T.muted,fontSize:13}}>Registre pelo menos 2 abastecimentos com km para calcular.</div>}
        </Card>
      </div>
    );
  }

  // ══ POSTOS ══
  if(tab==="postos") return (
    <div>
      <div style={{marginBottom:22}}><div style={{fontSize:24,fontWeight:800,color:T.white}}>Ranking de Postos</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>Baseado no seu histórico de abastecimentos</div></div>
      {S.rankPostos.length===0?<Empty icon={IC.posto} text="Nenhum posto registrado ainda." onAdd={()=>setTab("abast")} btnLabel="Ir para Abastecimento"/>
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
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div><div style={{fontSize:24,fontWeight:800,color:T.white}}>Alertas</div><div style={{fontSize:13,color:T.sub,marginTop:3}}>{alertCount} ativo{alertCount!==1?"s":""}</div></div>
        <button style={btn("primary")} onClick={()=>openModal("alerta")}><Ico d={IC.plus} size={15} stroke="#000"/>Novo</button>
      </div>
      {smartAlerts.length>0&&(
        <>
          <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>Automáticos ({smartAlerts.length})</div>
          {smartAlerts.map(a=>(
            <AlertBox key={a.id} c={URGC[a.urgencia]}><Ico d={IC.alert} size={17} stroke={URGC[a.urgencia]}/><div style={{flex:1}}><div style={{fontWeight:700,color:URGC[a.urgencia],fontSize:14}}>{a.titulo}</div><div style={{fontSize:13,color:T.sub,marginTop:2}}>{a.desc}</div><div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}><Badge c={URGC[a.urgencia]}>{a.urgencia}</Badge><span style={{fontSize:11,color:T.muted}}>automático</span>{a.cat==="doc"&&<span style={{fontSize:11,color:T.muted}}>📄 documento</span>}{a.cat==="revisao"&&<span style={{fontSize:11,color:T.muted}}>🔧 revisão</span>}</div></div></AlertBox>
          ))}
          <Divider/>
        </>
      )}
      {data.alertas.length>0&&<div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em"}}>Manuais</div>}
      {data.alertas.length===0&&smartAlerts.length===0?<Empty icon={IC.bell} text="Nenhum alerta." onAdd={()=>openModal("alerta")} btnLabel="Novo Alerta"/>
      :data.alertas.map(a=>(
        <AlertBox key={a.id} c={URGC[a.urgencia]}><Ico d={IC.alert} size={17} stroke={URGC[a.urgencia]}/><div style={{flex:1,opacity:a.ativo?1:.45}}><div style={{fontWeight:700,color:URGC[a.urgencia],fontSize:14}}>{a.titulo}</div><div style={{fontSize:13,color:T.sub,marginTop:2}}>{a.desc}</div><div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}><Badge c={URGC[a.urgencia]}>{a.urgencia}</Badge>{a.vencimento&&<span style={{fontSize:11,color:T.muted}}>📅 {a.vencimento}</span>}</div></div><div style={{display:"flex",gap:6,flexShrink:0}}><button style={btn("sec",true)} onClick={()=>setData(d=>({...d,alertas:d.alertas.map(al=>al.id===a.id?{...al,ativo:!al.ativo}:al)}))}><Ico d={IC.check} size={13}/></button><button style={btn("danger",true)} onClick={()=>del("alertas",a.id)}><Ico d={IC.trash} size={13}/></button></div></AlertBox>
      ))}
    </div>
  );

  return <div style={{padding:"60px 20px",textAlign:"center",color:T.muted}}>Selecione uma seção no menu.</div>;
}
