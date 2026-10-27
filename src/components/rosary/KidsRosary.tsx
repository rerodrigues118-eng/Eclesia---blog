import React from 'react';
import { SantoTercoKids } from '../SantoTercoKids';

export interface KidsRosaryProps {
  onSwitchToAdult?: () => void;
  onSwitchToTraditional?: () => void;
}

/**
 * Componente Lúdico do Santo Terço Kids (KidsRosary)
 * Apresenta o Santo Terço completo em formato de Trilha Visual de Catequese Infantil (estilo Infográfico Interativo)
 * Conectando a Base (Crucifixo e Credo), Haste (Pai Nosso e 3 Ave-Marias), Medalha Central (Nossa Senhora)
 * e o Grande Círculo Superior das 5 Dezenas com contas coloridas, sons de sininho e balão de fala dinâmico.
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

export { SantoTercoKids };
export default KidsRosary;
