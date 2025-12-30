import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Total duration: 2.5s
        const timer = setTimeout(() => {
            setIsVisible(false); // Start fade out
            setTimeout(onComplete, 500); // Unmount after fade out completes
        }, 2500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0a2e65] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large gradient circle - top right */}
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0067f5]/20 rounded-full blur-3xl"></div>
                {/* Medium gradient circle - bottom left */}
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#0067f5]/15 rounded-full blur-3xl"></div>
                {/* Small accent circle - top left */}
                <div className="absolute top-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            </div>

            {/* Content */}
            <div className="relative flex flex-col items-center justify-between h-full py-16 px-8">
                {/* Spacer */}
                <div></div>

                {/* Center Logo */}
                <div className="flex flex-col items-center gap-6">
                    <div className="animate-[scaleUp_1s_cubic-bezier(0.16,1,0.3,1)_forwards]">
                        <img
                            src="/logo.png"
                            alt="BLUNT"
                            className="h-16 w-auto"
                        />
                    </div>

                    {/* Loading Indicator */}
                    <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white animate-[width_2s_ease-in-out_forwards] w-0" style={{ animationName: 'loadingProgress' }} />
                    </div>
                </div>

                {/* Footer Branding */}
                <div className="flex flex-col items-center gap-2 animate-[fadeIn_1s_ease-in_0.5s_forwards] opacity-0">
                    <h2 className="text-2xl font-black text-white tracking-tighter">BLUNT.</h2>
                    <p className="text-sm text-white/70 font-medium">Say what matters. Safely</p>
                </div>
            </div>

            <style>{`
        @keyframes loadingProgress {
            0% { width: 0%; }
            100% { width: 100%; }
        }
        @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};
