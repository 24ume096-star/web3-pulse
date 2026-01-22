import { TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrendingMarketCardProps {
  question: string;
  suggestedStake: string;
  activityStatus?: 'increasing' | 'stable' | 'decreasing';
  isHot?: boolean;
  onClick?: () => void;
}

export function TrendingMarketCard({
  question,
  suggestedStake,
  activityStatus = 'increasing',
  isHot = false,
  onClick,
}: TrendingMarketCardProps) {
  const activityText = {
    increasing: 'Volume rising',
    stable: 'Steady pulse',
    decreasing: 'Volume dropping',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      style={{
        background: isHot
          ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 142, 83, 0.1))'
          : 'linear-gradient(135deg, rgba(131, 110, 249, 0.05), rgba(99, 102, 241, 0.05))',
        border: `1px solid ${isHot ? 'rgba(255, 107, 107, 0.2)' : 'rgba(131, 110, 249, 0.2)'}`,
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      whileHover={onClick ? { scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : {}}
    >
      {/* Trending Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <TrendingUp size={16} color={isHot ? '#FF6B6B' : '#836EF9'} />
        <span
          style={{
            fontSize: '12px',
            fontWeight: '800',
            color: isHot ? '#FF6B6B' : '#836EF9',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {isHot ? '🔥 HOT WAVE' : '📈 RISING TREND'}
        </span>
      </div>

      {/* Question */}
      <h3
        style={{
          fontSize: '20px',
          fontWeight: '700',
          color: 'var(--text, #1a1a1a)',
          marginBottom: '16px',
          lineHeight: '1.4',
        }}
      >
        {question}
      </h3>

      {/* Suggested Stake */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '8px',
          width: 'fit-content',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-dim, #666)',
          }}
        >
          Engagement Pick:
        </span>
        <span
          style={{
            fontSize: '16px',
            fontWeight: '800',
            color: 'var(--primary, #836EF9)',
          }}
        >
          {suggestedStake} Points
        </span>
      </div>

      {/* Activity Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-dim, #666)',
        }}
      >
        <Users size={14} />
        <span
          style={{
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          👥 {activityText[activityStatus]}
        </span>
      </div>
    </motion.div>
  );
}
