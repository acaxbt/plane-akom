import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Check, ChevronDown, Plus } from 'lucide-react';

export function PopSelect<T extends string>({value,options,onChange,display,label,optionText}: {value:T;label?:string;options:readonly T[];onChange:(v:T)=>void;display?:(v:T)=>ReactNode;optionText?:(v:T)=>string}){
 const [open,setOpen]=useState(false);const [query,setQuery]=useState('');
 const wrap=useRef<HTMLDivElement>(null);const popup=useRef<HTMLDivElement>(null);
 const [position,setPosition]=useState({top:0,left:0,width:280,maxHeight:320});
 const close=()=>{setOpen(false);setQuery('');wrap.current?.querySelector('button')?.focus()};
 useEffect(()=>{if(!open)return;
  const reposition=()=>{const r=wrap.current?.getBoundingClientRect();if(!r)return;const width=Math.min(Math.max(r.width,280),window.innerWidth-24);const below=window.innerHeight-r.bottom-18;const above=r.top-18;const height=Math.min(320,Math.max(below,above));setPosition({width,left:Math.max(12,Math.min(r.left,window.innerWidth-width-12)),top:below>=Math.min(240,height)?r.bottom+6:Math.max(12,r.top-height-6),maxHeight:height})};
  const outside=(event:MouseEvent)=>{if(!wrap.current?.contains(event.target as Node)&&!popup.current?.contains(event.target as Node)){setOpen(false);setQuery('')}};
  reposition();document.addEventListener('mousedown',outside);window.addEventListener('resize',reposition);window.addEventListener('scroll',reposition,true);
  popup.current?.querySelector<HTMLElement>('input,button')?.focus();
  return()=>{document.removeEventListener('mousedown',outside);window.removeEventListener('resize',reposition);window.removeEventListener('scroll',reposition,true)};
 },[open]);
 return <div className="popover-root" ref={wrap}><button type="button" className="property-value" aria-label={label} aria-expanded={open} title={typeof display==='undefined'?value:undefined} onClick={()=>setOpen(v=>!v)}>{display?display(value):value}<ChevronDown size={12} className="muted"/></button>{open&&createPortal(<div ref={popup} className="simple-popover property-picker" style={position} aria-label={label?`${label} options`:undefined} onKeyDown={event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close()}
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();const buttons=Array.from(popup.current?.querySelectorAll<HTMLButtonElement>('button:not([hidden])')||[]);const index=buttons.indexOf(document.activeElement as HTMLButtonElement);buttons[index<0?(event.key==='ArrowDown'?0:buttons.length-1):(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus()}
 }}>{options.length>5&&<input className="picker-search" aria-label={`Search ${label||'options'}`} placeholder="Search…" value={query} onChange={event=>setQuery(event.target.value)}/>}<div className="property-picker-options">{options.map(o=><button type="button" key={o} hidden={!!query&&!(optionText?.(o)||o).toLowerCase().includes(query.toLowerCase())} aria-pressed={o===value} onClick={()=>{onChange(o);close()}}>{display?display(o):o}{o===value&&<Check size={14} className="accent"/>}</button>)}</div></div>,document.body)}</div>;
}
export function DateProperty({value,onChange,label,disabled=false}:{value:string;onChange:(value:string)=>void;label:string;disabled?:boolean}){
 if(disabled)return <div className="property-static" aria-label={label}><CalendarDays size={15}/>{value?new Date(value+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'No due date'}<span className="issue-property-locked">Owner-managed</span></div>;
 return <details className="date-picker" onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();event.currentTarget.open=false;event.currentTarget.querySelector('summary')?.focus()}}}><summary aria-label={label}><CalendarDays size={15}/><span>{value?new Date(value+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'Set date'}</span></summary>{!disabled&&<div className="date-picker-panel"><input type="date" aria-label={`Choose ${label.toLowerCase()}`} value={value} onInput={event=>onChange(event.currentTarget.value)}/><button type="button" className="text-link" onClick={()=>onChange('')}>Clear date</button></div>}</details>;
}
export function LabelPicker({value,options,onChange,readOnly}:{value:string[];options:string[];onChange:(value:string[])=>void;readOnly:boolean}){
 const [query,setQuery]=useState('');const choices=[...new Set([...options,...value])].sort();
 return <details className="issue-labels property-block" onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();event.currentTarget.open=false;event.currentTarget.querySelector('summary')?.focus()}}}><summary><span>Labels</span><span className="property-tags">{value.map(label=><span key={label} className="detail-tag">{label}</span>)}{!value.length&&<span className="muted">Add label</span>}{!readOnly&&<Plus size={13}/>}</span></summary>{!readOnly&&<div className="label-picker-panel"><input className="picker-search" aria-label="Search or create label" placeholder="Search or create label…" value={query} onChange={event=>setQuery(event.target.value)}/>{choices.filter(label=>label.toLowerCase().includes(query.toLowerCase())).map(label=><label key={label}><input type="checkbox" checked={value.includes(label)} onChange={event=>onChange(event.target.checked?[...value,label]:value.filter(item=>item!==label))}/>{label}</label>)}{query.trim()&&!choices.some(label=>label.toLowerCase()===query.trim().toLowerCase())&&<button type="button" className="text-link" onClick={()=>{onChange([...value,query.trim()]);setQuery('')}}><Plus size={13}/> Create “{query.trim()}”</button>}</div>}</details>;
}
