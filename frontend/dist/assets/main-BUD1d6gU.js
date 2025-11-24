import{B as c,s as i}from"./utils-CTkCsTWQ.js";import"./index-CsxmzJuP.js";import"./auth-check-C3ob4bUA.js";const d=6;let u=0,n=!0,l=[];document.addEventListener("DOMContentLoaded",()=>{p(),h()});function h(){const e=document.getElementById("load-more-button");e&&e.addEventListener("click",y)}function f(e){const t=document.getElementById("featured-story-container");if(!e){t.innerHTML='<p class="loading-featured">No featured story available.</p>';return}let a="https://placehold.co/800x400/222222/DDDDDD?text=Featured+Story";e.main_image_url&&(a=c+e.main_image_url);const s=e.categories&&e.categories.length>0?e.categories[0]:"General",r=new Date(e.created_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),o=e.content_preview||"Discover what's new in this featured article.";t.innerHTML=`
        <div class="featured-image-wrapper">
            <img 
                src="${a}" 
                alt="${e.title}" 
                class="featured-image"
                onerror="this.onerror=null; this.src='https://placehold.co/800x400/222222/DDDDDD?text=Image+Missing';"
            />
        </div>
        <div class="featured-content">
            <span class="featured-category">${s}</span>
            <h1 class="featured-title">
                <a href="./post/post.html?id=${e.postid}" title="${e.title}">
                    ${e.title}
                </a>
            </h1>
            <p class="featured-excerpt">${o}</p>
            <div class="featured-meta">
                <span class="author">
                    <i class="fas fa-user"></i> 
                    ${e.author_name}
                </span>
                <span class="date">
                    <i class="fas fa-calendar-alt"></i> 
                    ${r}
                </span>
            </div>
            <a href="./post/post.html?id=${e.postid}" class="featured-btn">
                <i class="fas fa-arrow-right"></i> Read Full Article
            </a>
        </div>
    `}function m(e,t=!1){const a=document.getElementById("posts-container");if(t||(a.innerHTML=""),e.length===0&&!t){a.innerHTML='<p class="text-center text-gray-500">No other articles published yet.</p>';return}e.forEach(s=>{a.appendChild(D(s))})}async function p(){const e=document.getElementById("posts-container"),t=document.getElementById("load-more-button"),a=document.getElementById("page-loading-overlay");try{const s=await fetch(`${c}/public/posts?limit=${d}&offset=0`);if(!s.ok)throw new Error(`API returned status: ${s.status}`);const r=await s.json();if(r.success&&r.data&&r.data.length>0){l=r.data;const o=l[0],g=l.slice(1);f(o),m(g),n=r.pagination.hasMore,u=d,t&&(t.style.display=n?"inline-flex":"none")}else f(null),e.innerHTML='<p class="text-center text-gray-500">No blog posts published yet. Check back soon!</p>',t&&(t.style.display="none")}catch(s){console.error("Error fetching posts:",s),e.innerHTML='<p class="text-center text-gray-500">Failed to load articles. Please try reloading the page.</p>',t&&(t.style.display="none"),i("Could not connect to the server. Try reloading.","error")}finally{a&&a.classList.add("hidden")}}async function y(){const e=document.getElementById("load-more-button");if(!n){i("No more articles to load","info");return}e&&(e.disabled=!0,e.innerHTML='<i class="fas fa-spinner fa-spin"></i>  Loading...');try{const t=await fetch(`${c}/public/posts?limit=${d}&offset=${u}`);if(!t.ok)throw new Error(`API returned status: ${t.status}`);const a=await t.json();a.success&&a.data&&a.data.length>0?(l=[...l,...a.data],m(a.data,!0),n=a.pagination.hasMore,u+=a.data.length,e&&(n?(e.disabled=!1,e.innerHTML="Load more",e.style.display="inline-flex"):(e.style.display="none",i("All articles have been loaded","success")))):(n=!1,e&&(e.style.display="none",e.disabled=!1,e.innerHTML="Load more"),i("No more articles to load","info"))}catch(t){console.error("Error loading more posts:",t),i("Failed to load more articles. Please try again.","error"),e&&(e.disabled=!1,e.innerHTML="Load more")}}function D(e){const t=document.createElement("div");t.className="post-card";let a="https://placehold.co/600x400/2A2A2A/DDDDDD?text=No+Image";e.thumbnail_url?a=c+e.thumbnail_url:e.main_image_url&&(a=c+e.main_image_url);const s=e.categories&&e.categories.length>0?e.categories.join(", "):"Uncategorized",r=new Date(e.created_at).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}),o=e.content_preview||"No preview available";return t.innerHTML=`
        <img 
            src="${a}" 
            alt="${e.title}" 
            class="post-card-image" 
            onerror="this.onerror=null; this.src='https://placehold.co/600x400/2A2A2A/DDDDDD?text=Image+Missing';"
        />
        <div class="post-card-body">
            <h3>
                <a href="./post/post.html?id=${e.postid}" title="${e.title}">
                    ${e.title}
                </a>
            </h3>
            <p>${o}</p>
            <div class="post-card-meta">
                <span class="author">${e.author_name}</span>
                <span class="date">
                    <i class="fas fa-calendar-alt"></i> 
                    ${r}
                </span>
                <span class="category">
                    <i class="fas fa-tag"></i> 
                    ${s}
                </span>
            </div>
        </div>
    `,t}
