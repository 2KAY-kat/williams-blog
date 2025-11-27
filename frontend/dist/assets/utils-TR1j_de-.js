(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const s of t.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function a(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(e){if(e.ep)return;e.ep=!0;const t=a(e);fetch(e.href,t)}})();function c(i,r="success"){document.querySelectorAll(".toast-notification").forEach(n=>n.remove());const o=document.createElement("div");o.className=`toast-notification toast-${r}`;const e=document.createElement("i");e.style.marginRight="12px",e.style.fontSize="1.2em";let t="#333",s="fas fa-bell";switch(r){case"success":s="fas fa-check-circle",t="#4CAF50";break;case"error":s="fas fa-exclamation-triangle",t="#f44336";break;case"info":s="fas fa-info-circle",t="#2196F3";break;default:s="fas fa-bell",t="#333"}e.className=s,o.appendChild(e),o.appendChild(document.createTextNode(i)),o.style.cssText=`
        position: fixed;
        top: 20px;
        right: 20px;
        /* Increased padding to accommodate icon */
        padding: 16px 24px; 
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-in-out;
        max-width: 350px;
        word-wrap: break-word;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        /* Flexbox for easy alignment of icon and text */
        display: flex; 
        align-items: center;
        background-color: ${t}; /* Use the determined color */
    `,document.body.appendChild(o),setTimeout(()=>{o.style.opacity="1",o.style.transform="translateX(0)"},100),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateX(100%)",setTimeout(()=>{document.body.contains(o)&&document.body.removeChild(o)},300)},4e3)}const l="https://williams-blog-api.vercel.app";export{l as B,c as s};
