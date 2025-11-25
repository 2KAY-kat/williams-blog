export function footerComponentHTML() {
    
    return `
        <div class="container">
            <!-- Brand Column -->
            <div class="footer-column">
                <a href="/" class="footer-logo">
                    Williams <span>Kaphika</span> </a>
                <p class="footer-description">
                    Welcome to The GrowthMinds blog by Williams Kaphika, Where we expolore the journey of personal and professional growth.
                </p>
                <div class="social-links">
                    <a href="https://twitter.com" title="Twitter" target="_blank">
                        <i class="fab fa-twitter"></i>
                    </a>
                    <a href="https://linkedin.com" title="LinkedIn" target="_blank">
                        <i class="fab fa-linkedin"></i>
                    </a>
                    <a href="https://facebook.com" title="Facebook" target="_blank">
                        <i class="fab fa-facebook"></i>
                    </a>
                    <a href="https://instagram.com" title="Instagram" target="_blank">
                        <i class="fab fa-instagram"></i>
                    </a>
                </div>
            </div>

            <!-- Quick Links Column -->
			<div class="footer-column">
                <h3>Quick Links</h3>
                <ul>
                    <li><a href="#"><i class="fas fa-arrow-right"></i> About me</a></li>
                    <li><a href="#"><i class="fas fa-arrow-right"></i> Self-improvement</a></li>
                    <li><a href="#"><i class="fas fa-arrow-right"></i> The Physics Paradox</a></li>
                    <li><a href="#"><i class="fas fa-arrow-right"></i> AI and EdTech</a></li>
					<li><a href="#"><i class="fas fa-arrow-right"></i> Opportunities</a></li>
					<li><a href="#"><i class="fas fa-arrow-right"></i> Contact</a></li>
                </ul>
            </div>

            <!-- Categories Column -->
            <!--  <div class="footer-column">
                <h3>Categories</h3>
                <ul>
                    <li><a href="#"><i class="fas fa-arrow-right"></i> Growth Mindset</a></li>
                    <li><a href="#"><i class="fas fa-arrow-right"></i> Personal Development</a></li>
                    <li><a href="#"><i class="fas fa-arrow-right"></i> Tips & Tricks</a></li>
                    <li><a href="#"><i class="fas fa-arrow-right"></i> Inspiration</a></li>
                </ul>
            </div> -->

            <!-- Newsletter Column -->
            <div class="footer-column">
                <h3>Newsletter</h3>
                <p>Subscribe to get the latest articles delivered to your inbox.</p>
                <form class="newsletter-form" id="newsletter-form">
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        required
                        aria-label="Email for newsletter"
                    >
                    <button type="submit">Subscribe</button>
                </form>
            </div>
        </div>

        <!-- Footer Divider -->
        <div class="footer-divider"></div>

        <!-- Footer Bottom -->
        <div class="container">
            <div class="footer-bottom">
                <p class="footer-bottom-text">
                    &copy; 2025 Williams Kaphika. All rights reserved.
                </p>
                <ul class="footer-bottom-links">
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms of Service</a></li>
                    <li><a href="#">Contact</a></li>
                </ul>
            </div>
        </div>
        `;
}