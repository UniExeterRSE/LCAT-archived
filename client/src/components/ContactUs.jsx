import React from "react";

const ContactUs = () => {
    return (
        <div className="contact-us-flex-container">
            <h1>Need help? Contact us.</h1>
            <div class="contact-us-flex-content">
                <p>
                    <a class="email-button" href="mailto:lcat@exeter.ac.uk"></a>
                </p>
                <p>
                    Email us at:&nbsp; 
                    <a href="mailto:lcat@exeter.ac.uk">lcat@exeter.ac.uk</a>
                </p>
            </div>
        </div>
    );
};

export default ContactUs;
