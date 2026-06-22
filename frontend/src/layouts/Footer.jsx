import { Link } from 'react-router-dom';

const footerLinks = [
  { label: 'Privacy Policy', to: '#' },
  { label: 'Terms of Service', to: '#' },
  { label: 'Shipping', to: '#' },
  { label: 'Contact', to: '#' },
];

const Footer = () => {
  return (
    <footer className="w-full py-stack-xl mt-stack-xl border-t-[0.5px] border-outline-variant bg-background">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="flex flex-col justify-between h-full gap-stack-md">
          <div className="text-headline-md font-headline-md font-bold text-primary">
            ShopEase
          </div>
          <div className="text-on-surface text-body-md font-body-md">
            © 2024 ShopEase. All rights reserved.
          </div>
        </div>

        <div className="flex flex-col md:items-end justify-end gap-4">
          <ul className="flex flex-wrap gap-6 md:justify-end">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
