import "../styles/styles.css";

const Footer = () => {
  return (
   <footer className="footer p-2">
      <div className="container flex justify-center mx-auto">
        <p>&copy; {new Date().getFullYear()} XorOJ. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
