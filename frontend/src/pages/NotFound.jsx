import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-xl">
      <div className="max-w-container-max mx-auto">
        <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-low p-10 text-center shadow-soft">
          <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">404</p>
          <h1 className="mt-4 text-display-lg-mobile md:text-display-lg font-display-lg-mobile md:font-display-lg text-primary">
            Page not found
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-body-lg font-body-lg text-on-surface-variant">
            The page you’re looking for doesn’t exist or may have moved.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/">
              <Button variant="primary">Back Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
