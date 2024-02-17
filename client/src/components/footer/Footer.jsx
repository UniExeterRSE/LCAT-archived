import ContactUs from "./ContactUs";
import FAQ from "./FAQ";
import FooterLogos from "./FooterLogos";
import FooterText from "./FooterText";

import "./Footer.css"

function Footer() {
    return (
        <div>
            <div className="contact-footer">
                <ContactUs />
                <FAQ />
            </div>

            <FooterText />
            <FooterLogos />
        </div>
    );
}

export default Footer;