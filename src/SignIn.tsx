import React, { useState } from 'react';
import { Calendar, UserCircle2 } from 'lucide-react';

type UserType = {
  username: string;
  isGuest: boolean;
};

type SignInProps = {
  onSignIn: (user: UserType) => void;
};

function SignIn({ onSignIn }: SignInProps) {
  const [isGuest, setIsGuest] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isGuest) {
      onSignIn({ username: 'Guest', isGuest: true });
      return;
    }

    // Hard-coded credentials check
    if (username === 'arpan' && password === 'arpan') {
      onSignIn({ username, isGuest: false });
    } else {
      setError('Invalid credentials. Use username: arpan, password: arpan');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full border-b border-red-100">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-normal text-gray-900">Appointments</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <UserCircle2 className="w-20 h-20 text-red-600 mx-auto mb-4" />
            <h1 className="text-3xl font-normal text-gray-900 mb-2">Welcome</h1>
            <p className="text-gray-700">Sign in to schedule your appointment</p>
          </div>

          <div className="bg-white rounded-lg border border-red-100 p-8">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setIsGuest(true)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  isGuest
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-gray-700 hover:bg-red-100'
                }`}
              >
                Continue as Guest
              </button>
              <button
                onClick={() => setIsGuest(false)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  !isGuest
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-gray-700 hover:bg-red-100'
                }`}
              >
                Sign In
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isGuest && (
                <>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 border border-red-200 rounded-md focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-shadow"
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-red-200 rounded-md focus:ring-2 focus:ring-red-100 focus:border-red-300 outline-none transition-shadow"
                      placeholder="Enter password"
                    />
                  </div>
                </>
              )}
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 transition-colors"
              >
                {isGuest ? 'Continue as Guest' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="mt-auto border-t border-red-100">
        <div className="max-w-6xl mx-auto p-6 flex justify-between items-center text-sm text-gray-600">
          <div>© 2025 Appointment Scheduler</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-red-900">Privacy</a>
            <a href="#" className="hover:text-red-900">Terms</a>
            <a href="#" className="hover:text-red-900">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SignIn;