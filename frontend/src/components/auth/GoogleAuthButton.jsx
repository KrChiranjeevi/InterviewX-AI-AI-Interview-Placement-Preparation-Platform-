import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * GoogleAuthButton
 * 
 * Uses Google Identity Services Native SDK loaded from index.html:
 *   1. Integrates seamlessly with React 19 by avoiding legacy packages
 *   2. Generates a secure, verified ID Token (JWT) directly from Google
 *   3. Posts the token to the backend where it is validated cryptographically
 */
const GoogleAuthButton = () => {
  const { googleLogin } = useContext(AuthContext);
  const navigate        = useNavigate();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if the script is already loaded
    if (window.google) {
      setScriptLoaded(true);
      return;
    }

    // Interval fallback in case it takes a moment to load async
    const interval = setInterval(() => {
      if (window.google) {
        setScriptLoaded(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!scriptLoaded) return;

    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        console.warn('Google Client ID is not configured.');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            // response.credential is the verified ID Token JWT
            await googleLogin(response.credential);
            navigate('/dashboard');
            toast.success('Signed in with Google! 🎉');
          } catch (err) {
            const msg = err?.response?.data?.message || 'Google sign-in failed. Please try again.';
            toast.error(msg);
          }
        },
        auto_select: false,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn-div'),
        {
          theme: 'filled_blue',
          size: 'large',
          width: '320',
          text: 'continue_with',
          shape: 'rectangular',
        }
      );
    } catch (error) {
      console.error('Error rendering Google button:', error);
    }
  }, [scriptLoaded, googleLogin, navigate]);

  return (
    <div className="flex justify-center w-full min-h-[44px] py-1">
      <div id="google-signin-btn-div" className="relative z-10" />
    </div>
  );
};

export default GoogleAuthButton;
