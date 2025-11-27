import{B as n,s as l}from"./utils-TR1j_de-.js";import"./index-ClKxXFVO.js";import"./auth-check-cRqyrRfN.js";const d=7;let u=0,o=!0,c=[];document.addEventListener("DOMContentLoaded",()=>{h(),p()});function p(){const e=document.getElementById("load-more-button");e&&e.addEventListener("click",y)}function f(e){const t=document.getElementById("featured-story-container");if(!e){t.innerHTML='<p class="loading-featured">No featured story available.</p>';return}let a=`${n}/uploads/placeholder.png`;e.main_image_url&&(a=n+e.main_image_url);const r=e.categories&&e.categories.length>0?e.categories[0]:"General",s=new Date(e.created_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}),i=e.content_preview||"Discover what's new in this featured article.";t.innerHTML=`
        <div class="featured-image-wrapper">
            <img 
                src="${a}" 
                alt="${e.title}" 
                class="featured-image"
                onerror="this.onerror=null; this.src='${n}/uploads/placeholder.png';"
            />
        </div>
        <div class="featured-content">
            <span class="featured-category"><i class="fas fa-tag"></i>${r}</span>
            <h1 class="featured-title">
                <a href="./post/post.html?id=${e.postid}" title="${e.title}">
                    ${e.title}
                </a>
            </h1>
            <p class="featured-excerpt">${i}</p>
            <div class="featured-meta">
                <span class="author">
                    <i class="fas fa-user"></i> 
                    ${e.author_name}
                </span>
                <span class="date">
                    <i class="fas fa-calendar-alt"></i> 
                    ${s}
                </span>
            </div>
            <a href="./post/post.html?id=${e.postid}" class="featured-btn">
                <i class="fas fa-arrow-right"></i> Read Full Article
            </a>
        </div>
    `}function m(e,t=!1){const a=document.getElementById("posts-container");if(t||(a.innerHTML=""),e.length===0&&!t){a.innerHTML='<p class="text-center text-gray-500">No other articles published yet.</p>';return}e.forEach(r=>{a.appendChild($(r))})}async function h(){const e=document.getElementById("posts-container"),t=document.getElementById("load-more-button"),a=document.getElementById("page-loading-overlay");try{const r=await fetch(`${n}/public/posts?limit=${d}&offset=0`);if(!r.ok)throw new Error(`API returned status: ${r.status}`);const s=await r.json();if(s.success&&s.data&&s.data.length>0){c=s.data;const i=c[0],g=c.slice(1);f(i),m(g),o=s.pagination.hasMore,u=d,t&&(t.style.display=o?"inline-flex":"none")}else f(null),e.innerHTML='<p class="text-center text-gray-500">No blog posts published yet. Check back soon!</p>',t&&(t.style.display="none")}catch(r){console.error("Error fetching posts:",r),e.innerHTML='<p class="text-center text-gray-500">Failed to load articles. Please try reloading the page.</p>',t&&(t.style.display="none"),l("Could not connect to the server. Try reloading.","error")}finally{a&&a.classList.add("hidden")}}async function y(){const e=document.getElementById("load-more-button");if(!o){l("No more articles to load","info");return}e&&(e.disabled=!0,e.innerHTML='<i class="fas fa-spinner fa-spin"></i>  Loading...');try{const t=await fetch(`${n}/public/posts?limit=${d}&offset=${u}`);if(!t.ok)throw new Error(`API returned status: ${t.status}`);const a=await t.json();a.success&&a.data&&a.data.length>0?(c=[...c,...a.data],m(a.data,!0),o=a.pagination.hasMore,u+=a.data.length,e&&(o?(e.disabled=!1,e.innerHTML="Load more",e.style.display="inline-flex"):(e.style.display="none",l("All articles have been loaded","success")))):(o=!1,e&&(e.style.display="none",e.disabled=!1,e.innerHTML="Load more"),l("No more articles to load","info"))}catch(t){console.error("Error loading more posts:",t),l("Failed to load more articles. Please try again.","error"),e&&(e.disabled=!1,e.innerHTML="Load more")}}function $(e){const t=document.createElement("div");t.className="post-card";let a=`${n}/uploads/placeholder.png`;e.thumbnail_url?a=n+e.thumbnail_url:e.main_image_url&&(a=n+e.main_image_url);const r=e.categories&&e.categories.length>0?e.categories.join(", "):"Uncategorized",s=new Date(e.created_at).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}),i=e.content_preview||"No preview available";return t.innerHTML=`
        <img 
            src="${a}" 
            alt="${e.title}" 
            class="post-card-image" 
            onerror="this.onerror=null; this.src='${n}/uploads/placeholder.png'"  
        />
        <div class="post-card-body">
            <h3>
                <a href="./post/post.html?id=${e.postid}" title="${e.title}">
                    ${e.title}
                </a>
            </h3>
            <p>${i}</p>
            <div class="post-card-meta">
                <span class="author">${e.author_name}</span>
                <span class="date">
                    <i class="fas fa-calendar-alt"></i> 
                    ${s}
                </span>
                <span class="category">
                    <i class="fas fa-tag"></i> 
                    ${r}
                </span>
            </div>
        </div>
    `,t}
