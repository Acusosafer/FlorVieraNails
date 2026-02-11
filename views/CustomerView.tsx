
import React, { useState, useEffect, useMemo } from 'react';
import { api, formatDateDisplay } from '../services/mockApi';
import { Cliente, Turno, TurnoEstado, Servicio } from '../types';
import { getAIResponse } from '../services/aiService';
import { Card, Button, Input, Badge } from '../components/ui';
import { TabNav } from '../components/TabNav';
import { Calendar } from '../components/Calendar';

export const CustomerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inicio');
  const [whatsapp, setWhatsapp] = useState('');
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  
  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [comprobante, setComprobante] = useState<string | null>(null);

  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('¡Hola Reina! Soy Flori. ¿Cómo te sentís hoy? Contame lo que quieras, ¡acá esto para vos! 💖');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const savedWA = localStorage.getItem('fv_logged_wa');
    if (savedWA) {
      const c = api.getCliente(savedWA);
      if (c) {
        setCliente(c);
        setIsAuth(true);
      }
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const c = api.getCliente(whatsapp);
    if (c) {
      setCliente(c);
      localStorage.setItem('fv_logged_wa', whatsapp);
      setIsAuth(true);
    } else {
      const newC = { whatsapp, nombre: 'Reina', historialDisenos: [] };
      api.saveCliente(newC);
      setCliente(newC);
      localStorage.setItem('fv_logged_wa', whatsapp);
      setIsAuth(true);
      setActiveTab('ajustes');
    }
  };

  const handleAI = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    const resp = await getAIResponse(aiInput, cliente?.nombre);
    setAiResponse(resp || '');
    setAiInput('');
    setIsAiLoading(false);
  };

  const turnosDelMes = useMemo(() => {
    if (!cliente || !selectedDate) return 0;
    const [year, month] = selectedDate.split('-');
    return api.getTurnos().filter(t => 
      t.clienteWhatsapp === cliente.whatsapp && 
      t.estado !== TurnoEstado.RECHAZADO &&
      t.fecha.startsWith(`${year}-${month}`)
    ).length;
  }, [cliente, selectedDate]);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !selectedService || !selectedDate || !selectedTime || !comprobante) {
      alert("Por favor completa todos los pasos, incluyendo el comprobante 🌸");
      return;
    }

    if (turnosDelMes >= 4) {
      alert("Reina, ya alcanzaste el límite de 4 turnos para este mes. ¡Te esperamos el próximo! 💖");
      return;
    }

    const config = api.getConfig();
    const turno: Turno = {
      id: Math.random().toString(36).substr(2, 9),
      clienteWhatsapp: cliente.whatsapp,
      servicioId: selectedService.id,
      fecha: selectedDate,
      hora: selectedTime,
      estado: TurnoEstado.PENDIENTE,
      comprobanteUrl: comprobante,
      montoSenia: (selectedService.precio * config.porcentajeSenia) / 100
    };
    api.createTurno(turno);
    alert("¡Turno solicitado, Reina! Flor te avisará por WhatsApp 💖");
    setActiveTab('inicio');
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setComprobante(null);
  };

  const onProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && cliente) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = { ...cliente, fotoPerfil: reader.result as string };
        setCliente(updated);
        api.saveCliente(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const config = api.getConfig();

  if (!isAuth) {
    return (
      <div className="max-w-md mx-auto mt-20 animate-float px-4">
        <Card className="text-center shadow-2xl border-rose-100 bg-white/90">
          <h1 className="text-4xl font-cursive text-rose-500 mb-1">Flor Viera</h1>
          <h2 className="text-xs uppercase tracking-[0.3em] text-purple-400 mb-8 font-semibold">Nails & Makeup</h2>
          <p className="text-slate-500 mb-8 italic">¡Bienvenida a tu lugar mágico! ✨ Ingresá tu WhatsApp para brillar.</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <Input placeholder="Tu WhatsApp..." type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required />
            <Button className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-400 to-purple-400 border-none shadow-lg" type="submit">Entrar al Paraíso 💅</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-lg mx-auto px-2">
      <header className="mb-6 flex justify-between items-center py-6 border-b border-rose-100">
        <div onClick={() => setActiveTab('inicio')} className="cursor-pointer group">
          <h1 className="text-3xl font-cursive text-rose-600 leading-none group-hover:scale-105 transition-transform">Flor Viera</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-bold mt-1">Nails & Makeup</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-cursive text-rose-500">¡Bienvenida, {cliente?.nombre.split(' ')[0]}! 💖</p>
            <p className="text-[8px] text-slate-300 uppercase tracking-widest font-bold">Diosa Total</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-rose-200 shadow-lg overflow-hidden bg-rose-50">
            {cliente?.fotoPerfil ? <img src={cliente.fotoPerfil} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-rose-500 font-bold uppercase text-lg">{cliente?.nombre[0]}</div>}
          </div>
        </div>
      </header>

      {activeTab === 'inicio' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center py-4">
            <h2 className="text-2xl font-serif text-slate-700">¡Hola {cliente?.nombre}! ✨</h2>
            <p className="text-rose-400 font-cursive text-lg">¿Qué magia vamos a crear hoy? 💖</p>
          </div>

          <Card className="bg-gradient-to-br from-rose-400 via-rose-500 to-purple-500 text-white border-none overflow-hidden relative shadow-rose-200 shadow-2xl">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest">Flori IA</span>
                <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
              </h3>
              <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl text-sm mb-4 min-h-[80px] border border-white/20 italic shadow-inner">
                {isAiLoading ? "Pensando algo lindo para vos..." : aiResponse}
              </div>
              <div className="flex gap-2">
                <input 
                  className="flex-grow bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-xs outline-none placeholder:text-white/60 focus:bg-white/30 transition-all"
                  placeholder="¿Cómo te sentís hoy, Reina?"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAI()}
                />
                <button onClick={handleAI} className="bg-white text-rose-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-xl transition-transform active:scale-90 hover:scale-105">➜</button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveTab('agendar')} 
              className="bg-white rounded-3xl p-8 shadow-xl border border-rose-100 cursor-pointer hover:bg-rose-50 transition-all active:scale-95 text-center group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-rose-50 rounded-bl-full opacity-50"></div>
              <span className="text-4xl block mb-2 group-hover:animate-bounce">📅</span>
              <p className="font-bold text-slate-700 text-sm uppercase tracking-widest">Nuevo Turno</p>
              <p className="text-[10px] text-rose-300 italic mt-1 font-medium">Reservar mi lugar</p>
            </button>
            <button 
              onClick={() => setActiveTab('historial')} 
              className="bg-white rounded-3xl p-8 shadow-xl border border-rose-100 cursor-pointer hover:bg-purple-50 transition-all active:scale-95 text-center group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-purple-50 rounded-bl-full opacity-50"></div>
              <span className="text-4xl block mb-2 group-hover:animate-bounce">📸</span>
              <p className="font-bold text-slate-700 text-sm uppercase tracking-widest">Mis Diseños</p>
              <p className="text-[10px] text-purple-300 italic mt-1 font-medium">Ver mis fotos</p>
            </button>
          </div>

          <section className="pt-4">
             <div className="flex items-center gap-2 mb-4 ml-2">
                <div className="h-px bg-rose-100 flex-grow"></div>
                <h4 className="text-[10px] font-bold uppercase text-rose-400 tracking-[0.2em] whitespace-nowrap">Mis Turnos Próximos</h4>
                <div className="h-px bg-rose-100 flex-grow"></div>
             </div>
             <div className="space-y-3">
               {api.getTurnos().filter(t => t.clienteWhatsapp === cliente?.whatsapp && t.estado !== TurnoEstado.COMPLETADO).map(t => (
                 <div key={t.id} className={`bg-white/80 backdrop-blur-sm p-5 rounded-3xl shadow-sm border-2 flex justify-between items-center transition-all ${t.estado === TurnoEstado.PENDIENTE ? 'border-amber-100 bg-amber-50/10' : 'border-rose-100'}`}>
                   <div>
                     <p className="font-bold text-slate-700 text-base">{api.getServicios().find(s => s.id === t.servicioId)?.nombre}</p>
                     <p className="text-[11px] text-rose-500 font-bold uppercase tracking-widest mt-0.5">{formatDateDisplay(t.fecha)} • {t.hora}hs</p>
                   </div>
                   <Badge status={t.estado} />
                 </div>
               ))}
               {api.getTurnos().filter(t => t.clienteWhatsapp === cliente?.whatsapp && t.estado !== TurnoEstado.COMPLETADO).length === 0 && (
                  <div className="text-center text-slate-400 text-sm py-12 bg-white/50 rounded-3xl border border-dashed border-rose-100 italic">
                    Aún no tenés turnos, {cliente?.nombre.split(' ')[0]}. ¡Agendá uno y brillemos juntas! ✨💅
                  </div>
               )}
             </div>
          </section>
        </div>
      )}

      {activeTab === 'agendar' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
           <Card className="border-rose-100 bg-white/95 shadow-2xl">
             <h3 className="text-2xl font-cursive text-rose-500 mb-8 text-center">Elegí tu momento mágico, {cliente?.nombre.split(' ')[0]} ✨</h3>
             {config.diasDisponibles.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <span className="text-6xl animate-pulse">🌸</span>
                  <p className="text-slate-500 italic text-base">Flor aún está preparando las fechas.<br/>¡Volvé en un ratito, Reina! 💖</p>
                </div>
             ) : (
               <form onSubmit={handleBooking} className="space-y-8">
                  <div className="animate-in fade-in duration-300">
                    <label className="text-[11px] font-bold uppercase text-purple-400 block mb-4 ml-1 tracking-[0.2em]">1. ¿Qué magia creamos hoy? 💅</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {api.getServicios().map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => { setSelectedService(s); setSelectedDate(''); setSelectedTime(''); setComprobante(null); }}
                          className={`p-4 rounded-3xl border-2 cursor-pointer flex flex-col justify-between transition-all duration-300 ${selectedService?.id === s.id ? 'border-rose-400 bg-rose-50 shadow-inner scale-[0.98]' : 'border-slate-50 bg-white hover:border-rose-100 hover:bg-rose-50/30'}`}
                        >
                          <div>
                            <span className="font-bold text-xs block text-slate-700 leading-tight uppercase tracking-tight">{s.nombre}</span>
                            <span className="text-[9px] text-slate-400 font-semibold block mt-1 uppercase tracking-widest">{s.duracion} MINUTOS</span>
                            <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 italic leading-relaxed">"{s.descripcion}"</p>
                          </div>
                          <span className="text-rose-500 font-black text-sm mt-3 self-end">${s.precio}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedService && (
                    <div className="animate-in slide-in-from-top-4 duration-500">
                      <label className="text-[11px] font-bold uppercase text-purple-400 block mb-4 ml-1 tracking-[0.2em]">2. ¿Cuándo venís, Reina? 📅</label>
                      <Calendar 
                        selectedDate={selectedDate} 
                        onDateSelect={(date) => { setSelectedDate(date); setSelectedTime(''); setComprobante(null); }} 
                        availableDates={config.diasDisponibles}
                      />
                    </div>
                  )}

                  {selectedDate && (
                    <div className="animate-in slide-in-from-top-4 duration-500">
                      <label className="text-[11px] font-bold uppercase text-purple-400 block mb-4 ml-1 tracking-[0.2em]">3. ¿A qué hora brillamos? 🕒</label>
                      <div className="flex flex-wrap gap-2">
                        {config.horariosDisponibles.sort().map(h => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => { setSelectedTime(h); setComprobante(null); }}
                            className={`px-6 py-3 rounded-2xl text-xs transition-all border-2 font-black tracking-widest
                              ${selectedTime === h ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white border-transparent shadow-lg scale-105' : 'bg-white text-rose-400 border-rose-50 hover:border-rose-200 hover:bg-rose-50'}
                            `}
                          >
                            {h} HS
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTime && (
                    <div className="animate-in slide-in-from-top-4 duration-500 space-y-4">
                      <label className="text-[11px] font-bold uppercase text-purple-400 block mb-1 ml-1 tracking-[0.2em]">4. Seña para Agendar ✨📸</label>
                      <div className="bg-gradient-to-br from-rose-50/80 to-purple-50/80 p-8 rounded-[40px] border-2 border-dashed border-rose-200 shadow-inner group">
                        <p className="text-xs text-rose-600 mb-4 text-center leading-relaxed font-bold uppercase tracking-wider">
                          Reina, la seña es del <b>{config.porcentajeSenia}%</b>:<br/>
                          <span className="text-4xl font-serif block mt-3 text-rose-700 drop-shadow-sm">${(selectedService!.precio * config.porcentajeSenia / 100).toFixed(0)}</span>
                        </p>
                        
                        <div className="relative mt-6">
                          <input 
                            type="file" 
                            id="file-upload"
                            accept="image/*"
                            className="hidden" 
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if(file) {
                                const r = new FileReader();
                                r.onloadend = () => setComprobante(r.result as string);
                                r.readAsDataURL(file);
                              }
                            }} 
                          />
                          <label 
                            htmlFor="file-upload"
                            className={`flex flex-col items-center justify-center py-6 px-6 rounded-3xl cursor-pointer border-2 transition-all active:scale-95 duration-300
                              ${comprobante ? 'bg-emerald-500 text-white border-emerald-400 shadow-xl' : 'bg-white text-rose-400 border-rose-100 hover:border-purple-300 hover:text-purple-500 shadow-sm'}
                            `}
                          >
                            <span className="text-4xl mb-2">{comprobante ? '✨' : '📸'}</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                              {comprobante ? '¡Comprobante Listo! ✅' : 'Subir Comprobante de Seña'}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    className={`w-full py-6 text-base tracking-[0.2em] uppercase font-black shadow-2xl transition-all active:scale-95 border-none
                      ${(selectedService && selectedDate && selectedTime && comprobante) 
                        ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-rose-200' 
                        : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'}
                    `} 
                    type="submit" 
                    disabled={!selectedService || !selectedDate || !selectedTime || !comprobante}
                  >
                    Confirmar mi Turno ✨💅
                  </Button>
               </form>
             )}
           </Card>
        </div>
      )}

      {activeTab === 'historial' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="text-center py-4">
             <h3 className="text-2xl font-serif text-slate-800">Tu Galería Real 👑</h3>
             <p className="text-rose-400 font-cursive text-lg">Recordando lo hermosa que quedaste ✨</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {api.getTurnos()
              .filter(t => t.clienteWhatsapp === cliente?.whatsapp && t.estado === TurnoEstado.COMPLETADO && t.disenoUrl)
              .map(t => (
                <div key={t.id} className="relative group cursor-pointer" onClick={() => setSelectedPhoto(t.disenoUrl || null)}>
                  <div className="aspect-square rounded-[2rem] overflow-hidden shadow-xl border-4 border-white transition-all hover:scale-105 active:scale-95">
                    <img src={t.disenoUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg">
                    <p className="text-[10px] font-black text-slate-800 truncate uppercase tracking-tighter">
                      {api.getServicios().find(s => s.id === t.servicioId)?.nombre}
                    </p>
                    <p className="text-[9px] text-rose-500 font-bold mt-0.5">{formatDateDisplay(t.fecha)}</p>
                  </div>
                </div>
              ))}
            {api.getTurnos().filter(t => t.clienteWhatsapp === cliente?.whatsapp && t.estado === TurnoEstado.COMPLETADO && t.disenoUrl).length === 0 && (
              <div className="col-span-2 text-center py-24 bg-white/40 rounded-[3rem] border border-dashed border-rose-100 italic">
                <span className="text-6xl block mb-6 animate-pulse">✨</span>
                <p className="text-slate-500">Tus fotos aparecerán aquí pronto, {cliente?.nombre.split(' ')[0]}.<br/>¡No veo la hora de capturar tu estilo! 💅</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ajustes' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
           <Card className="text-center relative border-rose-100 bg-white/95 shadow-xl">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-rose-200 bg-rose-50 shadow-2xl">
                  {cliente?.fotoPerfil ? <img src={cliente.fotoPerfil} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-rose-300 text-5xl font-black">{cliente?.nombre[0]}</div>}
                </div>
                <label className="absolute bottom-1 right-1 bg-gradient-to-tr from-rose-500 to-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-4 border-white cursor-pointer active:scale-90 transition-transform">
                  📸
                  <input type="file" className="hidden" onChange={onProfilePhotoChange} />
                </label>
              </div>
              <h3 className="text-2xl font-serif text-slate-800">{cliente?.nombre}</h3>
              <p className="text-[11px] text-rose-400 font-black uppercase tracking-[0.3em] mt-1">{cliente?.whatsapp}</p>
           </Card>

           <Card className="space-y-6 border-rose-100 bg-white/95">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-purple-400 ml-1 tracking-widest">Mis Datos Reales 👑</label>
                <div className="bg-rose-50/40 rounded-[2rem] p-6 space-y-4 border border-rose-100 shadow-inner">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-tighter">WhatsApp</span>
                    <span className="font-black text-slate-700">{cliente?.whatsapp}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-tighter">Email</span>
                    <span className="font-black text-rose-500">{cliente?.email || '¡Falta cargar! 📧'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-tighter">Cumpleaños</span>
                    <span className="font-black text-rose-500">{cliente?.cumpleaños ? formatDateDisplay(cliente.cumpleaños) : '¡Falta cargar! 🎂'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Input label="Tu Nombre ✨" value={cliente?.nombre} onChange={e => {
                  const u = { ...cliente!, nombre: e.target.value };
                  setCliente(u);
                  api.saveCliente(u);
                }} />
                <Input label="Tu Email 📧" type="email" value={cliente?.email} onChange={e => {
                  const u = { ...cliente!, email: e.target.value };
                  setCliente(u);
                  api.saveCliente(u);
                }} />
                <Input label="Tu Cumpleaños 🎂" type="date" value={cliente?.cumpleaños} onChange={e => {
                  const u = { ...cliente!, cumpleaños: e.target.value };
                  setCliente(u);
                  api.saveCliente(u);
                }} />
              </div>

              <div className="pt-6">
                <Button variant="outline" className="w-full text-xs font-black uppercase tracking-[0.2em] border-rose-100 text-rose-300 hover:text-rose-500" onClick={() => {
                  localStorage.removeItem('fv_logged_wa');
                  window.location.reload();
                }}>Cerrar mi Sesión 🚪</Button>
              </div>
           </Card>
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in zoom-in-95 duration-300" onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} className="max-w-full max-h-[90vh] rounded-[3rem] shadow-2xl border-4 border-white/10" />
          <button className="absolute top-8 right-8 text-white text-4xl p-2 font-thin">✕</button>
        </div>
      )}

      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};
