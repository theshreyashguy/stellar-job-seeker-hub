import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = '851068951455-4u7jf9lpg9a646tqe3uffdmouk1cc40e.apps.googleusercontent.com';

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
