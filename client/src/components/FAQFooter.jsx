import React from "react";

const FAQFooter = () => {
    return (
        <div className="footer-flex-container">
            <div class="footer-heading">Frequently Asked Questions</div>
            <div class="footer-flex-content">
                <p>
                    <a
                        className="faq-button"
                        href="https://www.ecehh.org/wp/wp-content/uploads/2023/01/Frequently-Asked-Questions-1.pdf"
                        target="_blank" rel="noreferrer"
                    ></a>
                </p>
                <p>
                    View&nbsp;
                    <a
                        href="https://www.ecehh.org/wp/wp-content/uploads/2023/01/Frequently-Asked-Questions-1.pdf"
                        target="_blank" rel="noreferrer"
                    >
                        Frequently Asked Questions at: ecehh.org
                    </a>
                </p>
            </div>
        </div>
    );
};

export default FAQFooter;
