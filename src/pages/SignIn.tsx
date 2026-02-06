import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function SignIn() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                await signUp(email, password);
            } else {
                await signIn(email, password);
            }
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-grid-pattern bg-[size:50px_50px] opacity-30 pointer-events-none" />
            <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />

            <div className="glass-card p-8 w-full max-w-md space-y-6 relative z-10">
                <div className="text-center">
                    <div className="flex flex-col items-center justify-center mb-6 gap-4">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center p-4 shadow-xl shadow-primary/10 ring-1 ring-white/10 backdrop-blur-sm">
                            <img
                                src="/verify-ai-logo.png"
                                alt="VerifyAI Logo"
                                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            />
                        </div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-primary to-purple-400 tracking-tighter">
                            VerifyAI
                        </h1>
                    </div>

                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        {isSignUp ? 'Create Account' : 'Sign In'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {isSignUp ? 'Join to start analyzing media' : 'Access your analysis history'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                            Email
                        </label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="bg-muted/30"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                            Password
                        </label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="bg-muted/30"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-danger/10 border border-danger/30">
                            <p className="text-sm text-danger">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="glow"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {isSignUp ? 'Creating account...' : 'Signing in...'}
                            </>
                        ) : (
                            isSignUp ? 'Create Account' : 'Sign In'
                        )}
                    </Button>
                </form>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                    </button>
                </div>
            </div>
        </div>
    );
}
