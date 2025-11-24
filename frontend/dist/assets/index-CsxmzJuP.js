function a(){return`
        <div class="main-header">
            <a href="/" class="logo"><span>Williams</span> Kaphika</a>
            <a href="/" class="logo-mobile logo"><span>W</span>K</a>
            <nav class="main-nav">
                <a href="/admin/dashboard.html" class="cta-link icon" id="add-article-link" title="Add New" Article"><i class="fa fa-pen"></i></a>
                <a href="/auth/signup.html" class="cta-link icon"><i class="fa fa-sign-in"></i></a>
                <a href="#" class="cta-link subscribe-btn">Subscribe</a>
            </nav>
        </div>
        `}document.querySelector("header").innerHTML=a();
