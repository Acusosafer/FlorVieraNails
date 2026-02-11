
import React, { useState, useEffect, useMemo } from 'react';
import { api, formatDateDisplay } from '../services/mockApi';
import { Turno, TurnoEstado, Servicio, Cliente, ConfiguracionNegocio, Venta } from '../types';
import { Card, Button, Input, Badge } from '../components/ui';
import { TabNav } from '../components/TabNav';
import { WhatsAppIcon } from '../components/Icons';
import { Calendar } from '../components/Calendar';

export const AdminView: React.FC = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [activeTab, setActiveTab] = useState('panel');
  
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [config, setConfig] = useState<ConfiguracionNegocio>(api.getConfig());
  const [ventas, setVentas] = useState<Venta[]>([]);

  // Calculadora State
  const [calcItems, setCalcItems] = useState<{ nombre: string; precio: number }[]>([]);
  const [selectedCalcService, setSelectedCalcService] = useState('');
  const [selectedCalcCliente, setSelectedCalcCliente] = useState('');

  // Filtros
  const [filterName, setFilterName] = useState('');
  const [filterTime, setFilterTime] = useState<'todo' | 'hoy' | 'semana' | 'mes'>('todo');
  const [dashboardFilter, setDashboardFilter] = useState<'semana' | 'mes' | 'todo'>('semana');

  // Edición
  const [editingServ, setEditingServ] = useState<Servicio | null>(null);
  const [newServ, setNewServ] = useState({ nombre: '', descripcion: '', precio: 0, duracion: 60 });

  // Fotos Modal
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (isLogged) {
      setTurnos(api.getTurnos());
      setServicios(api.getServicios());
      setClientes(api.getClientes());
      setVentas(api.getVentas());
    }
  }, [isLogged]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'FlorViera' && pass === 'Flor1995') {
      setIsLogged(true);
    } else {
      alert("Credenciales incorrectas, Reina 🌸");
    }
  };

  const handleEstado = (id: string, nuevoEstado: TurnoEstado) => {
    const t = turnos.find(item => item.id === id);
    if (!t) return;
    api.updateTurno(id, { estado: nuevoEstado });
    setTurnos(api.getTurnos());

    if (nuevoEstado === TurnoEstado.ACEPTADO) {
      const cli = api.getCliente(t.clienteWhatsapp);
      const msg = `¡Hola ${cli?.nombre || 'Reina'}! 💖\nTu turno para el día ${formatDateDisplay(t.fecha)} a las ${t.hora} hs ya está confirmado ✨\nTe esperamos con muchas ganas 💅`;
      window.open(`https://wa.me/${t.clienteWhatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const handleFinish = (id: string, whatsapp: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        api.updateTurno(id, { estado: TurnoEstado.COMPLETADO, disenoUrl: url });
        const cli = api.getCliente(whatsapp);
        if (cli) {
          api.saveCliente({ ...cli, historialDisenos: [...cli.historialDisenos, url] });
        }
        setTurnos(api.getTurnos());
        alert("¡Turno finalizado y diseño guardado! ✨");
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const addItemToCalc = () => {
    const serv = servicios.find(s => s.id === selectedCalcService);
    if (serv) {
      setCalcItems([...calcItems, { nombre: serv.nombre, precio: serv.precio }]);
      setSelectedCalcService('');
    }
  };

  const recordSale = () => {
    const total = calcItems.reduce((acc, curr) => acc + curr.precio, 0);
    const nuevaVenta: Venta = {
      id: Math.random().toString(36).substr(2, 9),
      fecha: new Date().toISOString().split('T')[0],
      items: [...calcItems],
      total,
      clienteWhatsapp: selectedCalcCliente || undefined
    };
    api.saveVenta(nuevaVenta);
    setVentas(api.getVentas());
    setCalcItems([]);
    setSelectedCalcCliente('');
    alert("¡Venta registrada con éxito! 💰");
  };

  const birthdayBabies = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    return clientes.filter(c => {
      if (!c.cumpleaños) return false;
      const month = parseInt(c.cumpleaños.split('-')[1]);
      return month === currentMonth;
    });
  }, [clientes]);

  const toggleDate = (date: string) => {
    let newDates = [...config.diasDisponibles];
    if (newDates.includes(date)) {
      newDates = newDates.filter(d => d !== date);
    } else {
      newDates.push(date);
    }
    const updated = { ...config, diasDisponibles: newDates };
    setConfig(updated);
    api.saveConfig(updated);
  };

  const toggleHour = (hour: string) => {
    let newHours = [...config.horariosDisponibles];
    if (newHours.includes(hour)) {
      newHours = newHours.filter(h => h !== hour);
    } else {
      newHours.push(hour);
    }
    const updated = { ...config, horariosDisponibles: newHours };
    setConfig(updated);
    api.saveConfig(updated);
  };

  // Lógica para el gráfico de barras dinámica según filtro
  const barChartData = useMemo(() => {
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)));
    
    return days.map((label, idx) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + idx);
      const dateStr = dayDate.toISOString().split('T')[0];
      
      const dayTotal = ventas
        .filter(v => v.fecha === dateStr)
        .reduce((sum, v) => sum + v.total, 0);
      
      return { label: label.charAt(0), total: dayTotal, fullLabel: label };
    });
  }, [ventas]);

  const currentMonthTotal = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7);
    return ventas
      .filter(v => v.fecha.startsWith(currentMonth))
      .reduce((sum, v) => sum + v.total, 0);
  }, [ventas]);

  const dashboardTotal = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (dashboardFilter === 'mes') {
      return currentMonthTotal;
    } else if (dashboardFilter === 'semana') {
      const startOfWeek = new Date(now.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return ventas
        .filter(v => {
          const d = new Date(v.fecha);
          return d >= startOfWeek && d <= endOfWeek;
        })
        .reduce((sum, v) => sum + v.total, 0);
    }
    return ventas.reduce((sum, v) => sum + v.total, 0);
  }, [ventas, dashboardFilter, currentMonthTotal]);

  const maxTotal = useMemo(() => Math.max(...barChartData.map(d => d.total), 1), [barChartData]);

  // Filtro de turnos
  const filteredTurnos = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    return turnos.filter(t => {
      if (filterTime === 'hoy') return t.fecha === todayStr;
      if (filterTime === 'semana') {
        const tDate = new Date(t.fecha);
        const start = new Date(now.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return tDate >= start && tDate <= end;
      }
      if (filterTime === 'mes') return t.fecha.startsWith(todayStr.substring(0, 7));
      return true;
    });
  }, [turnos, filterTime]);

  const sortedServicios = useMemo(() => {
    return [...servicios].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [servicios]);

  if (!isLogged) {
    return (
      <div className="max-w-md mx-auto mt-20 px-4">
        <Card className="border-rose-200 bg-white/95">
          <h1 className="text-4xl font-cursive text-rose-500 mb-1 text-center">Flor Viera</h1>
          <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-8 text-center font-bold">Nails & Makeup Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)} required />
            <Input placeholder="Contraseña" type="password" value={pass} onChange={e => setPass(e.target.value)} required />
            <Button className="w-full bg-gradient-to-r from-rose-500 to-purple-500 py-3 border-none shadow-lg font-bold" type="submit">Entrar Profesional</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-lg mx-auto px-2">
      <header className="mb-6 py-4 flex justify-between items-center border-b border-rose-100">
        <div>
          <h1 className="text-2xl font-cursive text-rose-600 leading-none">Flor Viera</h1>
          <p className="text-[8px] uppercase tracking-[0.2em] text-slate-400 font-bold">Nails & Makeup Admin</p>
        </div>
        {birthdayBabies.length > 0 && (
          <button 
            onClick={() => setActiveTab('clientas')}
            className="bg-rose-500 text-white p-2 rounded-2xl animate-bounce shadow-lg flex items-center gap-1"
          >
            <span className="text-sm">🎂</span>
            <span className="text-[7px] font-black uppercase tracking-tighter">Cumples!</span>
          </button>
        )}
      </header>

      {activeTab === 'panel' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <Card className="bg-gradient-to-br from-rose-500 to-purple-500 text-white border-none shadow-2xl p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            
            <div className="flex justify-between items-center mb-1">
               <h3 className="text-[10px] uppercase font-black opacity-80 tracking-[0.2em]">
                 Ingresos {dashboardFilter === 'mes' ? 'del Mes' : dashboardFilter === 'semana' ? 'Semanales' : 'Totales'} (ARS)
               </h3>
               <div className="flex gap-1">
                 {(['semana', 'mes', 'todo'] as const).map(f => (
                   <button 
                    key={f} 
                    onClick={() => setDashboardFilter(f)}
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border border-white/30 transition-all ${dashboardFilter === f ? 'bg-white text-rose-500' : 'bg-transparent text-white'}`}
                   >
                     {f}
                   </button>
                 ))}
               </div>
            </div>
            
            <p className="text-4xl font-serif font-black text-white drop-shadow-sm">$ {dashboardTotal.toLocaleString()}</p>
            
            <div className="mt-8 flex items-end justify-between h-32 gap-2">
              {barChartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full bg-white/20 rounded-t-xl overflow-hidden h-full flex flex-col justify-end">
                    <div 
                      className="bg-white/90 w-full rounded-t-xl transition-all duration-1000 group-hover:bg-white group-hover:shadow-lg"
                      style={{ height: `${(d.total / maxTotal) * 100}%` }}
                    ></div>
                    {d.total > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[7px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-rose-600 px-1 rounded text-white shadow">
                        ${d.total}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-black opacity-70 uppercase">{d.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[8px] text-center mt-3 font-black uppercase tracking-widest opacity-60">Ventas Diarias (Lunes a Sábado)</p>
          </Card>

          <Card className="border-rose-100 p-5 bg-white/90">
            <h3 className="text-[9px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Registro Histórico de Ventas</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide pr-1">
              {ventas.slice().reverse().map(v => (
                <div key={v.id} className="flex justify-between items-center p-3 bg-rose-50/50 rounded-2xl border border-rose-100 transition-all hover:scale-[1.02] shadow-sm">
                  <div className="text-[10px] font-bold">
                    <p className="text-slate-800">{formatDateDisplay(v.fecha)}</p>
                    <p className="text-purple-400 italic truncate w-40 font-medium">{v.items.map(i => i.nombre).join(', ')}</p>
                  </div>
                  <p className="font-black text-rose-500 text-sm">$ {v.total}</p>
                </div>
              ))}
              {ventas.length === 0 && <p className="text-center text-[10px] text-slate-300 italic py-4">Aún no has registrado ventas, Reina. ✨</p>}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'calculadora' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <Card className="border-rose-100 p-6 bg-white/95 shadow-xl">
            <h3 className="font-cursive text-rose-500 text-xl mb-6 text-center">Cotizador Aesthetick 🧮</h3>
            <div className="space-y-5">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <select 
                    className="w-full p-4 rounded-3xl border-2 border-rose-100 text-[11px] font-black bg-rose-50 text-rose-600 outline-none focus:border-purple-300 appearance-none shadow-inner"
                    value={selectedCalcService}
                    onChange={e => setSelectedCalcService(e.target.value)}
                  >
                    <option value="">+ ELEGIR ITEM (A-Z)...</option>
                    {sortedServicios.map(s => <option key={s.id} value={s.id}>{s.nombre} (${s.precio})</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400 text-xs">▼</div>
                </div>
                <button 
                  onClick={addItemToCalc} 
                  className="bg-gradient-to-tr from-rose-500 to-purple-500 text-white w-14 h-14 rounded-3xl flex items-center justify-center text-2xl font-black active:scale-90 transition-all shadow-xl shadow-rose-200"
                >+</button>
              </div>

              <div className="bg-gradient-to-br from-rose-50/80 to-purple-50/80 p-6 rounded-[2.5rem] min-h-[120px] space-y-3 border-2 border-rose-100 shadow-inner">
                {calcItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px] animate-in slide-in-from-left-2">
                    <span className="text-slate-600 font-bold uppercase tracking-tighter">{item.nombre}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-rose-600 tracking-widest">${item.precio}</span>
                      <button onClick={() => setCalcItems(calcItems.filter((_, idx) => idx !== i))} className="text-rose-300 hover:text-red-500 font-black">✕</button>
                    </div>
                  </div>
                ))}
                {calcItems.length > 0 && (
                  <div className="pt-4 border-t border-rose-200 mt-4 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</span>
                    <span className="text-2xl font-serif font-black text-rose-600 animate-pulse">${calcItems.reduce((acc, curr) => acc + curr.precio, 0)}</span>
                  </div>
                )}
                {calcItems.length === 0 && <p className="text-center text-[9px] text-rose-300 italic py-6 uppercase font-bold tracking-widest opacity-50">Seleccioná un servicio para cotizar ✨</p>}
              </div>

              {calcItems.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="relative">
                    <select 
                      className="w-full p-4 rounded-3xl border-2 border-rose-100 text-[11px] font-bold bg-white text-slate-600 outline-none focus:border-purple-300 appearance-none shadow-sm"
                      value={selectedCalcCliente}
                      onChange={e => setSelectedCalcCliente(e.target.value)}
                    >
                      <option value="">¿A QUÉ DIOSA COBRAMOS? 👑</option>
                      {clientes.map(c => <option key={c.whatsapp} value={c.whatsapp}>{c.nombre}</option>)}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-rose-300 text-xs">▼</div>
                  </div>
                  <Button className="w-full py-5 text-xs tracking-[0.3em] uppercase font-black shadow-2xl bg-gradient-to-r from-rose-500 to-purple-600 border-none hover:scale-[1.02]" onClick={recordSale}>Registrar Venta Final 💰</Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'turnos' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Solicitudes</h4>
              <div className="flex gap-1">
                {(['todo', 'hoy', 'semana', 'mes'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilterTime(f)}
                    className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter border-2 ${filterTime === f ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-rose-300 border-rose-50'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredTurnos.filter(t => t.estado !== TurnoEstado.COMPLETADO && t.estado !== TurnoEstado.RECHAZADO).map(t => {
                const cli = api.getCliente(t.clienteWhatsapp);
                const srv = servicios.find(s => s.id === t.servicioId);
                return (
                  <div key={t.id} className={`bg-white/95 p-4 rounded-3xl shadow-lg border-l-8 transition-all ${t.estado === TurnoEstado.PENDIENTE ? 'border-l-amber-400' : 'border-l-purple-400'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-none">{cli?.nombre}</p>
                        <p className="text-[10px] text-rose-500 font-black uppercase mt-1.5">{formatDateDisplay(t.fecha)} | {t.hora}hs</p>
                      </div>
                      <Badge status={t.estado} />
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 mb-4">{srv?.nombre} - <span className="text-rose-600 font-black tracking-widest">${srv?.precio}</span></p>

                    {t.comprobanteUrl && (
                      <button 
                        onClick={() => setSelectedPhoto(t.comprobanteUrl || null)}
                        className="w-full mb-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-100"
                      >Ver Comprobante de Seña 🖼️</button>
                    )}

                    <div className="flex gap-2">
                      {t.estado === TurnoEstado.PENDIENTE && (
                        <button onClick={() => handleEstado(t.id, TurnoEstado.ACEPTADO)} className="flex-grow py-3 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-50 active:scale-95">Confirmar</button>
                      )}
                      {t.estado === TurnoEstado.ACEPTADO && (
                        <button onClick={() => handleFinish(t.id, t.clienteWhatsapp)} className="flex-grow py-3 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-50 active:scale-95">Terminar 📸</button>
                      )}
                      <button onClick={() => { if(confirm('¿Rechazar este turno definitivamente?')) handleEstado(t.id, TurnoEstado.RECHAZADO) }} className="px-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100 active:scale-90 transition-transform">✕</button>
                      
                      <button 
                        onClick={() => {
                          const startStr = t.fecha.replace(/-/g, '') + 'T' + t.hora.replace(':', '') + '00Z';
                          const endStr = t.fecha.replace(/-/g, '') + 'T' + (parseInt(t.hora.split(':')[0]) + 1).toString().padStart(2, '0') + t.hora.split(':')[1] + '00Z';
                          const gcalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Flor Viera: ' + srv?.nombre + ' - ' + cli?.nombre)}&dates=${startStr}/${endStr}&details=${encodeURIComponent('Cliente: ' + t.clienteWhatsapp + '\nSeña: $' + t.montoSenia)}`;
                          window.open(gcalUrl, '_blank');
                        }}
                        className="px-4 bg-blue-50 text-blue-500 rounded-2xl text-lg font-bold border border-blue-100 active:scale-90 transition-transform"
                        title="Agendar en Google Calendar"
                      >🗓️</button>

                      <a href={`https://wa.me/${t.clienteWhatsapp}`} target="_blank" className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm hover:scale-105 transition-transform"><WhatsAppIcon className="w-5 h-5" /></a>
                    </div>
                  </div>
                );
              })}
              {filteredTurnos.length === 0 && (
                <div className="text-center py-16 bg-white/40 rounded-3xl border border-dashed border-rose-100 italic text-[10px] uppercase font-bold text-slate-300">
                  No hay turnos para este período ✨
                </div>
              )}
            </div>
          </div>

          <Card className="border-rose-100 p-5 bg-white/95 shadow-lg">
            <h3 className="font-bold text-rose-500 mb-6 uppercase text-[10px] tracking-[0.2em] text-center">Gestión de Agenda y Disponibilidad 📅</h3>
            <Calendar selectedDate="" onDateSelect={toggleDate} availableDates={config.diasDisponibles} mode="toggle" />
            
            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 mt-8 ml-1 tracking-[0.2em] text-center">Configurar Horarios Activos</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map(h => {
                const isActive = config.horariosDisponibles.includes(h);
                return (
                  <button 
                    key={h}
                    onClick={() => toggleHour(h)}
                    className={`px-4 py-2 text-[10px] rounded-2xl border-2 transition-all font-black shadow-sm
                      ${isActive ? 'bg-purple-500 text-white border-purple-500 scale-105 shadow-purple-100' : 'bg-white text-slate-300 border-rose-50 hover:border-rose-200'}`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'clientas' && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <Input placeholder="Buscar por nombre o WhatsApp..." value={filterName} onChange={e => setFilterName(e.target.value)} className="shadow-sm py-3 text-xs" />
          <div className="grid gap-3">
            {clientes.filter(c => c.nombre.toLowerCase().includes(filterName.toLowerCase()) || c.whatsapp.includes(filterName)).map(c => {
               const isBirthday = birthdayBabies.some(b => b.whatsapp === c.whatsapp);
               return (
                 <div key={c.whatsapp} className={`bg-white/95 p-4 rounded-[2rem] shadow-lg border-2 flex items-center gap-4 relative transition-all hover:scale-[1.01] ${isBirthday ? 'border-rose-400 bg-rose-50/40' : 'border-rose-50'}`}>
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-rose-50 border-2 border-white shadow-xl flex-shrink-0">
                      {c.fotoPerfil ? <img src={c.fotoPerfil} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-rose-300 font-black text-xl uppercase">{c.nombre[0]}</div>}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-black text-slate-800 text-sm truncate uppercase tracking-tighter">{c.nombre} {isBirthday && '🎂'}</h4>
                        <a href={`https://wa.me/${c.whatsapp}`} target="_blank" className="text-emerald-500 hover:scale-110 transition-transform"><WhatsAppIcon className="w-4 h-4" /></a>
                      </div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest truncate">{c.whatsapp} • {c.email || 'SIN EMAIL'}</p>
                      <p className="text-[9px] text-purple-400 font-black uppercase tracking-tighter mt-1 bg-purple-50 px-2 py-0.5 rounded-full inline-block">Bday: {c.cumpleaños ? formatDateDisplay(c.cumpleaños) : 'N/A'}</p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto max-w-[100px] scrollbar-hide">
                      {c.historialDisenos.slice(-3).map((img, i) => (
                        <img key={i} src={img} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md flex-shrink-0 cursor-pointer transition-transform hover:scale-110" onClick={() => setSelectedPhoto(img)} />
                      ))}
                    </div>
                 </div>
               );
            })}
          </div>
        </div>
      )}

      {activeTab === 'servicios' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <Card className="border-rose-100 p-6 bg-white/95 shadow-xl">
             <h3 className="font-cursive text-rose-500 text-xl mb-6 text-center">{editingServ ? 'Modificar' : 'Nuevo'} Servicio 💅</h3>
             <form onSubmit={(e) => {
               e.preventDefault();
               const servToSave: Servicio = editingServ ? { ...editingServ, ...newServ } : { id: Math.random().toString(36).substr(2, 9), ...newServ };
               api.saveServicio(servToSave);
               setServicios(api.getServicios());
               setEditingServ(null);
               setNewServ({ nombre: '', descripcion: '', precio: 0, duracion: 60 });
               alert("Servicio actualizado con éxito ✨");
             }} className="space-y-4">
                <Input label="Nombre del Servicio" value={newServ.nombre} onChange={e => setNewServ({...newServ, nombre: e.target.value})} required className="text-xs" />
                <div className="grid grid-cols-2 gap-4">
                   <Input label="Precio ($)" type="number" value={newServ.precio} onChange={e => setNewServ({...newServ, precio: parseInt(e.target.value) || 0})} required className="text-xs" />
                   <Input label="Duración (minutos)" type="number" value={newServ.duracion} onChange={e => setNewServ({...newServ, duracion: parseInt(e.target.value) || 0})} required className="text-xs" />
                </div>
                <Input label="Descripción" value={newServ.descripcion} onChange={e => setNewServ({...newServ, descripcion: e.target.value})} className="text-xs" />
                <Button className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] shadow-lg bg-gradient-to-r from-rose-500 to-rose-400 border-none" type="submit">Guardar Servicio ✨</Button>
             </form>
          </Card>
          
          <div className="grid gap-3">
            {servicios.map(s => (
              <div key={s.id} className="p-5 bg-white rounded-[2rem] border-2 border-rose-50 shadow-sm flex justify-between items-center transition-all hover:bg-rose-50/20">
                <div className="max-w-[70%]">
                  <p className="font-black text-slate-800 text-xs uppercase tracking-tight">{s.nombre}</p>
                  <p className="text-[10px] text-rose-500 font-black uppercase mt-1 tracking-widest">${s.precio} • {s.duracion} MIN</p>
                  <p className="text-[9px] text-slate-400 italic mt-1 truncate">"{s.descripcion}"</p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => { setEditingServ(s); setNewServ(s); }} className="text-rose-300 p-3 bg-rose-50 rounded-2xl hover:text-rose-600 transition-colors">✎</button>
                   <button onClick={() => { if(confirm('¿Borrar definitivamente?')) { api.deleteServicio(s.id); setServicios(api.getServicios()); } }} className="text-rose-300 p-3 bg-rose-50 rounded-2xl hover:text-red-500 transition-colors">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ajustes' && (
        <div className="animate-in fade-in duration-500">
           <Card className="border-purple-100 p-6 bg-white/95 shadow-xl">
             <h3 className="font-cursive text-slate-800 text-xl mb-8 text-center">Configuración General ⚙️</h3>
             <div className="space-y-6">
                <div className="p-6 bg-rose-50/50 rounded-[2.5rem] border-2 border-rose-100">
                  <Input label="Porcentaje de Seña Sugerido (%)" type="number" value={config.porcentajeSenia} onChange={e => {
                      const updated = {...config, porcentajeSenia: parseInt(e.target.value) || 0};
                      setConfig(updated);
                      api.saveConfig(updated);
                    }} className="text-center font-black text-lg" />
                  <p className="text-[9px] text-slate-400 mt-4 text-center font-bold tracking-widest uppercase">Este valor automatiza el cálculo para las clientas ✨</p>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] border-rose-200 text-rose-500 bg-white" onClick={() => { setIsLogged(false); window.location.hash = ''; }}>Cerrar Sesión Profesional 🚪</Button>
                </div>
             </div>
           </Card>
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in zoom-in-95 duration-300" onClick={() => setSelectedPhoto(null)}>
          <img src={selectedPhoto} className="max-w-full max-h-[90vh] rounded-[3rem] shadow-2xl border-4 border-white/20" />
          <button className="absolute top-8 right-8 text-white text-3xl p-4 font-thin">✕</button>
        </div>
      )}

      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} variant="admin" />
    </div>
  );
};
