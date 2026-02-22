import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { signIn } from '../lib/authService';

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      localStorage.setItem('admin_logged_in', 'true');
      onLogin();
      navigate('/admin');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorCode = (err as { code?: string })?.code;
      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
        setError('E-Mail oder Passwort ist falsch');
      } else if (errorCode === 'auth/too-many-requests') {
        setError('Zu viele Versuche. Bitte warte kurz.');
      } else {
        setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-cream-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-sage-600 mb-2">
            <Camera className="w-8 h-8" />
            <span className="font-serif text-2xl">Emily's Galerie</span>
          </div>
          <p className="text-sage-500">Admin-Bereich</p>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <h1 className="text-xl font-medium text-sage-800 mb-6 text-center">
            Anmelden
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-sage-700 mb-1.5">
                E-Mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="deine@email.de"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-sage-700 mb-1.5">
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Anmelden...
                </>
              ) : (
                'Anmelden'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
