import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Clock,
  Phone,
  Calendar,
  Compass,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Filter,
  CheckCircle2,
  Cross
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { Church } from '../types';
import { INITIAL_CHURCHES, calculateDistanceKm } from '../data/churchesData';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export const IgrejasView: React.FC = () => {
  // User's location (default to São Paulo center if GPS not acquired yet)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocationName, setUserLocationName] = useState<string>('Localização Padrão (São Paulo, SP)');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOption, setFilterOption] = useState<'todos' | 'catedrais' | 'confissoes'>('todos');
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);

  // Map viewport center
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: -23.5512,
    lng: -46.6343,
  });
  const [mapZoom, setMapZoom] = useState<number>(11);

  // Acquire user's GPS position
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada pelo seu navegador.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCoords(coords);
        setMapCenter(coords);
        setMapZoom(13);
        setUserLocationName('Sua Localização GPS Atual');
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsLocating(false);
        setLocationError(
          'Não foi possível obter sua localização exata. Exibindo as paróquias ordenadas por proximidade das principais cidades.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Try auto-getting location on initial load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserCoords(coords);
          setMapCenter(coords);
          setMapZoom(12);
          setUserLocationName('Sua Localização GPS Atual');
        },
        () => {
          // Fallback location already set to São Paulo
        }
      );
    }
  }, []);

  // Compute distance for churches based on current user position or default center
  const churchesWithDistance = useMemo(() => {
    const baseLat = userCoords ? userCoords.lat : mapCenter.lat;
    const baseLng = userCoords ? userCoords.lng : mapCenter.lng;

    return INITIAL_CHURCHES.map((church) => {
      const dist = calculateDistanceKm(baseLat, baseLng, church.lat, church.lng);
      return { ...church, distanceKm: dist };
    }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [userCoords, mapCenter]);

  // Filter churches by query and selected filter tag
  const filteredChurches = useMemo(() => {
    return churchesWithDistance.filter((church) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        church.name.toLowerCase().includes(q) ||
        church.city.toLowerCase().includes(q) ||
        church.neighborhood?.toLowerCase().includes(q) ||
        church.diocese?.toLowerCase().includes(q) ||
        church.address.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterOption === 'catedrais') {
        return church.isCathedral;
      }
      if (filterOption === 'confissoes') {
        return Boolean(church.confessionSchedule);
      }

      return true;
    });
  }, [churchesWithDistance, searchQuery, filterOption]);

  const handleSelectChurch = (church: Church) => {
    setSelectedChurch(church);
    setMapCenter({ lat: church.lat, lng: church.lng });
    setMapZoom(15);
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 md:px-12 pt-8 pb-20 space-y-8">
      {/* Header Banner */}
      <div className="border-b border-[#d3c4af]/50 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#785600] font-sans text-xs font-bold uppercase tracking-widest mb-1">
            <Compass className="w-4 h-4" /> Localizador Católico • Eclesia
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1c1b1b] tracking-tight">
            Igrejas Próximas de Você
          </h1>
          <p className="font-sans text-sm md:text-base text-[#4f4535] mt-2 max-w-2xl leading-relaxed">
            Encontre paróquias, santuários e catedrais católicas perto da sua localização. Consulte os horários de Santas Missas, confissões e rotas no Google Maps.
          </p>
        </div>

        {/* GPS Button */}
        <button
          onClick={handleGetLocation}
          disabled={isLocating}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-widest rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0 self-start md:self-auto"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Buscando GPS...' : 'Usar Minha Localização GPS'}
        </button>
      </div>

      {/* Geolocation Status or Notice */}
      {userCoords && (
        <div className="bg-[#1c5d3a]/10 border border-[#1c5d3a]/30 text-[#1c5d3a] px-4 py-2.5 rounded-lg text-xs font-sans font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1c5d3a]" />
            Localização ativa: <strong>{userLocationName}</strong> ({userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)})
          </span>
          <span className="text-[11px] opacity-80 hidden sm:inline">Calculando distâncias em tempo real</span>
        </div>
      )}

      {locationError && (
        <div className="bg-[#9a3e3c]/10 border border-[#9a3e3c]/30 text-[#9a3e3c] px-4 py-2.5 rounded-lg text-xs font-sans font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Google Maps API Key Setup Banner if not yet set */}
      {!hasValidKey && (
        <div className="bg-[#ffdea6]/30 border-2 border-[#785600]/40 p-4 md:p-6 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#785600] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-[#1c1b1b]">
                Integração Nativa do Google Maps Ativa
              </h3>
              <p className="font-sans text-xs text-[#4f4535] leading-relaxed">
                A aplicação suporta renderização interativa do Google Maps em tempo real com marcadores estilizados.
              </p>
            </div>
          </div>
          <div className="bg-white/80 p-3 rounded border border-[#785600]/20 text-xs font-sans text-[#4f4535] space-y-1">
            <p className="font-bold text-[#1c1b1b]">Para ativar o mapa interativo renderizado via Google Maps JS SDK:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
              <li>Obtenha uma Chave do Google Maps Platform no Google Cloud Console</li>
              <li>No painel do AI Studio, abra <strong>Configurações (⚙️) → Secrets</strong></li>
              <li>Adicione a variável <code>GOOGLE_MAPS_PLATFORM_KEY</code> com sua chave API</li>
            </ol>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#f6f3f2] p-4 rounded-xl border border-[#d3c4af]/50">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#817563] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome da igreja, bairro ou cidade..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#d3c4af] rounded-lg font-sans text-xs text-[#1c1b1b] placeholder:text-[#817563] focus:border-[#785600] focus:ring-0 shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#817563] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          <button
            onClick={() => setFilterOption('todos')}
            className={`px-3 py-1.5 text-xs font-sans font-semibold rounded-full transition-all ${
              filterOption === 'todos'
                ? 'bg-[#1c1b1b] text-white'
                : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
            }`}
          >
            Todas ({churchesWithDistance.length})
          </button>
          <button
            onClick={() => setFilterOption('catedrais')}
            className={`px-3 py-1.5 text-xs font-sans font-semibold rounded-full transition-all ${
              filterOption === 'catedrais'
                ? 'bg-[#785600] text-white'
                : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
            }`}
          >
            Catedrais & Basílicas
          </button>
          <button
            onClick={() => setFilterOption('confissoes')}
            className={`px-3 py-1.5 text-xs font-sans font-semibold rounded-full transition-all ${
              filterOption === 'confissoes'
                ? 'bg-[#1c5d3a] text-white'
                : 'bg-white border border-[#d3c4af]/60 text-[#4f4535] hover:border-[#785600]'
            }`}
          >
            Com Confissões
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map + List & Detail Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Map View Container */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#d3c4af]/60 overflow-hidden shadow-xs space-y-0">
          <div className="bg-[#fcf9f8] p-3 border-b border-[#d3c4af]/40 flex items-center justify-between text-xs text-[#817563]">
            <span className="font-bold uppercase tracking-wider text-[#785600] flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> Mapa Interativo de Igrejas
            </span>
            <span>{filteredChurches.length} igrejas encontradas</span>
          </div>

          <div className="relative w-full h-[480px] lg:h-[580px] bg-[#e8e2de] flex items-center justify-center">
            {hasValidKey ? (
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  center={mapCenter}
                  zoom={mapZoom}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                  onCameraChanged={(ev) => {
                    setMapCenter(ev.detail.center);
                    setMapZoom(ev.detail.zoom);
                  }}
                >
                  {/* User Location Marker */}
                  {userCoords && (
                    <AdvancedMarker position={userCoords} title="Sua Posição GPS">
                      <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-md animate-pulse flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    </AdvancedMarker>
                  )}

                  {/* Church Markers */}
                  {filteredChurches.map((church) => (
                    <AdvancedMarker
                      key={church.id}
                      position={{ lat: church.lat, lng: church.lng }}
                      title={church.name}
                      onClick={() => handleSelectChurch(church)}
                    >
                      <Pin
                        background={selectedChurch?.id === church.id ? '#9a3e3c' : '#785600'}
                        glyphColor="#ffffff"
                        borderColor="#ffffff"
                      />
                    </AdvancedMarker>
                  ))}
                </Map>
              </APIProvider>
            ) : (
              /* Fallback Stylized Interactive Map Canvas when API key is pending */
              <div className="w-full h-full bg-[#f4f1ea] relative overflow-hidden flex flex-col justify-between p-6">
                {/* Simulated Map Background Grid Lines */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(#785600 1px, transparent 1px), linear-gradient(to right, #d3c4af 1px, transparent 1px), linear-gradient(to bottom, #d3c4af 1px, transparent 1px)',
                    backgroundSize: '20px 20px, 60px 60px, 60px 60px',
                  }}
                ></div>

                {/* Map Overlay Badge */}
                <div className="relative z-10 self-start bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#d3c4af] shadow-2xs text-xs font-sans text-[#1c1b1b] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="font-bold">Modo de Visualização Cartográfica Eclesia</span>
                </div>

                {/* Simulated Church Pins on Map */}
                <div className="absolute inset-0 p-12 flex flex-wrap items-center justify-around pointer-events-auto">
                  {filteredChurches.slice(0, 6).map((church) => (
                    <button
                      key={church.id}
                      onClick={() => handleSelectChurch(church)}
                      className={`group relative p-2 rounded-full transition-transform hover:scale-110 cursor-pointer ${
                        selectedChurch?.id === church.id ? 'z-20' : 'z-10'
                      }`}
                    >
                      <div
                        className={`px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 text-xs font-bold ${
                          selectedChurch?.id === church.id
                            ? 'bg-[#9a3e3c] text-white border-2 border-white'
                            : 'bg-[#785600] text-white border border-white'
                        }`}
                      >
                        <Cross className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{church.name.split(' ')[0]}</span>
                        {church.distanceKm !== undefined && (
                          <span className="bg-white/20 px-1 rounded text-[10px]">
                            {church.distanceKm}km
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Map Footer Note */}
                <div className="relative z-10 self-end bg-white/90 backdrop-blur-xs px-3 py-2 rounded-lg border border-[#d3c4af] text-[11px] text-[#817563] font-sans">
                  Clique em qualquer paróquia na lista ao lado para centralizar e abrir horários de missas.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Church List or Selected Church Details */}
        <div className="lg:col-span-5 space-y-4">
          {selectedChurch ? (
            /* Detailed Selected Church Drawer */
            <div className="bg-white p-6 rounded-xl border-2 border-[#785600] space-y-6 shadow-md animate-fade-in">
              <div className="flex items-start justify-between gap-3 border-b border-[#d3c4af]/40 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#785600]">
                    {selectedChurch.diocese || 'Paróquia Católica'}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-[#1c1b1b] leading-tight mt-0.5">
                    {selectedChurch.name}
                  </h3>
                  <p className="font-sans text-xs text-[#817563] mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#785600] shrink-0" />
                    {selectedChurch.address}, {selectedChurch.neighborhood} — {selectedChurch.city}, {selectedChurch.state}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedChurch(null)}
                  className="text-xs font-bold text-[#817563] hover:text-[#1c1b1b] underline shrink-0"
                >
                  Fechar
                </button>
              </div>

              {/* Distance & Action Buttons */}
              <div className="flex items-center justify-between gap-2 bg-[#fcf9f8] p-3 rounded-lg border border-[#d3c4af]/40">
                <div className="text-xs">
                  <span className="text-[#817563] text-[11px] block">Distância estimada:</span>
                  <strong className="text-sm text-[#785600]">{selectedChurch.distanceKm} km de você</strong>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedChurch.lat},${selectedChurch.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-[#785600] hover:bg-[#9a7000] text-white font-sans text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Traçar Rota no Maps
                </a>
              </div>

              {/* Mass Schedule */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#785600]">
                  <Clock className="w-4 h-4" />
                  <h4 className="font-display text-base font-bold text-[#1c1b1b]">Horários de Santas Missas</h4>
                </div>

                <div className="space-y-2 text-xs font-sans">
                  {selectedChurch.massSchedule?.sunday && (
                    <div className="bg-[#f6f3f2] p-2.5 rounded border border-[#d3c4af]/40">
                      <strong className="text-[#785600] uppercase tracking-wider text-[10px] block">Domingos:</strong>
                      <span className="text-[#1c1b1b] font-semibold">
                        {selectedChurch.massSchedule.sunday.join(' • ')}
                      </span>
                    </div>
                  )}

                  {selectedChurch.massSchedule?.weekday && (
                    <div className="bg-[#f6f3f2] p-2.5 rounded border border-[#d3c4af]/40">
                      <strong className="text-[#785600] uppercase tracking-wider text-[10px] block">Segunda a Sexta-feira:</strong>
                      <span className="text-[#1c1b1b] font-semibold">
                        {selectedChurch.massSchedule.weekday.join(' • ')}
                      </span>
                    </div>
                  )}

                  {selectedChurch.massSchedule?.saturday && (
                    <div className="bg-[#f6f3f2] p-2.5 rounded border border-[#d3c4af]/40">
                      <strong className="text-[#785600] uppercase tracking-wider text-[10px] block">Sábados:</strong>
                      <span className="text-[#1c1b1b] font-semibold">
                        {selectedChurch.massSchedule.saturday.join(' • ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Confession Schedule */}
              {selectedChurch.confessionSchedule && (
                <div className="p-3 bg-[#1c5d3a]/10 border border-[#1c5d3a]/30 rounded-lg space-y-1">
                  <strong className="text-xs font-bold text-[#1c5d3a] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Horários de Confissões
                  </strong>
                  <p className="text-xs text-[#1c1b1b]">{selectedChurch.confessionSchedule}</p>
                </div>
              )}

              {/* Phone & Contact */}
              {selectedChurch.phone && (
                <div className="pt-2 border-t border-[#d3c4af]/30 flex items-center justify-between text-xs text-[#817563]">
                  <span>Secretaria Paroquial:</span>
                  <a
                    href={`tel:${selectedChurch.phone.replace(/\D/g, '')}`}
                    className="font-bold text-[#785600] hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" /> {selectedChurch.phone}
                  </a>
                </div>
              )}
            </div>
          ) : (
            /* List of Nearby Churches */
            <div className="bg-white rounded-xl border border-[#d3c4af]/60 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#d3c4af]/40">
                <h3 className="font-display text-lg font-bold text-[#1c1b1b]">Igrejas Encontradas</h3>
                <span className="text-xs text-[#817563]">Ordenadas por proximidade</span>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredChurches.map((church) => (
                  <div
                    key={church.id}
                    onClick={() => handleSelectChurch(church)}
                    className="group cursor-pointer bg-[#fcf9f8] hover:bg-[#f6f3f2] p-4 rounded-lg border border-[#d3c4af]/40 hover:border-[#785600] transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#785600]">
                          {church.city}, {church.state}
                        </span>
                        <h4 className="font-display text-base font-bold text-[#1c1b1b] group-hover:text-[#785600] transition-colors leading-snug">
                          {church.name}
                        </h4>
                      </div>
                      {church.distanceKm !== undefined && (
                        <span className="bg-[#ffdea6]/50 text-[#785600] px-2 py-0.5 rounded text-[11px] font-bold shrink-0">
                          {church.distanceKm} km
                        </span>
                      )}
                    </div>

                    <p className="font-sans text-xs text-[#4f4535] line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#817563] shrink-0" />
                      {church.address} — {church.neighborhood}
                    </p>

                    {church.massSchedule?.sunday && (
                      <div className="text-[11px] text-[#817563] flex items-center gap-1.5 pt-1 border-t border-[#d3c4af]/20">
                        <Clock className="w-3 h-3 text-[#785600]" />
                        <span>Missas Domingo: {church.massSchedule.sunday.slice(0, 3).join(', ')}...</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
