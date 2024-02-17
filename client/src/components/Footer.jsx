import ContactUs from "./ContactUs";
import FAQFooter from "./FAQFooter";
import FooterLogos from "./FooterLogos";
import FooterText from "./FooterText";

function Footer() {
    return (
        <div>
            <div className="contact-footer">
                <ContactUs />
                <FAQFooter />
            </div>

            <FooterText />
            <FooterLogos />
        </div>
    );
}

export default Footer;
