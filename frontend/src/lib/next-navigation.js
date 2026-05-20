import { useNavigate, useParams as useReactParams, useLocation, useSearchParams as useReactSearchParams } from 'react-router-dom';

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  return {
    push: (url) => navigate(url),
    replace: (url) => navigate(url, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    prefetch: () => {},
    pathname: location.pathname,
  };
}

export function useParams() {
  return useReactParams();
}

export function usePathname() {
  const { pathname } = useLocation();
  return pathname;
}

export function useSearchParams() {
  const [searchParams] = useReactSearchParams();
  return searchParams;
}
