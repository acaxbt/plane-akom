import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, DragEvent, FormEvent, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { Activity, GripVertical, ArrowDownUp, ArrowRight, ArrowUpRight, Bell, CalendarDays, Check, CheckCheck, CheckCircle2, ChevronDown, ChevronRight, Circle, CircleDashed, CircleDot, Clock3, CornerDownRight, Ellipsis, Filter, Folder, Inbox, Keyboard, LayoutGrid, List, Menu, MoreHorizontal, PanelLeftClose, Plus, Search, Sparkles, Target, UserRound, Users, X, Zap, Sun, Moon, Copy, Pencil, AlignLeft, PanelLeftOpen, Layers2 } from 'lucide-react';
import './style.css';

type Status = 'Backlog' | 'Todo' | 'In Progress' | 'In Review' | 'Done' | 'Canceled';
type Priority = 'Urgent' | 'High' | 'Medium' | 'Low' | 'None';
type View = 'my' | 'all' | 'board' | 'projects' | 'inbox' | 'cycles' | 'initiatives' | 'team';
type Member = { id:string; name:string; initials:string; workspace:string; team:string; color:string; role:string };
type Team = { id:string; name:string; workspace:string; prefix:string; color:string };
type Project = { id:string; name:string; team:string; icon:string; color:string; progress:number; description:string };
type Issue = { id:string; title:string; description:string; status:Status; priority:Priority; assignee:string | null; creator:string; team:string; workspace:string; project:string; labels:string[]; created:string; due?:string; comments:{by:string; body:string; time:string}[] };
const MEMBERS:Member[] = [
 {id:'raka',name:'Raka Putra',initials:'RP',workspace:'Product Media',team:'Product',role:'Product Manager',color:'#9384d9'},
 {id:'nadia',name:'Nadia Prameswari',initials:'NP',workspace:'Product Media',team:'Engineering',role:'Software Engineer',color:'#c786ad'},
 {id:'dimas',name:'Dimas Pratama',initials:'DP',workspace:'Product Media',team:'Engineering',role:'Frontend Engineer',color:'#6a9db2'},
 {id:'sarah',name:'Sarah Wijaya',initials:'SW',workspace:'Product Data',team:'Analytics',role:'Data Analyst',color:'#bf945d'},
 {id:'bima',name:'Bima Aditya',initials:'BA',workspace:'Product Data',team:'Data Platform',role:'Data Engineer',color:'#70a598'},
 {id:'alina',name:'Alina Mahendra',initials:'AM',workspace:'Design Studio',team:'Product Design',role:'Product Designer',color:'#b98185'},
 {id:'farhan',name:'Farhan Rizky',initials:'FR',workspace:'Design Studio',team:'Brand',role:'Visual Designer',color:'#97a56b'},
 {id:'jessica',name:'Jessica Tan',initials:'JT',workspace:'Commerce',team:'Operations',role:'Operations Lead',color:'#9995bb'},
];
const INITIAL_TEAMS:Team[] = [
 {id:'Media',name:'Product Media',workspace:'Product Media',prefix:'MED',color:'#9384d9'},
 {id:'Data',name:'Product Data',workspace:'Product Data',prefix:'DAT',color:'#d5a673'},
 {id:'Design',name:'Design Studio',workspace:'Design Studio',prefix:'DSN',color:'#b4a2d1'},
 {id:'Commerce',name:'Commerce Ops',workspace:'Commerce',prefix:'OPS',color:'#70a598'},
];
const WORKSPACES=['Product Media','Product Data','Design Studio','Commerce'];
const PROJECTS:Project[] = [
 {id:'fyp',name:'For You Experience',team:'Media',icon:'✦',color:'#a68de9',progress:68,description:'A more personal content discovery experience.'},
 {id:'platform',name:'Platform Foundations',team:'Media',icon:'◈',color:'#8cb7dc',progress:42,description:'Reliable, scalable foundations for every product.'},
 {id:'insights',name:'Unified Insights',team:'Data',icon:'◉',color:'#d5a673',progress:81,description:'A single source of truth for product metrics.'},
 {id:'design',name:'Design System 2.0',team:'Design',icon:'⬡',color:'#b4a2d1',progress:54,description:'Consistent experiences across our products.'},
];
const SEED:Issue[] = [
 {id:'MED-128',title:'Redesign personalized feed cards',description:'Explore a cleaner feed card hierarchy that prioritizes content and improves scanning on smaller viewports.\n\nAcceptance criteria:\n• Clear information hierarchy for title and metadata\n• Responsive behavior for tablet and mobile\n• Accessible interactive elements',status:'In Progress',priority:'High',assignee:'alina',creator:'raka',team:'Media',workspace:'Product Media',project:'fyp',labels:['Design','Feature'],created:'Oct 17',due:'Oct 24',comments:[{by:'raka',body:'Sharing the first design direction with the team. Alina, feel free to explore a few variations.',time:'Yesterday'}]},
 {id:'MED-127',title:'Improve recommendation ranking signals',description:'Refine and validate the ranking inputs in the personalized recommendation pipeline.',status:'In Progress',priority:'Urgent',assignee:'sarah',creator:'raka',team:'Media',workspace:'Product Media',project:'fyp',labels:['Data','Feature'],created:'Oct 16',due:'Oct 22',comments:[]},
 {id:'DAT-084',title:'Consolidate product events into unified schema',description:'Define a normalized event contract and map the existing instrumentation.',status:'In Review',priority:'High',assignee:'raka',creator:'bima',team:'Data',workspace:'Product Data',project:'insights',labels:['Data'],created:'Oct 14',comments:[]},
 {id:'MED-126',title:'Investigate infinite scroll performance regression',description:'Some devices experience frame drops after several pages of feed content. Investigate and propose a fix.',status:'Todo',priority:'High',assignee:'dimas',creator:'nadia',team:'Media',workspace:'Product Media',project:'fyp',labels:['Bug'],created:'Oct 15',due:'Oct 27',comments:[]},
 {id:'DSN-052',title:'Audit motion and transition tokens',description:'Review our existing motion primitives and define the next generation.',status:'Todo',priority:'Medium',assignee:'raka',creator:'alina',team:'Design',workspace:'Design Studio',project:'design',labels:['Design'],created:'Oct 12',comments:[]},
 {id:'MED-125',title:'Build contextual onboarding for first-time users',description:'Guide new users through their first meaningful action with lightweight contextual hints.',status:'Todo',priority:'Medium',assignee:'nadia',creator:'raka',team:'Media',workspace:'Product Media',project:'fyp',labels:['Feature'],created:'Oct 11',comments:[]},
 {id:'DAT-083',title:'Publish weekly acquisition dashboard',description:'Ship a reliable weekly view of acquisition and retention trends.',status:'Backlog',priority:'Medium',assignee:'bima',creator:'sarah',team:'Data',workspace:'Product Data',project:'insights',labels:['Analytics'],created:'Oct 10',comments:[]},
 {id:'MED-124',title:'Fix image loading layout shifts in the feed',description:'Avoid unnecessary reflows by reserving the correct media dimensions.',status:'In Review',priority:'Medium',assignee:'nadia',creator:'raka',team:'Media',workspace:'Product Media',project:'platform',labels:['Bug'],created:'Oct 9',comments:[]},
 {id:'DSN-051',title:'Document component accessibility patterns',description:'Create examples for keyboard focus, contrast, dialog navigation, and component states.',status:'Done',priority:'Low',assignee:'alina',creator:'farhan',team:'Design',workspace:'Design Studio',project:'design',labels:['Docs'],created:'Oct 8',comments:[]},
 {id:'MED-123',title:'Add keyboard shortcuts to content editor',description:'Speed up repeated editor actions with discoverable shortcuts.',status:'Done',priority:'Low',assignee:'raka',creator:'dimas',team:'Media',workspace:'Product Media',project:'platform',labels:['Improvement'],created:'Oct 7',comments:[]},
 {id:'OPS-029',title:'Streamline partner content approval workflow',description:'Reduce the time required to review and approve partner submissions.',status:'Backlog',priority:'Medium',assignee:'jessica',creator:'raka',team:'Commerce',workspace:'Commerce',project:'platform',labels:['Operations'],created:'Oct 4',comments:[]},
 {id:'MED-122',title:'Define edge cases for empty recommendations',description:'Cover cold-start and empty-state journeys in the feed experience.',status:'Backlog',priority:'Low',assignee:null,creator:'raka',team:'Media',workspace:'Product Media',project:'fyp',labels:['Research'],created:'Oct 3',comments:[]},
];
const STATUS:Status[]=['Backlog','Todo','In Progress','In Review','Done','Canceled'];
const ACTIVE:Status[]=['In Progress','In Review','Todo','Backlog'];
const PRIORITIES:Priority[]=['Urgent','High','Medium','Low','None'];
const PRIORITY_COLOR:Record<Priority,string>={Urgent:'#ec7e73',High:'#e4a55e',Medium:'#d2b36e',Low:'#7fa5a5',None:'#777985'};
const getMember=(id:string|null)=>MEMBERS.find(m=>m.id===id);
function Avatar({id,size=25}: {id:string|null;size?:number}){const m=getMember(id);return m?<span className="avatar" title={`${m.name} · ${m.workspace}`} style={{'--avatar-color':m.color,width:size,height:size,fontSize:size<25?9:10} as CSSProperties}>{m.initials}</span>:<span className="avatar avatar-empty" style={{width:size,height:size} as CSSProperties}><UserRound size={size*.6}/></span>}
function StatusIcon({status,size=16}:{status:Status;size?:number}){if(status==='Done')return <CheckCircle2 size={size} className="status-done"/>;if(status==='In Progress')return <span className="status-progress-icon" style={{width:size,height:size}}/>;if(status==='In Review')return <CircleDot size={size} className="status-review"/>;if(status==='Canceled')return <Circle size={size} className="muted"/>;if(status==='Backlog')return <CircleDashed size={size} className="status-backlog"/>;return <Circle size={size} className="status-todo"/>}
function PriorityIcon({priority,size=15}:{priority:Priority;size?:number}){return priority==='None'?<MoreHorizontal size={size} className="muted"/>:<span className="priority-bars" style={{color:PRIORITY_COLOR[priority]}}>{[1,2,3,4].map((n)=><i key={n} style={{height:4+n*2,opacity:priority==='Low'? (n<=1?1:.22):priority==='Medium'?(n<=2?1:.22):priority==='High'?(n<=3?1:.22):1}}/>)}</span>}
const viewLabels:Record<View,string>={my:'My issues',all:'All issues',board:'Board',projects:'Projects',inbox:'Inbox',cycles:'Cycles',initiatives:'Initiatives',team:'Team issues'};
const STORAGE='akom_ui_v01_issues';
const TEAM_STORAGE='akom_ui_v03_teams';
const PROJECT_STORAGE='akom_ui_v03_projects';
const PERSONA_STORAGE='akom_ui_v02_persona';
const THEME_STORAGE='akom_ui_v02_theme';
const formatMemberContext=(id:string|null)=>{const m=getMember(id);return m?`${m.name} · ${m.workspace}`:'Unassigned'};

function initialIssues():Issue[]{try{const v=localStorage.getItem(STORAGE);if(v){const data=JSON.parse(v);if(Array.isArray(data))return data;}}catch{/* ignore invalid prototype state */}return SEED;}
function readDemoItems<T>(key:string,fallback:T[]):T[]{try{const data=JSON.parse(localStorage.getItem(key)||'null');if(Array.isArray(data))return data;}catch{/* reset to sample data */}return fallback;}
function App(){
 const [issues,setIssues]=useState<Issue[]>(initialIssues);
 const [teams,setTeams]=useState<Team[]>(()=>readDemoItems(TEAM_STORAGE,INITIAL_TEAMS));
 const [projects,setProjects]=useState<Project[]>(()=>readDemoItems(PROJECT_STORAGE,PROJECTS));
 const [selectedTeam,setSelectedTeam]=useState('Media');
 const [teamModal,setTeamModal]=useState(false);
 const [projectModal,setProjectModal]=useState(false);
 const [view,setView]=useState<View>('my');
 const [viewer,setViewer]=useState(()=>{try{return localStorage.getItem(PERSONA_STORAGE)||'raka'}catch{return 'raka'}});
 const [personaOpen,setPersonaOpen]=useState(false);
 const [projectFilter,setProjectFilter]=useState<string|null>(null);
 const [dragging,setDragging]=useState<string|null>(null);
 const [dropStatus,setDropStatus]=useState<Status|null>(null);
 const [showShortcuts,setShowShortcuts]=useState(false);
 const [selected,setSelected]=useState<string|null>(null);
 const [createOpen,setCreateOpen]=useState(false);
 const [searchOpen,setSearchOpen]=useState(false);
 const [search,setSearch]=useState('');
 const [filter,setFilter]=useState('All');
 const [sort,setSort]=useState<'priority'|'recent'|'manual'>('priority');
 const [boardMode,setBoardMode]=useState(false);
 const [workspace,setWorkspace]=useState('All workspaces');
 const [workspaceOpen,setWorkspaceOpen]=useState(false);
 const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
 const [theme,setTheme]=useState<'dark'|'light'>(()=>{try{return localStorage.getItem(THEME_STORAGE)==='light'?'light':'dark'}catch{return 'dark'}});
 const [toast,setToast]=useState('');
 const [myTab,setMyTab]=useState<'Assigned'|'Created'|'Completed'>('Assigned');
 const [activityFeed,setActivityFeed]=useState<{id:string;body:string;time:string}[]>([{id:'MED-128',body:'Alina was assigned to MED-128',time:'2h ago'},{id:'DAT-084',body:'DAT-084 moved to In Review',time:'Yesterday'},{id:'MED-125',body:'New issue created in For You Experience',time:'Oct 17'}]);
 const [unread,setUnread]=useState(3);
 const [mobileOpen,setMobileOpen]=useState(false);
 const selectedIssue=issues.find(i=>i.id===selected)||null;
 const currentViewer=getMember(viewer)||MEMBERS[0];
 const projectSelected=projects.find(p=>p.id===projectFilter)||null;
 const notify=useCallback((msg:string)=>{setToast(msg);window.setTimeout(()=>setToast(''),3300)},[]);
 useEffect(()=>{try{localStorage.setItem(STORAGE,JSON.stringify(issues))}catch{/* storage optional */}},[issues]);
 useEffect(()=>{try{localStorage.setItem(TEAM_STORAGE,JSON.stringify(teams))}catch{/* optional */}},[teams]);
 useEffect(()=>{try{localStorage.setItem(PROJECT_STORAGE,JSON.stringify(projects))}catch{/* optional */}},[projects]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem(THEME_STORAGE,theme)}catch{/* optional */}},[theme]);
 useEffect(()=>{try{localStorage.setItem(PERSONA_STORAGE,viewer)}catch{/* optional */}},[viewer]);
 useEffect(()=>{
  const handler=(e:KeyboardEvent)=>{
   const editing=(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLElement&&e.target.isContentEditable));
   if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearchOpen(v=>!v);return;}
   if(e.key==='Escape'){setTeamModal(false);setProjectModal(false);setPersonaOpen(false);setShowShortcuts(false);setSelected(null);setCreateOpen(false);setSearchOpen(false);setWorkspaceOpen(false);return;}
   if(!editing&&!e.metaKey&&!e.ctrlKey&&e.key==='?'){e.preventDefault();setShowShortcuts(v=>!v);return;}
   if(!editing&&!e.metaKey&&!e.ctrlKey&&e.key.toLowerCase()==='c'){e.preventDefault();setCreateOpen(true)}
  };
  window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);
 },[]);
 const modify=useCallback((id:string,patch:Partial<Issue>)=>{setIssues(old=>old.map(i=>i.id===id?{...i,...patch}:i));},[]);
 const changeView=(v:View)=>{setView(v);setSelected(null);setMobileOpen(false);setFilter('All');setProjectFilter(null);setBoardMode(false);};
 const openProject=(id:string)=>{setProjectFilter(id);setView('all');setWorkspace('All workspaces');setSelected(null);setFilter('All');setMobileOpen(false);setBoardMode(false)};
  const moveToStatus=(id:string,status:Status)=>{modify(id,{status});setDragging(null);setDropStatus(null);notify(`${id} moved to ${status}`)};
  const reorderIssue=(id:string,targetId:string|null,status:Status,after=false)=>{
   if(id===targetId)return;
   setIssues(old=>{const moving=old.find(i=>i.id===id);if(!moving)return old;const next=old.filter(i=>i.id!==id);const index=targetId?next.findIndex(i=>i.id===targetId):-1;next.splice(index<0?next.length:index+(after?1:0),0,{...moving,status});return next;});
   setSort('manual');notify(targetId?`${id} reordered in ${status}`:`${id} moved to ${status}`);
  };
  const createTeam=(data:{name:string;workspace:string;prefix:string})=>{const id=data.prefix.toUpperCase();if(teams.some(t=>t.id===id||t.prefix===id)){notify('Team identifier already exists');return;}setTeams(old=>[...old,{id,name:data.name,workspace:data.workspace,prefix:id,color:'#9586e4'}]);setSelectedTeam(id);setWorkspace('All workspaces');setView('team');setTeamModal(false);notify(`Team ${data.name} created`);};
  const createProject=(data:{name:string;description:string;team:string})=>{const team=teams.find(t=>t.id===data.team);if(!team)return;const id='project-'+Date.now().toString(36);setProjects(old=>[...old,{id,name:data.name,description:data.description,team:team.id,color:'#a18ff1',icon:'◈',progress:0}]);setProjectModal(false);openProject(id);notify(`Project ${data.name} created`);};
 const addIssue=(values:{title:string;description:string;status:Status;priority:Priority;assignee:string|null;workspace:string;project:string;team:string})=>{
   const ownerTeam=teams.find(t=>t.id===values.team)||teams.find(t=>t.workspace===values.workspace)||teams[0];
   const prefix=ownerTeam?.prefix||'AKOM';
  const nums=issues.filter(i=>i.id.startsWith(prefix+'-')).map(i=>Number(i.id.split('-')[1]));
  const newId=`${prefix}-${String(Math.max(0,...nums)+1).padStart(3,'0')}`;
  const created:Issue={...values,id:newId,team:values.team,creator:viewer,labels:[],created:'Today',comments:[]};
  setIssues(old=>[created,...old]);setActivityFeed(old=>[{id:newId,body:`${newId} created in ${values.workspace}`,time:'Just now'},...old]);setCreateOpen(false);setSelected(newId);notify(`${newId} created successfully`);
 };
 const filtered=useMemo(()=>{
  let pool=issues.filter(i=>workspace==='All workspaces'||i.workspace===workspace);
  if(view==='my')pool=pool.filter(i=>myTab==='Assigned'?i.assignee===viewer&&i.status!=='Done'&&i.status!=='Canceled':myTab==='Created'?i.creator===viewer:i.assignee===viewer&&i.status==='Done');
  if(projectFilter&&view==='all')pool=pool.filter(i=>i.project===projectFilter);
  if(view==='team')pool=pool.filter(i=>i.team===selectedTeam);
  if(view==='board')pool=pool.filter(i=>i.status!=='Canceled');
  if(filter==='Active')pool=pool.filter(i=>i.status!=='Done'&&i.status!=='Canceled');
  else if(filter==='High priority')pool=pool.filter(i=>['Urgent','High'].includes(i.priority));
  else if(filter==='Unassigned')pool=pool.filter(i=>!i.assignee);
  const order:Record<Priority,number>={Urgent:0,High:1,Medium:2,Low:3,None:4};
  if(sort==='priority')pool=[...pool].sort((a,b)=>order[a.priority]-order[b.priority]);
  return pool;
 },[issues,workspace,view,myTab,filter,sort,viewer,projectFilter,selectedTeam]);
 const activeCount=issues.filter(i=>i.assignee===viewer&&i.status!=='Done'&&i.status!=='Canceled').length;
 const title=projectSelected&&view==='all'?projectSelected.name:view==='team'?(teams.find(t=>t.id===selectedTeam)?.name||'Team issues'):viewLabels[view];
 return <div className="app">
  {mobileOpen&&<button aria-label="Close menu" className="mobile-shade" onClick={()=>setMobileOpen(false)}/>}
  <aside className={`sidebar ${sidebarCollapsed?'side-collapsed':''} ${mobileOpen?'mobile-open':''}`}>
    <div className="brand-area">
      <button className="workspace-switch" onClick={()=>setWorkspaceOpen(o=>!o)} title="Switch workspace">
       <span className="brand-symbol"><span className="brand-mark">a</span></span>
       {!sidebarCollapsed&&<><span className="brand-title">AKOM <span className="brand-chevron"><ChevronDown size={13}/></span></span><span className="brand-plan">PROTOTYPE</span></>}
      </button>
      {!sidebarCollapsed&&<button className="square-icon brand-toggle" title="Collapse sidebar" onClick={()=>setSidebarCollapsed(true)}><PanelLeftClose size={16}/></button>}
    </div>
    {sidebarCollapsed?<button className="square-icon expand-button" title="Expand sidebar" onClick={()=>setSidebarCollapsed(false)}><PanelLeftOpen size={17}/></button>:null}
    {!sidebarCollapsed&&<div className="search-trigger" onClick={()=>setSearchOpen(true)} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&setSearchOpen(true)}><Search size={15}/><span>Search anything...</span><kbd>⌘ K</kbd></div>}
    <nav className="sidebar-nav">
     <div className="nav-group nav-personal">
      <NavButton label="My issues" icon={<CircleDot size={17}/>} selected={view==='my'} onClick={()=>changeView('my')} count={activeCount} collapsed={sidebarCollapsed}/>
      <NavButton label="Inbox" icon={<Inbox size={17}/>} selected={view==='inbox'} onClick={()=>changeView('inbox')} count={unread||undefined} collapsed={sidebarCollapsed}/>
      <NavButton label="Projects" icon={<LayoutGrid size={17}/>} selected={view==='projects'} onClick={()=>changeView('projects')} collapsed={sidebarCollapsed}/>
      <NavButton label="Initiatives" icon={<Target size={17}/>} selected={view==='initiatives'} onClick={()=>changeView('initiatives')} collapsed={sidebarCollapsed}/>
     </div>
     <div className="nav-group team-group">
      {!sidebarCollapsed&&<div className="nav-heading"><span>YOUR TEAMS</span><button className='nav-add-button' aria-label='Add team' title='Add team' onClick={()=>setTeamModal(true)}><Plus size={14}/></button></div>}
             {teams.map(t=><button key={t.id} className={`team-name team-switcher ${view==='team'&&selectedTeam===t.id?'team-current':''}`} title={`Open ${t.name}`} onClick={()=>{setSelectedTeam(t.id);setWorkspace('All workspaces');changeView('team')}}><span className="team-icon" style={{borderColor:t.color,color:t.color}}>{t.prefix[0]}</span>{!sidebarCollapsed&&<><b>{t.name}</b><ChevronRight size={13} className="muted ml-auto"/></>}</button>)}
<div className="team-links">
       <NavButton label="All issues" icon={<List size={16}/>} selected={view==='all'} onClick={()=>changeView('all')} collapsed={sidebarCollapsed}/>
       <NavButton label="Board" icon={<LayoutGrid size={16}/>} selected={view==='board'} onClick={()=>changeView('board')} collapsed={sidebarCollapsed}/>
       <NavButton label="Cycles" icon={<Clock3 size={16}/>} selected={view==='cycles'} onClick={()=>changeView('cycles')} collapsed={sidebarCollapsed}/>
      </div>
      {!sidebarCollapsed&&<div className="nav-heading nav-heading-projects"><span>PROJECTS</span><button className='nav-add-button' title='Add project' aria-label='Add project' onClick={()=>setProjectModal(true)}><Plus size={14}/></button></div>}
      {projects.slice(0,5).map(p=><button key={p.id} className="project-link" title={p.name} onClick={()=>openProject(p.id)}><span className="project-symbol" style={{color:p.color}}>{p.icon}</span>{!sidebarCollapsed&&<span>{p.name}</span>}</button>)}
     </div>
    </nav>
    <div className="sidebar-bottom">
     {!sidebarCollapsed&&<div className="sidebar-hint"><Sparkles size={14}/><span>A better way to work.</span></div>}
     <button className="profile-row" onClick={()=>setPersonaOpen(v=>!v)} title="Switch demo member"><Avatar id={viewer} size={29}/>{!sidebarCollapsed&&<><div className="profile-info"><strong>{currentViewer.name}</strong><span>{currentViewer.workspace}</span></div><ChevronDown size={15}/></>}</button>
     {personaOpen&&<div className="persona-popover"><div className="popover-label">PREVIEW AS A TEAM MEMBER</div><p className="persona-caption">Switch identities to test cross-workspace assignments.</p>{MEMBERS.map(m=><button key={m.id} className={`persona-option ${viewer===m.id?'current':''}`} onClick={()=>{setViewer(m.id);setPersonaOpen(false);setWorkspace('All workspaces');setMyTab('Assigned');changeView('my');notify(`Previewing as ${m.name}`)}}><Avatar id={m.id} size={28}/><span><strong>{m.name}</strong><small>{m.workspace}</small></span>{viewer===m.id&&<Check size={15}/>}</button>)}<div className="persona-footer"><span>DEMO ONLY · No real authentication</span><button type="button" className="reset-demo" onClick={()=>{if(window.confirm("Reset all demo issues, teams, projects and comments to their original state?")){setIssues(SEED.map(i=>({...i,comments:i.comments.map(c=>({...c}))})));setTeams(INITIAL_TEAMS);setProjects(PROJECTS);setSelectedTeam('Media');setProjectFilter(null);setActivityFeed([{id:'MED-128',body:'Alina was assigned to MED-128',time:'2h ago'},{id:'DAT-084',body:'DAT-084 moved to In Review',time:'Yesterday'}]);setUnread(2);setPersonaOpen(false);setSelected(null);notify("Demo data restored")}}}>Reset demo data</button></div></div>}
    </div>
    {workspaceOpen&&<div className="workspace-popover"><div className="popover-label">VIEW WORKSPACE</div>{['All workspaces','Product Media','Product Data','Design Studio','Commerce'].map(w=><button key={w} className={`workspace-option ${workspace===w?'current':''}`} onClick={()=>{setWorkspace(w);setWorkspaceOpen(false)}}><span className="mini-workspace-icon">{w==='All workspaces'?'◎':w.split(' ').map(s=>s[0]).join('')}</span>{w}{workspace===w&&<Check size={14}/>}</button>)}<div className="workspace-footnote">Global directory · Cross-workspace enabled</div></div>}
  </aside>
  <main className="main">
   <header className="topbar"><div className="breadcrumbs"><button className="square-icon mobile-menu" onClick={()=>setMobileOpen(true)}><Menu size={18}/></button><span className="breadcrumb-workspace">AKOM</span><ChevronRight size={14} className="muted"/><span className="breadcrumb-current">{title}</span></div><div className="top-actions"><span className="top-meta"><span className="live-dot"/> UI preview v0.3</span><button title="Search" className="square-icon" onClick={()=>setSearchOpen(true)}><Search size={17}/></button><button title="Theme" className="square-icon" onClick={()=>setTheme(v=>v==='dark'?'light':'dark')}>{theme==='dark'?<Sun size={16}/>:<Moon size={16}/>}</button><div className="top-divider"/><button className="top-profile" title={`Viewing as ${currentViewer.name} — switch from sidebar`} onClick={()=>setPersonaOpen(v=>!v)}><Avatar id={viewer} size={27}/></button></div></header>
   <div className={`content ${view==='board'||boardMode?'content-board':''}`}>
    {view==='inbox'?<><PageTitle eyebrow="STAY UP TO DATE" title="Inbox" subtitle="Updates that need your attention."/><div className="inbox-toolbar"><span className="section-title">Recent activity <span className="count-pill">{activityFeed.length}</span></span><button className="light-button" onClick={()=>{setUnread(0);notify('All notifications marked as read')}}><CheckCheck size={15}/> Mark all read</button></div><div className="activity-list">{activityFeed.map((a,idx)=><button key={idx} className="activity-row" onClick={()=>{setSelected(a.id);setUnread(Math.max(0,unread-1))}}><span className="activity-icon"><Bell size={16}/></span><span><strong>{a.body}</strong><small>{a.time}</small></span><ChevronRight size={15} className="muted"/></button>)}</div></>:
    view==='projects'?<><div className='entity-page-header'><PageTitle eyebrow="TEAM COLLABORATION" title="Projects" subtitle="Every project, one clear direction."/><button className='primary-button' onClick={()=>setProjectModal(true)}><Plus size={16}/> New project</button></div><div className="projects-grid">{projects.map(p=><button className="project-card" key={p.id} onClick={()=>openProject(p.id)}><div className="project-card-top"><span className="project-card-symbol" style={{color:p.color}}>{p.icon}</span><Ellipsis size={17} className="muted"/></div><strong>{p.name}</strong><p>{p.description}</p><div className="project-card-footer"><span>{p.team} team</span><span>{p.progress}% complete</span></div><div className="progress-rail"><div style={{width:`${p.progress}%`,background:p.color}}/></div></button>)}</div></>:
    view==='initiatives'?<><PageTitle eyebrow="BIG-PICTURE PLANNING" title="Initiatives" subtitle="Connect the work to the outcomes that matter."/><div className="placeholder-surface"><span className="placeholder-icon"><Target size={23}/></span><h3>One direction. Every team.</h3><p>Plan strategic initiatives and connect projects across workspaces. Coming after our core issue workflows.</p><button className="light-button" onClick={()=>changeView('projects')}>Explore projects <ArrowRight size={15}/></button></div></>:
    view==='cycles'?<><PageTitle eyebrow="WORK IN PROGRESS" title="Cycles" subtitle="Stay focused on what matters this week."/><div className="cycles-header"><div><span className="eyebrow">CURRENT CYCLE</span><h2>Cycle 42 <span className="cycle-live">Active</span></h2><p>Oct 19 – Nov 1 · 12 days remaining</p></div><div className="cycle-progress"><span>64% complete</span><div className="progress-rail"><div style={{width:'64%',background:'#9f91ee'}}/></div></div></div><IssueList issues={filtered} title="Cycle issues" onOpen={setSelected} onChange={modify} onMove={reorderIssue} showWorkspace={true} empty="No issues in this view."/></>:
    <>
      <div className="page-head"><div className="page-heading"><span className="eyebrow">{view==='my'?`YOUR WORKSPACE · ${currentViewer.name.toUpperCase()}`:projectSelected?'PROJECT ISSUES':view==='board'?'TEAM WORKFLOW':'ISSUE TRACKING'}</span><h1>{title}<span className="page-title-icon">{view==='my'?<CircleDot size={21}/>:view==='board'?<LayoutGrid size={22}/>:<List size={21}/>}</span></h1><p>{view==='my'?`Assigned to ${currentViewer.name}, across all workspaces.`:projectSelected?`All work connected to ${projectSelected.name}.`:view==='board'?'Move issues between statuses, without losing context.':'All your team’s work, clearly organized.'}</p></div><button className="primary-button" onClick={()=>setCreateOpen(true)}><Plus size={17}/> New issue <kbd>C</kbd></button></div>
      {projectSelected&&view==='all'&&<div className="project-filter-banner"><span className="project-symbol" style={{color:projectSelected.color}}>{projectSelected.icon}</span><span>Showing issues in <strong>{projectSelected.name}</strong></span><button onClick={()=>setProjectFilter(null)}><X size={14}/> Clear project</button></div>}
      {view==='my'&&<div className="tabs">{(['Assigned','Created','Completed'] as const).map(t=><button key={t} className={myTab===t?'active':''} onClick={()=>setMyTab(t)}>{t}{t==='Assigned'&&<span className="tab-count">{activeCount}</span>}</button>)}</div>}
      <div className="list-toolbar"><div className="left-tools"><div className="filter-wrap"><Filter size={15}/><select aria-label="Filter issues" value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Active</option><option>High priority</option><option>Unassigned</option></select><ChevronDown size={12}/></div><span className="toolbar-separator"/><div className="filter-wrap"><Layers2 size={15}/><select aria-label="Select workspace" value={workspace} onChange={e=>setWorkspace(e.target.value)}><option>All workspaces</option><option>Product Media</option><option>Product Data</option><option>Design Studio</option><option>Commerce</option></select><ChevronDown size={12}/></div></div><div className="right-tools"><button className="toolbar-button" title="Sort" onClick={()=>setSort(v=>v==='priority'?'recent':v==='recent'?'manual':'priority')}><ArrowDownUp size={16}/><span>{sort==='priority'?'Priority':sort==='recent'?'Recent':'Manual'}</span></button><button className="toolbar-button" title="Toggle list or board" onClick={()=>setBoardMode(v=>!v)}>{view==='board'||boardMode?<List size={16}/>:<LayoutGrid size={16}/>}<span>{view==='board'||boardMode?'List':'Board'}</span></button></div></div>
      {view==='board'||boardMode?<div className="kanban">{STATUS.filter(s=>s!=='Canceled').map(s=><div className={`kanban-col ${dropStatus===s?'kanban-drop-active':''}`} key={s} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='move';setDropStatus(s)}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setDropStatus(null)}} onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain')||dragging;if(id&&issues.some(i=>i.id===id))moveToStatus(id,s)}}><div className="kanban-head"><StatusIcon status={s}/><span>{s}</span><span className="count-pill">{filtered.filter(i=>i.status===s).length}</span><button onClick={()=>setCreateOpen(true)} className="bare-icon"><Plus size={15}/></button></div><div className="kanban-stack">{filtered.filter(i=>i.status===s).map(i=><button key={i.id} draggable className={`kanban-card ${dragging===i.id?'kanban-dragging':''}`} onDragStart={e=>{e.dataTransfer.setData('text/plain',i.id);e.dataTransfer.effectAllowed='move';setDragging(i.id)}} onDragEnd={()=>{setDragging(null);setDropStatus(null)}} onClick={()=>setSelected(i.id)}><div className="kanban-id">{i.id}<PriorityIcon priority={i.priority}/></div><div className="kanban-title">{i.title}</div><div className="kanban-card-foot"><div className="tagline">{i.labels.slice(0,1).map(l=><span key={l} className="tag">{l}</span>)}</div><Avatar id={i.assignee} size={24}/></div></button>)}{filtered.filter(i=>i.status===s).length===0&&<div className="empty-column">No issues here</div>}</div></div>)}</div>:<IssueList issues={filtered} title={view==='my'?(myTab==='Assigned'?'Assigned to you':myTab==='Created'?'Created by you':'Completed by you'):'All issues'} onOpen={setSelected} onChange={modify} onMove={reorderIssue} showWorkspace={true} empty={view==='my'?'Nothing here yet. Create an issue or switch views.':'No issues match your filters.'}/>}
      <div className="worklist-foot"><span>Showing {filtered.length} issues</span><button className="shortcut-trigger" onClick={()=>setShowShortcuts(true)}><Keyboard size={14}/> Press <kbd>C</kbd> to create · <kbd>⌘ K</kbd> to search · <kbd>?</kbd> shortcuts</button></div>
    </>}
   </div>
  </main>
  {selectedIssue&&<IssuePanel projects={projects} issue={selectedIssue} viewer={viewer} onClose={()=>setSelected(null)} onUpdate={(p)=>modify(selectedIssue.id,p)} onNotify={notify} />}
  {createOpen&&<CreateModal teams={teams} projects={projects} onClose={()=>setCreateOpen(false)} onCreate={addIssue} />}
  {teamModal&&<NewTeamModal teams={teams} onClose={()=>setTeamModal(false)} onCreate={createTeam}/>}
   {projectModal&&<NewProjectModal teams={teams} onClose={()=>setProjectModal(false)} onCreate={createProject}/>}
   {searchOpen&&<SearchDialog issues={issues} query={search} onQuery={setSearch} onClose={()=>setSearchOpen(false)} onIssue={id=>{setSelected(id);setSearchOpen(false);setSearch('')}} onNew={()=>{setSearchOpen(false);setCreateOpen(true)}}/>}
  {showShortcuts&&<div className="overlay modal-overlay" onMouseDown={e=>e.target===e.currentTarget&&setShowShortcuts(false)}><section className="shortcuts-dialog" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"><div className="shortcuts-head"><h2>Keyboard shortcuts</h2><button className="square-icon" aria-label="Close shortcuts" onClick={()=>setShowShortcuts(false)}><X size={17}/></button></div><p>Move around AKOM without leaving the keyboard.</p>{[['C','Create an issue'],['⌘ / Ctrl + K','Search issues'],['?','Open keyboard shortcuts'],['Esc','Close an overlay']].map(([key,description])=><div className="shortcut-row" key={key}><span>{description}</span><kbd>{key}</kbd></div>)}</section></div>}
  {toast&&<div className="toast"><span className="toast-check"><Check size={13}/></span>{toast}</div>}
 </div>;
}
function NavButton({label,icon,selected,onClick,count,collapsed}:{label:string;icon:ReactNode;selected:boolean;onClick:()=>void;count?:number;collapsed?:boolean}){return <button className={`nav-button ${selected?'selected':''}`} onClick={onClick} title={label}><span className="nav-icon">{icon}</span>{!collapsed&&<><span>{label}</span>{count!==undefined&&count>0&&<span className="nav-count">{count}</span>}</>}</button>}
function PageTitle({eyebrow,title,subtitle}:{eyebrow:string;title:string;subtitle:string}){return <div className="page-head"><div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div></div>}
function IssueList({issues,title,onOpen,onChange,onMove,showWorkspace,empty}:{issues:Issue[];title:string;onOpen:(id:string)=>void;onChange:(id:string,patch:Partial<Issue>)=>void;onMove:(id:string,targetId:string|null,status:Status,after?:boolean)=>void;showWorkspace:boolean;empty:string}){
 const groups:Status[]=[...ACTIVE,'Done','Canceled'];
 const [collapsed,setCollapsed]=useState<string[]>([]);
 const [dragging,setDragging]=useState<string|null>(null);
 const [drop,setDrop]=useState<{id:string;after:boolean}|null>(null);
 const [dropGroup,setDropGroup]=useState<Status|null>(null);
 const clear=()=>{setDragging(null);setDrop(null);setDropGroup(null)};
 const dataId=(e:DragEvent)=>e.dataTransfer.getData('text/plain')||dragging;
 return <div className="issue-list" aria-label={title}>
 {groups.filter(s=>dragging||issues.some(i=>i.status===s)).map(s=>{const items=issues.filter(i=>i.status===s);return <section className={`issue-group ${dropGroup===s?'issue-group-drop':''}`} key={s}
 onDragOver={e=>{if(!dragging)return;e.preventDefault();e.dataTransfer.dropEffect='move';setDropGroup(s)}}
 onDrop={e=>{e.preventDefault();if(e.target instanceof Element && e.target.closest('.issue-row'))return;const id=dataId(e);if(id&&issues.some(i=>i.id===id))onMove(id,null,s);clear()}}>
 <button className="group-heading" onClick={()=>setCollapsed(a=>a.includes(s)?a.filter(x=>x!==s):[...a,s])}><ChevronDown size={16} className={collapsed.includes(s)?'chevron-collapsed':''}/><StatusIcon status={s}/><strong>{s}</strong><span className="count-pill">{items.length}</span><span className="group-drop-note">Drop here to move to {s}</span></button>
 {!collapsed.includes(s)&&items.map(i=><div className={`issue-row ${dragging===i.id?'issue-row-dragging':''} ${drop?.id===i.id?(drop.after?'issue-row-drop-after':'issue-row-drop-before'):''}`} key={i.id} draggable
 onDragStart={e=>{e.dataTransfer.setData('text/plain',i.id);e.dataTransfer.effectAllowed='move';setDragging(i.id)}}
 onDragEnd={clear}
 onDragOver={e=>{e.preventDefault();e.stopPropagation();if(dragging && dragging!==i.id){const box=e.currentTarget.getBoundingClientRect();setDrop({id:i.id,after:e.clientY>box.top+box.height/2});setDropGroup(s)}}}
 onDrop={e=>{e.preventDefault();e.stopPropagation();const id=dataId(e);if(id&&id!==i.id&&issues.some(issue=>issue.id===id))onMove(id,i.id,s,e.clientY>e.currentTarget.getBoundingClientRect().top+e.currentTarget.getBoundingClientRect().height/2);clear()}}
 onClick={()=>{if(!dragging)onOpen(i.id)}} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&onOpen(i.id)}>
 <GripVertical className="row-drag-handle" size={15} aria-label="Drag to reorder"/><span className="issue-status" onClick={e=>e.stopPropagation()}><select value={i.status} title="Change status" aria-label={`Status for ${i.id}`} onChange={e=>onChange(i.id,{status:e.target.value as Status})}>{STATUS.map(x=><option key={x}>{x}</option>)}</select><StatusIcon status={i.status}/></span><span className="issue-id">{i.id}</span><span className="issue-title">{i.title}</span><div className="issue-metadata">{i.labels.length>0&&<span className="issue-tag">{i.labels[0]}</span>}{showWorkspace&&<span className="issue-workspace">{i.workspace}</span>}<PriorityIcon priority={i.priority}/><Avatar id={i.assignee} size={24}/></div></div>)}
 {!items.length&&dragging&&<div className="drop-empty-row">Drop an issue here</div>}
 </section>})}
 {issues.length===0&&<div className="empty-results"><CircleDashed size={27}/><strong>No matching issues</strong><span>{empty}</span></div>}
 </div>;
}
function AssigneePicker({value,onPick,compact=false}:{value:string|null;onPick:(id:string|null)=>void;compact?:boolean}){
 const [open,setOpen]=useState(false);const [q,setQ]=useState('');
 const trigger=useRef<HTMLDivElement>(null);const popup=useRef<HTMLDivElement>(null);
 const [position,setPosition]=useState({top:0,left:0,width:303});
 useEffect(()=>{if(!open)return;
  function reposition(){const bounds=trigger.current?.getBoundingClientRect();if(!bounds)return;const width=Math.min(320,window.innerWidth-24);setPosition({width,left:Math.max(12,Math.min(bounds.right-width,window.innerWidth-width-12)),top:bounds.bottom+372>window.innerHeight&&bounds.top>372?Math.max(12,bounds.top-377):Math.min(window.innerHeight-120,bounds.bottom+6)});}
  function outside(e:MouseEvent){const target=e.target as Node;if(!trigger.current?.contains(target)&&!popup.current?.contains(target))setOpen(false)}
  reposition();document.addEventListener('mousedown',outside);window.addEventListener('resize',reposition);window.addEventListener('scroll',reposition,true);
  return()=>{document.removeEventListener('mousedown',outside);window.removeEventListener('resize',reposition);window.removeEventListener('scroll',reposition,true)};
 },[open]);
 const filtered=MEMBERS.filter(m=>`${m.name} ${m.workspace} ${m.role}`.toLowerCase().includes(q.toLowerCase()));
 const workspaces=[...new Set(filtered.map(m=>m.workspace))];
 const choose=(id:string|null)=>{onPick(id);setOpen(false);setQ('')};
 return <div className="assignee-root" ref={trigger}><button type="button" aria-expanded={open} aria-label="Change assignee" className={`property-value ${compact?'property-compact':''}`} onClick={()=>setOpen(v=>!v)}><Avatar id={value} size={22}/><span>{getMember(value)?.name||'Unassigned'}</span><ChevronDown size={12} className="muted"/></button>
 {open&&createPortal(<div ref={popup} className="assignee-popover assignee-portal" style={position}><div className="picker-header"><Search size={16}/><input autoFocus placeholder="Search anyone in the organization..." value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setOpen(false)}}}/></div><div className="picker-meta"><Users size={13}/> GLOBAL ORGANIZATION DIRECTORY</div><div className="picker-options"><button type="button" className="picker-member" onClick={()=>choose(null)}><Avatar id={null} size={27}/><span className="member-details"><b>Unassigned</b><small>No owner</small></span>{value===null&&<Check size={15}/>}</button>{workspaces.map(w=><div key={w}><div className="picker-group">{w}</div>{filtered.filter(m=>m.workspace===w).map(m=><button type="button" className="picker-member" key={m.id} onClick={()=>choose(m.id)}><Avatar id={m.id} size={28}/><span className="member-details"><b>{m.name}</b><small>{m.role}</small></span>{m.id===value&&<Check size={15} className="accent"/>}</button>)}</div>)}{!filtered.length&&<div className="picker-no-results">No members found</div>}</div><div className="picker-footer"><Zap size={13}/> Assign across workspaces · Demo mode</div></div>,document.body)}
 </div>;
}
function PopSelect<T extends string>({value,options,onChange,display}: {value:T;options:readonly T[];onChange:(v:T)=>void;display?:(v:T)=>ReactNode}){const [open,setOpen]=useState(false);const wrap=useRef<HTMLDivElement>(null);useEffect(()=>{if(!open)return;const h=(e:MouseEvent)=>{if(wrap.current&&!wrap.current.contains(e.target as Node))setOpen(false)};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h)},[open]);return <div className="popover-root" ref={wrap}><button type="button" className="property-value" onClick={()=>setOpen(v=>!v)}>{display?display(value):value}<ChevronDown size={12} className="muted"/></button>{open&&<div className="simple-popover">{options.map(o=><button key={o} onClick={()=>{onChange(o);setOpen(false)}}>{display?display(o):o}{o===value&&<Check size={14} className="accent"/>}</button>)}</div>}</div>}
function IssuePanel({issue,projects,viewer,onClose,onUpdate,onNotify}:{issue:Issue;projects:Project[];viewer:string;onClose:()=>void;onUpdate:(patch:Partial<Issue>)=>void;onNotify:(s:string)=>void}){
 const [comment,setComment]=useState('');const [editing,setEditing]=useState(false);const [title,setTitle]=useState(issue.title);const [editingDescription,setEditingDescription]=useState(false);const [description,setDescription]=useState(issue.description);
 useEffect(()=>{setTitle(issue.title);setDescription(issue.description);setEditing(false);setEditingDescription(false)},[issue.id,issue.title,issue.description]);
 const saveComment=(e:FormEvent)=>{e.preventDefault();if(!comment.trim())return;onUpdate({comments:[...issue.comments,{by:viewer,body:comment.trim(),time:'Just now'}]});setComment('');onNotify('Comment added')};
 return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="issue-panel" role="dialog" aria-modal="true" aria-label={`Issue ${issue.id}`}>
  <div className="panel-top"><div className="panel-breadcrumb"><span className="small-team-symbol">{issue.team[0]}</span><span>{issue.team}</span><ChevronRight size={14}/><span className="panel-id">{issue.id}</span><button type="button" className="panel-copy" title="Copy issue ID" aria-label="Copy issue ID" onClick={()=>{void navigator.clipboard?.writeText(issue.id);onNotify('Issue ID copied')}}><Copy size={13}/></button></div><div className="panel-actions"><span className="prototype-badge">LOCAL DEMO · V0.3</span><button className="square-icon" title="Close" onClick={onClose}><X size={18}/></button></div></div>
  <div className="panel-layout"><div className="panel-content"><div className="panel-main-top"><span className="subtle-label">WORK ITEM · {issue.workspace.toUpperCase()}</span><span className="created-note">Created {issue.created}</span></div>{editing?<input autoFocus className="issue-title-edit" value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){onUpdate({title:title.trim()||issue.title});setEditing(false)}if(e.key==='Escape')setEditing(false)}} onBlur={()=>{onUpdate({title:title.trim()||issue.title});setEditing(false)}}/>:<h2 className="panel-issue-title"><button className="editable-title" onClick={()=>setEditing(true)} title="Edit issue title">{issue.title}<Pencil size={15}/></button></h2>}
   <div className="panel-desc"><div className="panel-block-heading"><AlignLeft size={17}/><span>Description</span><button className="bare-icon" onClick={()=>setEditingDescription(true)} title="Edit description"><Pencil size={14}/></button></div>{editingDescription?<div className="edit-description"><textarea autoFocus rows={8} value={description} onChange={e=>setDescription(e.target.value)}/><div><button className="light-button" onClick={()=>setEditingDescription(false)}>Cancel</button><button className="primary-button" onClick={()=>{onUpdate({description});setEditingDescription(false);onNotify('Description saved')}}>Save</button></div></div>:<div className="description-text" onClick={()=>setEditingDescription(true)}>{issue.description?issue.description.split('\n').map((p,i)=><p key={i}>{p||'\u00a0'}</p>):<span className="muted">Add a description...</span>}</div>}</div>
   <div className="panel-subissues"><div className="panel-block-heading"><CornerDownRight size={17}/><span>Sub-issues</span><span className="count-pill">0</span><button className="bare-icon" title="Sub-issues are coming in a later prototype" onClick={()=>onNotify('Sub-issues are coming in a later prototype')}><Plus size={16}/></button></div><div className="subissues-empty">Break this issue into smaller pieces of work.</div></div>
   <div className="activity-title"><Activity size={17}/><span>Activity</span><span className="count-pill">{issue.comments.length}</span></div><div className="timeline"><div className="timeline-item"><span className="timeline-circle"><Check size={11}/></span><span><strong>{getMember(issue.creator)?.name}</strong> created this issue</span><small>{issue.created}</small></div>{issue.comments.map((c,idx)=><div className="comment-block" key={idx}><Avatar id={c.by} size={30}/><div><div className="comment-meta"><strong>{getMember(c.by)?.name}</strong><span>{c.time}</span></div><p>{c.body}</p></div></div>)}</div>
   <form className="comment-box" onSubmit={saveComment}><Avatar id={viewer} size={27}/><div className="comment-input-wrap"><textarea placeholder="Leave a comment..." value={comment} rows={2} onChange={e=>setComment(e.target.value)}/><div className="comment-actions"><span>Write an update for your team</span><button className="comment-send" disabled={!comment.trim()} title="Post comment"><ArrowUpRight size={17}/></button></div></div></form>
  </div><aside className="property-sidebar"><div className="property-heading">Properties <MoreHorizontal size={16}/></div><div className="property-list"><div className="property-block"><label>Status</label><PopSelect value={issue.status} options={STATUS} onChange={status=>onUpdate({status})} display={s=><span className="property-display"><StatusIcon status={s}/>{s}</span>}/></div><div className="property-block"><label>Priority</label><PopSelect value={issue.priority} options={PRIORITIES} onChange={priority=>onUpdate({priority})} display={p=><span className="property-display"><PriorityIcon priority={p}/>{p==='None'?'No priority':p}</span>}/></div><div className="property-block"><label>Assignee</label><AssigneePicker value={issue.assignee} onPick={assignee=>{onUpdate({assignee});onNotify(assignee?`Assigned to ${getMember(assignee)?.name}`:'Issue unassigned')}}/></div></div><div className="properties-divider"/><div className="property-block"><label>Project</label><div className="property-static"><Folder size={16} className="muted"/>{projects.find(p=>p.id===issue.project)?.name||'No project'}</div></div><div className="property-block"><label>Workspace</label><div className="property-static"><Layers2 size={16} className="muted"/>{issue.workspace}</div></div><div className="property-block"><label>Labels</label><div className="property-tags">{issue.labels.length?issue.labels.map(l=><span key={l} className="detail-tag">{l}</span>):<span className="muted">None</span>}</div></div><div className="property-block"><label>Due date</label><div className="property-static"><CalendarDays size={16} className="muted"/><input className="date-property" type="date" aria-label="Due date" value={issue.due&&/^\d{4}-\d{2}-\d{2}$/.test(issue.due)?issue.due:''} onChange={e=>onUpdate({due:e.target.value})}/></div></div><div className="properties-divider"/><div className="security-note"><span><Zap size={14}/> CROSS-WORKSPACE READY</span><p>{issue.assignee&&getMember(issue.assignee)?.workspace!==issue.workspace?`${formatMemberContext(issue.assignee)} has been assigned across workspaces.`:'Assign any member of this organization, regardless of workspace.'} This prototype does not enforce production permissions.</p></div></aside></div>
 </div></div>;
}
function CreateModal({teams,projects,onClose,onCreate}:{teams:Team[];projects:Project[];onClose:()=>void;onCreate:(v:{title:string;description:string;status:Status;priority:Priority;assignee:string|null;workspace:string;project:string;team:string})=>void}){
 const [title,setTitle]=useState('');const [description,setDescription]=useState('');const [status,setStatus]=useState<Status>('Backlog');const [priority,setPriority]=useState<Priority>('None');const [assignee,setAssignee]=useState<string|null>(null);
 const [teamId,setTeamId]=useState(teams[0]?.id||'Media');const currentTeam=teams.find(t=>t.id===teamId)||teams[0];const matchingProjects=projects.filter(p=>p.team===teamId);
 const [project,setProject]=useState(projects.find(p=>p.team===teamId)?.id||'');
 const submit=(e:FormEvent)=>{e.preventDefault();if(!title.trim()||!currentTeam)return;onCreate({title:title.trim(),description:description.trim(),status,priority,assignee,workspace:currentTeam.workspace,team:teamId,project:project===''?'':matchingProjects.some(p=>p.id===project)?project:''})};
 return <div className="overlay modal-overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><form className="create-modal" role="dialog" aria-modal="true" aria-label="Create issue" onSubmit={submit}><div className="create-header"><div><span className="small-team-symbol">{currentTeam?.prefix[0]||'A'}</span><select value={teamId} onChange={e=>{setTeamId(e.target.value);setProject(projects.find(p=>p.team===e.target.value)?.id||'')}} aria-label="Owning team">{teams.map(t=><option key={t.id} value={t.id}>{t.name} ({t.prefix})</option>)}</select><ChevronRight size={14} className="muted"/><span>New issue</span></div><button type="button" className="square-icon" onClick={onClose} title="Close"><X size={17}/></button></div><div className="create-body"><input autoFocus className="create-title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Issue title" maxLength={180}/><textarea className="create-description" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Add a description..." rows={4}/><div className="create-props"><div className="create-select-wrap"><StatusIcon status={status}/><select value={status} onChange={e=>setStatus(e.target.value as Status)} aria-label="Issue status">{STATUS.map(s=><option key={s}>{s}</option>)}</select><ChevronDown size={12}/></div><div className="create-select-wrap"><PriorityIcon priority={priority}/><select value={priority} onChange={e=>setPriority(e.target.value as Priority)} aria-label="Issue priority">{PRIORITIES.map(p=><option key={p} value={p}>{p==='None'?'Priority':p}</option>)}</select><ChevronDown size={12}/></div><div className="create-assignee"><AssigneePicker value={assignee} onPick={setAssignee} compact/></div></div></div><div className="create-footer"><div className="create-project-select"><Folder size={15}/><select aria-label="Project" value={project} onChange={e=>setProject(e.target.value)}><option value="">No project</option>{matchingProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><ChevronDown size={12}/></div><div className="create-footer-right"><span>{currentTeam?.workspace} · Demo</span><button className="primary-button" disabled={!title.trim()} type="submit"><Plus size={16}/> Create issue</button></div></div></form></div>;
}
function NewTeamModal({teams,onClose,onCreate}:{teams:Team[];onClose:()=>void;onCreate:(v:{name:string;workspace:string;prefix:string})=>void}){
 const [name,setName]=useState('');const [prefix,setPrefix]=useState('');const [workspace,setWorkspace]=useState(WORKSPACES[0]);const [attempted,setAttempted]=useState(false);const [prefixEdited,setPrefixEdited]=useState(false);
 const identifier=prefix.trim().toUpperCase();const collision=teams.some(t=>t.prefix===identifier||t.id===identifier);
 return <div className="overlay modal-overlay entity-overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><form className="entity-modal" role="dialog" aria-modal="true" aria-label="Create team" onSubmit={e=>{e.preventDefault();setAttempted(true);if(name.trim()&&/^[A-Z]{2,5}$/.test(identifier)&&!collision)onCreate({name:name.trim(),workspace,prefix:identifier})}}><div className="entity-modal-heading"><span className="entity-modal-icon"><Users size={19}/></span><div><h2>Create a team</h2><p>Give the team a home for issues, cycles and projects.</p></div><button type="button" className="square-icon" onClick={onClose} aria-label="Close"><X size={18}/></button></div><div className="entity-form"><label>Team name<input autoFocus placeholder="e.g. Growth Engineering" maxLength={60} value={name} onChange={e=>{setName(e.target.value);if(!prefixEdited)setPrefix(e.target.value.replace(/[^a-zA-Z]/g,'').slice(0,4).toUpperCase())}} required/></label><label>Identifier<input placeholder="GROW" maxLength={5} value={prefix} onChange={e=>{setPrefixEdited(true);setPrefix(e.target.value.toUpperCase().replace(/[^A-Z]/g,''))}} required/><small>Used for issue IDs, like GROW-001. 2–5 letters.</small>{attempted&&(collision||!/^[A-Z]{2,5}$/.test(identifier))&&<small className="form-error">Choose a unique identifier with 2–5 letters.</small>}</label><label>Workspace<select value={workspace} onChange={e=>setWorkspace(e.target.value)}>{WORKSPACES.map(w=><option key={w}>{w}</option>)}</select></label></div><div className="entity-modal-actions"><button type="button" className="light-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit"><Plus size={15}/> Create team</button></div></form></div>;
}
function NewProjectModal({teams,onClose,onCreate}:{teams:Team[];onClose:()=>void;onCreate:(v:{name:string;description:string;team:string})=>void}){
 const [name,setName]=useState('');const [description,setDescription]=useState('');const [team,setTeam]=useState(teams[0]?.id||'Media');
 return <div className="overlay modal-overlay entity-overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><form className="entity-modal" role="dialog" aria-modal="true" aria-label="Create project" onSubmit={e=>{e.preventDefault();if(name.trim())onCreate({name:name.trim(),description:description.trim(),team})}}><div className="entity-modal-heading"><span className="entity-modal-icon"><Folder size={19}/></span><div><h2>Create a project</h2><p>Plan one outcome and keep every issue in context.</p></div><button type="button" className="square-icon" onClick={onClose} aria-label="Close"><X size={18}/></button></div><div className="entity-form"><label>Project name<input autoFocus required maxLength={90} placeholder="e.g. Checkout redesign" value={name} onChange={e=>setName(e.target.value)}/></label><label>Lead team<select value={team} onChange={e=>setTeam(e.target.value)}>{teams.map(t=><option key={t.id} value={t.id}>{t.name} · {t.workspace}</option>)}</select><small>Issues can still be assigned to members in other workspaces.</small></label><label>Description <span className="optional">Optional</span><textarea rows={3} maxLength={240} placeholder="What are we building and why?" value={description} onChange={e=>setDescription(e.target.value)}/></label></div><div className="entity-modal-actions"><button type="button" className="light-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit"><Plus size={15}/> Create project</button></div></form></div>;
}
function SearchDialog({issues,query,onQuery,onClose,onIssue,onNew}:{issues:Issue[];query:string;onQuery:(v:string)=>void;onClose:()=>void;onIssue:(id:string)=>void;onNew:()=>void}){
 const ref=useRef<HTMLInputElement>(null);useEffect(()=>ref.current?.focus(),[]);
 const found=issues.filter(i=>`${i.id} ${i.title} ${i.workspace} ${i.labels.join(' ')}`.toLowerCase().includes(query.toLowerCase())).slice(0,8);
 const [active,setActive]=useState(0);
 useEffect(()=>setActive(0),[query]);
 return <div className="overlay modal-overlay search-overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="search-dialog" role="dialog" aria-modal="true"><div className="search-modal-head"><Search size={20}/><input ref={ref} placeholder="Search issues, projects, or anything..." value={query} onChange={e=>onQuery(e.target.value)} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setActive(v=>Math.min(found.length-1,v+1))}if(e.key==='ArrowUp'){e.preventDefault();setActive(v=>Math.max(0,v-1))}if(e.key==='Enter'&&found[active]){e.preventDefault();onIssue(found[active].id)}}}/><kbd>ESC</kbd></div><div className="search-results"><div className="popover-label">{query?'MATCHING ISSUES':'QUICK ACCESS'}</div>{found.map((i,idx)=><button key={i.id} className={idx===active?'search-active':''} onMouseEnter={()=>setActive(idx)} onClick={()=>onIssue(i.id)}><StatusIcon status={i.status}/><span className="search-issue-id">{i.id}</span><span className="search-issue-title">{i.title}</span><ArrowUpRight size={14} className="muted"/></button>)}{!found.length&&<div className="search-empty">No issues match “{query}”</div>}<div className="popover-label search-actions-title">ACTIONS</div><button onClick={onNew}><Plus size={17}/><span className="search-issue-title">Create new issue</span><kbd>C</kbd></button></div><div className="search-dialog-foot"><span><kbd>↵</kbd> to open</span><span><kbd>ESC</kbd> to close</span><span>AKOM Search</span></div></div></div>;
}

createRoot(document.getElementById('root')!).render(<App/>);
