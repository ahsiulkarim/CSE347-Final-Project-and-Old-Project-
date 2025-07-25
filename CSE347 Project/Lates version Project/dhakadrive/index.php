<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dhaka Drive | Driving Training School in Bangladesh</title>
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header>
        <div class="container">
            <a href="index.php" class="logo">Dhaka Drive</a>
            <nav id="main-nav">
                
            </nav>
        </div>
    </header>
    <section id="hero">
        <div class="container">
            <h1>Your Journey to Safe Driving Starts Here</h1>
            <p>Expert training for Car, Motorcycle, Scooter, and Bicycle. Learn with the best in Bangladesh!</p>
            <a href="#courses" class="btn">Explore All Courses</a>
        </div>
    </section>
    <section id="why-us">
        <div class="container">
            <h2 class="section-title">Why Learn With Us?</h2>
            <div class="features">
                <div class="feature-item"><h3>BRTA Guideline Courses</h3><p>Our curriculum is designed following official BRTA guidelines to ensure your success.</p></div>
                <div class="feature-item"><h3>Expert Instructors</h3><p>Our certified instructors are patient, professional, and dedicated to teaching you safe driving.</p></div>
                <div class="feature-item"><h3>License Assistance</h3><p>We guide you through the entire process of applying for your official driving license.</p></div>
                <div class="feature-item"><h3>Flexible Timings</h3><p>We offer classes in the morning, afternoon, and on weekends to fit your schedule.</p></div>
            </div>
        </div>
    </section>
    <section id="courses">
        <div class="container">
            <h2 class="section-title">Our Driving Courses</h2>
            <div class="course-list">
                <div class="course-card">
                    <img src="https://placehold.co/600x400/E8E8E8/444?text=Car+Driving" alt="Car driving lesson">
                    <div class="course-card-content">
                        <h3>Car Driving Course (Manual & Auto)</h3>
                        <ul>
                            <li><strong>Perfect For:</strong> Absolute beginners aiming to drive a car.</li>
                            <li><strong>You'll Learn:</strong> Traffic rules, parking, city & highway driving.</li>
                            <li><strong>Outcome:</strong> Become a confident and safe car driver.</li>
                        </ul>
                        <a href="#" class="btn request-btn" data-course="Car Driving Course">Request to Enroll</a>
                    </div>
                </div>
                <div class="course-card">
                    <img src="https://placehold.co/600x400/E8E8E8/444?text=Motorcycle+Training" alt="Motorcycle riding lesson">
                    <div class="course-card-content">
                        <h3>Motorcycle Riding Course</h3>
                        <ul>
                            <li><strong>Perfect For:</strong> New riders wanting to master two-wheelers.</li>
                            <li><strong>You'll Learn:</strong> Balancing, gear shifting, and road safety.</li>
                            <li><strong>Outcome:</strong> Prepare for your motorcycle license test.</li>
                        </ul>
                        <a href="#" class="btn request-btn" data-course="Motorcycle Riding Course">Request to Enroll</a>
                    </div>
                </div>
                <div class="course-card">
                    <img src="https://placehold.co/600x400/E8E8E8/444?text=Scooter+Lessons" alt="Scooter riding lesson">
                    <div class="course-card-content">
                        <h3>Scooter Riding Lessons</h3>
                        <ul>
                            <li><strong>Perfect For:</strong> Easy city commuting, students, and office-goers.</li>
                            <li><strong>You'll Learn:</strong> Easy handling, balance, and navigating traffic.</li>
                            <li><strong>Outcome:</strong> Ride a scooter confidently around the city.</li>
                        </ul>
                        <a href="#" class="btn request-btn" data-course="Scooter Riding Lessons">Request to Enroll</a>
                    </div>
                </div>
                <div class="course-card">
                    <img src="https://placehold.co/600x400/E8E8E8/444?text=Bicycle+Safety" alt="Bicycle safety training">
                    <div class="course-card-content">
                        <h3>Bicycle Safety Program</h3>
                        <ul>
                            <li><strong>Perfect For:</strong> Children and adults learning to cycle safely.</li>
                            <li><strong>You'll Learn:</strong> Balancing, road signs, and safe cycling habits.</li>
                            <li><strong>Outcome:</strong> Cycle with confidence on roads and in parks.</li>
                        </ul>
                        <a href="#" class="btn request-btn" data-course="Bicycle Safety Program">Request to Enroll</a>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section id="faq">
        <div class="container">
            <h2 class="section-title">Common Questions</h2>
            <div class="faq-item"><h4>Do I need my own vehicle for the course?</h4><p>No, we provide the training vehicle (car, motorcycle, or scooter) and safety gear for all our beginner courses.</p></div>
            <div class="faq-item"><h4>What documents are required to enroll?</h4><p>You will need a copy of your National ID (NID) card or Birth Certificate, and two passport-sized photographs. You can upload your document from your dashboard after signing up.</p></div>
            <div class="faq-item"><h4>Do you help with the BRTA license test?</h4><p>Yes! Our course fully prepares you for the test, and we provide complete assistance with the application process.</p></div>
        </div>
    </section>
    <section id="contact">
        <div class="container contact-box">
            <h2>Get Started Today!</h2>
            <p>Call us or visit our office to book your spot. Your driving adventure awaits!</p>
            <div class="contact-details">
                <p><strong>Phone:</strong> +880 1712-345678</p>
                <p><strong>Email:</strong> info@dhakadrive.com.bd</p>
                <p><strong>Location:</strong> House 123, Road 4, Dhanmondi, Dhaka-1205, Bangladesh</p>
            </div>
            <a href="tel:+8801712345678" class="btn">Call Us Now</a>
        </div>
    </section>
    <footer><div class="container"><p>© 2024 Dhaka Drive. All Rights Reserved.</p></div></footer>
    <div id="price-confirm-modal" class="modal-overlay">
        <div class="modal-content"><span class="close-modal">×</span><h2 class="modal-title">Course Enrollment Confirmation</h2><div id="price-details-content"><p>You are about to request enrollment in the following course:</p><h3 id="modal-price-course-name" class="modal-course-title">Course Name Here</h3><p class="course-price-display">Price: BDT <span id="modal-course-price">0</span></p><p>Please confirm to proceed. No payment is required at this stage.</p></div><button id="confirm-price-btn" class="btn">Confirm & Proceed</button></div>
    </div>
    <div id="request-modal" class="modal-overlay">
        <div class="modal-content"><span class="close-modal">×</span><h2 class="modal-title">Enrollment Request: <span id="modal-request-course-name"></span></h2><form id="request-form"><div class="form-group"><label for="user-location">Your Preferred Location</label><input type="text" id="user-location" placeholder="e.g., Mirpur, Gulshan, Uttara" required></div><button type="submit" class="btn">Submit Request</button></form></div>
    </div>
    <script src="app.js"></script>
</body>
</html>