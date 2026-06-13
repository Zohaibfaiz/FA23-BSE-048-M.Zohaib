import { Stethoscope } from 'lucide-react';

export const Logo = ({ size = 'md', showText = true, subtitle }) => {
  const sizes = {
    sm: { box: 'h-9 w-9', icon: 18, title: 'text-lg', sub: 'text-[10px]' },
    md: { box: 'h-11 w-11', icon: 22, title: 'text-xl', sub: 'text-xs' },
    lg: { box: 'h-14 w-14', icon: 28, title: 'text-2xl', sub: 'text-sm' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${s.box} relative flex items-center justify-center`}
        style={{
          background: 'linear-gradient(135deg, #e8d5a3, #c9a962, #9a7b3a)',
          borderRadius: '2px 14px 2px 14px',
          boxShadow: '0 4px 16px rgba(201,169,98,0.35)',
        }}
      >
        <Stethoscope size={s.icon} className="text-[#0a1412]" strokeWidth={2.2} />
        <span
          className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#6b9b8a]"
          style={{ boxShadow: '0 0 8px #6b9b8a' }}
        />
      </div>
      {showText && (
        <div>
          <p className={`font-display font-bold leading-none ${s.title}`}>
            Doctor <span className="text-[var(--color-brass)]">Hub</span>
          </p>
          {(subtitle || size !== 'sm') && (
            <p className={`font-accent italic text-muted ${s.sub}`}>
              {subtitle || 'Heritage Healthcare'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
