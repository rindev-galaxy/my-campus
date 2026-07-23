
import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password?: string) => void;
}

type AuthStep = 'login' | 'forgot' | 'verify' | 'reset';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('login');
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fullEmail = `${emailPrefix}@happychandara.org`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(fullEmail, password);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message + ' (Demo code: 123456)' });
        setStep('verify');
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send reset code.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === '123456') {
      setStep('reset');
      setMessage(null);
    } else {
      setMessage({ type: 'error', text: 'Invalid verification code.' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail, code: verificationCode, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Password reset successfully. You can now log in.' });
        setTimeout(() => {
          setStep('login');
          setMessage(null);
          setPassword('');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to reset password.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (val: string) => {
    // If user types/pastes full email, just take the prefix
    if (val.includes('@')) {
      setEmailPrefix(val.split('@')[0]);
    } else {
      setEmailPrefix(val);
    }
  };

  const renderEmailInput = (id: string) => (
    <div className="relative flex items-center w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
      <span className="text-slate-400 mr-2 flex-shrink-0">
        <Mail size={18} />
      </span>
      <div className="relative flex-1 flex items-center h-5">
        <input
          id={id}
          type="text"
          required
          className="absolute inset-0 w-full bg-transparent border-none outline-none p-0 text-slate-900 dark:text-white sm:text-sm z-10 placeholder-slate-400 dark:placeholder-slate-500 font-sans"
          placeholder="example"
          value={emailPrefix}
          onChange={(e) => handleEmailChange(e.target.value)}
          autoComplete="off"
        />
        <div className="flex items-center pointer-events-none sm:text-sm whitespace-pre font-sans">
          <span className="opacity-0 select-none">{emailPrefix || "example"}</span>
          <span className={`transition-colors flex-shrink-0 ${emailPrefix ? 'text-indigo-500 dark:text-indigo-400 font-medium' : 'text-slate-400 opacity-50'}`}>
            @happychandara.org
          </span>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 'login':
        return (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">School Email Address</label>
                {renderEmailInput("email-address")}
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md active:scale-[0.98]"
              >
                Secure Login Portal
              </button>
              <div className="text-center">
                <button 
                  type="button"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors uppercase tracking-wider"
                  onClick={() => setStep('forgot')}
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </form>
        );
      case 'forgot':
        return (
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                Enter your email address and we'll send you a verification code to reset your password.
              </p>
              <div>
                <label htmlFor="reset-email" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">School Email Address</label>
                {renderEmailInput("reset-email")}
              </div>
            </div>
            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
              <button 
                type="button"
                onClick={() => setStep('login')}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-wider"
              >
                <ArrowLeft size={14} /> Back to Login
              </button>
            </div>
          </form>
        );
      case 'verify':
        return (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                Please enter the 6-digit verification code sent to <strong>{fullEmail}</strong>.
              </p>
              <div>
                <label htmlFor="verify-code" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Verification Code</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <ShieldCheck size={18} />
                  </span>
                  <input
                    id="verify-code"
                    type="text"
                    required
                    maxLength={6}
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all text-center tracking-[0.5em] font-bold"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md active:scale-[0.98]"
              >
                Verify Code
              </button>
              <button 
                type="button"
                onClick={() => setStep('forgot')}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-wider"
              >
                <ArrowLeft size={14} /> Change Email
              </button>
            </div>
          </form>
        );
      case 'reset':
        return (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                Verification successful. Please set your new password.
              </p>
              <div>
                <label htmlFor="new-password" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    id="new-password"
                    type="password"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    className="appearance-none rounded-lg relative block w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-xl border border-indigo-100 dark:border-slate-800 relative overflow-hidden">
        <div className="text-center pt-4">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-6">
            HC
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {step === 'login' ? 'Sign In' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Grade11 Class Academic Management
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-xs font-bold text-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'}`}>
            {message.text}
          </div>
        )}

        {renderStep()}
      </div>
      <p className="mt-8 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold">Empowering Girls Through Education</p>
    </div>
  );
};

export default Login;