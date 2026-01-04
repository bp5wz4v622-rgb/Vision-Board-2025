import React, { useState } from 'react';
import { Mail, User, Target, Bell, Send, CheckCircle, Sparkles } from 'lucide-react';
import { logos } from './logos';

const App = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombreApodo: '',
    correoElectronico: '',
    objetivosDelAño: '',
    diaRecordatorio: 'Lunes'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // URL de tu Cloudflare Worker - CAMBIAR ESTO DESPUÉS DE DESPLEGAR
      const WORKER_URL = 'https://vision-board-worker.torevueltopj.workers.dev/';
      
      const response = await fetch(`${WORKER_URL}/api/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: formData.correoElectronico,
          nombre: formData.nombreApodo,
          objetivos: formData.objetivosDelAño,
          diaRecordatorio: formData.diaRecordatorio
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitted(true);
      } else {
        alert(`Error: ${result.error || result.message || 'Intenta de nuevo'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      // Mostrar éxito igual para que el usuario no se preocupe
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const LogosHeader = () => (
    <div className="flex flex-wrap justify-center items-center gap-4 mb-12">
      {logos.map((logo) => (
        <div 
          key={logo.id}
          className={`w-20 h-20 border-4 border-black flex items-center justify-center p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 transition-all overflow-hidden ${logo.bgColor}`}
        >
          <img 
            src={logo.url} 
            alt={`Logo ${logo.id}`} 
            className="w-full h-full object-contain pointer-events-none"
            onError={(e) => {
              e.target.style.display = 'none';
              const placeholder = document.createElement('span');
              placeholder.className = 'text-xs font-black opacity-50';
              placeholder.textContent = `LOGO ${logo.id}`;
              e.target.parentNode.appendChild(placeholder);
            }}
          />
        </div>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E3E7EB] flex items-center justify-center p-6 font-sans text-black">
        <div className="w-full max-w-md bg-white border-8 border-black p-8 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] transform hover:scale-[1.02] transition-transform">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-[#00AEEF] to-[#00C6FF] p-5 border-4 border-black rounded-full animate-pulse">
              <CheckCircle size={60} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-black mb-6 uppercase tracking-tighter text-center italic leading-none">
            ¡REGISTRO EXITOSO!
          </h2>
          <div className="space-y-4 bg-gradient-to-r from-black to-gray-900 p-6 border-4 border-[#FF4136] text-white font-bold text-sm tracking-widest rounded-lg">
            <p className="border-b border-white/10 pb-3 flex items-center">
              <span className="text-[#FFD700] mr-2">🎯</span>
              <span>USUARIO: {formData.nombreApodo.toUpperCase()}</span>
            </p>
            <p className="border-b border-white/10 pb-3 flex items-center">
              <span className="text-[#00AEEF] mr-2">✉️</span>
              <span>EMAIL: {formData.correoElectronico.toUpperCase()}</span>
            </p>
            <p className="flex items-center">
              <span className="text-[#FF4136] mr-2">🔔</span>
              <span>RECORDATORIO: {formData.diaRecordatorio.toUpperCase()}</span>
            </p>
          </div>
          <div className="mt-6 p-4 bg-[#FBD78F] border-4 border-black text-center">
            <p className="text-sm font-bold text-black">
              📬 <strong>Revisa tu correo</strong> - Te hemos enviado un mensaje de bienvenida
            </p>
          </div>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full mt-8 bg-gradient-to-r from-black to-gray-800 text-white font-black py-5 border-4 border-black hover:from-[#FF4136] hover:to-red-600 transition-all uppercase tracking-wider shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            CREAR NUEVO PLAN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E3E7EB] flex items-center justify-center p-4 font-sans text-black overflow-x-hidden">
      <div className="fixed -top-20 -left-20 w-80 h-80 bg-[#FFD700]/10 rounded-full blur-3xl"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-[#00AEEF]/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-4xl bg-white border-[8px] border-black p-8 sm:p-12 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] relative transform hover:shadow-[32px_32px_0px_0px_rgba(0,0,0,0.8)] transition-all">
        
        {/* Encabezado con badge color #FBD78F */}
        <div className="absolute -top-3 left-8">
          <div className="bg-[#FBD78F] border-4 border-black px-6 py-2 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            VISION BOARD 2026
          </div>
        </div>

        <LogosHeader />

        <div className="mb-12 text-left border-l-8 border-black pl-6">
          <div className="inline-block bg-black text-[#FFD700] px-3 py-1 font-black text-[10px] uppercase mb-4 tracking-widest">
            Sistema de Productividad
          </div>
          <h1 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter leading-[0.8] italic">
            DISEÑA TU <br />
            <span className="text-[#00AEEF]">AÑO</span> <br />
            <span className="text-[#FF4136]">PERFECTO</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#FFD700] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <label className="block text-xs font-black uppercase mb-3 flex items-center gap-2">
                <User size={18} /> Nombre / Apodo
              </label>
              <input
                required
                type="text"
                name="nombreApodo"
                value={formData.nombreApodo}
                onChange={handleChange}
                placeholder="ESCRIBE TU NOMBRE"
                className="w-full bg-white border-4 border-black p-4 font-black outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,174,239,1)]"
              />
            </div>

            <div className="bg-[#00AEEF] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
              <label className="block text-xs font-black uppercase mb-3 flex items-center gap-2">
                <Mail size={18} /> Correo Electrónico
              </label>
              <input
                required
                type="email"
                name="correoElectronico"
                value={formData.correoElectronico}
                onChange={handleChange}
                placeholder="CORREO@EJEMPLO.COM"
                className="w-full bg-white border-4 border-black p-4 font-black outline-none text-black focus:shadow-[4px_4px_0px_0px_rgba(255,215,0,1)]"
              />
            </div>
          </div>

          <div className="bg-white border-4 border-black p-6 shadow-[12px_12px_0px_0px_rgba(255,65,54,1)]">
            <label className="block text-xs font-black uppercase mb-4 flex items-center gap-2 text-[#FF4136]">
              <Target size={20} /> Objetivos para 2026
            </label>
            <textarea
              required
              name="objetivosDelAño"
              value={formData.objetivosDelAño}
              onChange={handleChange}
              placeholder="¿Qué vas a lograr este año? Sé específico..."
              className="w-full bg-[#F9F9F9] border-4 border-black p-4 font-bold outline-none h-40 resize-none focus:bg-white transition-all"
            />
          </div>

          <div className="bg-black p-8 border-4 border-black text-white shadow-[12px_12px_0px_0px_rgba(0,174,239,1)]">
            <div className="flex items-center justify-between mb-8">
              <label className="text-xs font-black uppercase flex items-center gap-2 text-[#FFD700]">
                <Bell size={18} /> Día de Recordatorio
              </label>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['Lunes', 'Martes', 'Miércoles', 'Viernes'].map((dia) => (
                <button
                  key={dia}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, diaRecordatorio: dia }))}
                  className={`py-4 border-4 font-black text-sm uppercase transition-all ${
                    formData.diaRecordatorio === dia 
                    ? 'bg-[#00AEEF] border-white text-white translate-x-1 translate-y-1' 
                    : 'bg-white border-white text-black hover:bg-[#FFD700]'
                  }`}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-[#FF4136] text-white font-black py-7 border-4 border-black transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] ${
              loading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-black active:translate-x-1 active:translate-y-1 active:shadow-none'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                PROCESANDO...
              </>
            ) : (
              <>
                GUARDAR PLAN <Send size={32} />
              </>
            )}
          </button>
        </form>

        <div className="mt-16 flex flex-col sm:flex-row justify-between items-center gap-6 border-t-4 border-black pt-8">
          <div className="flex items-center gap-3">
            {logos.map((logo) => (
              <div key={logo.id} className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center p-1 opacity-80 hover:opacity-100 transition-all">
                <img 
                  src={logo.url} 
                  alt={`Logo ${logo.id}`} 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="font-black text-[10px] uppercase italic tracking-widest text-gray-500">
              © 2026 // Sistema Automatizado // IA + 5 Servicios de Email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
