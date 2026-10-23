import React from 'react';
import { SantoTercoKids } from '../SantoTercoKids';

export interface KidsRosaryProps {
  onSwitchToAdult?: () => void;
  onSwitchToTraditional?: () => void;
}

/**
 * Componente Lúdico do Santo Terço Kids (KidsRosary)
 * Totalmente integrado ao repositório principal do Eclesia (sem Cloudflare Workers / sem APIs externas)
 * Gerencia localmente as animações, estados de clique nas contas do terço e áudios em /terco-kids/
 */
export const KidsRosary: React.FC<KidsRosaryProps> = ({
  onSwitchToAdult,
  onSwitchToTraditional
}) => {
  return (
    <SantoTercoKids
      onSwitchToAdult={onSwitchToTraditional || onSwitchToAdult}
    />
  );
};

export default KidsRosary;
