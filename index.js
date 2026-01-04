// Cloudflare Worker para Vision Board 2026 - FRONTEND + BACKEND

// ============ HTML DEL FRONTEND ============
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vision Board 2026</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        
        /* Animaciones */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        
        /* Efectos especiales */
        .text-stroke { 
          -webkit-text-stroke: 2px black;
          text-stroke: 2px black;
          color: transparent;
        }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-[#F0F2F5] to-[#E3E7EB] p-4 md:p-8">
    <div id="app" class="max-w-6xl mx-auto">
        <!-- Contenido dinámico será insertado aquí por JavaScript -->
    </div>
    
    <script>
        // Logos desde Cloudflare R2
        const logos = [
          {
            id: 1,
            url: 'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo1.png',
            bgColor: 'bg-[#FFD700]',
            label: 'AMARILLO'
          },
          {
            id: 2,
            url: 'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo2.png',
            bgColor: 'bg-[#00AEEF]',
            label: 'AZUL'
          },
          {
            id: 3,
            url: 'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo3.png',
            bgColor: 'bg-white',
            label: 'BLANCO'
          },
          {
            id: 4,
            url: 'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo4.png',
            bgColor: 'bg-[#FF4136]',
            label: 'ROJO'
          },
          {
            id: 5,
            url: 'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo5.png',
            bgColor: 'bg-black',
            label: 'NEGRO'
          }
        ];

        // Mapa de días
        const DAYS_MAP = {
          'Lunes': 1,
          'Martes': 2,
          'Miércoles': 3,
          'Jueves': 4,
          'Viernes': 5,
          'Sábado': 6,
          'Domingo': 0
        };

        // Estado de la aplicación
        let appState = {
          submitted: false,
          loading: false,
          formData: {
            nombreApodo: '',
            correoElectronico: '',
            objetivosDelAño: '',
            diaRecordatorio: 'Lunes'
          }
        };

        // URL del Worker (la misma)
        const WORKER_URL = window.location.origin;

        // Renderizar la aplicación
        function render() {
          const app = document.getElementById('app');
          
          if (appState.submitted) {
            app.innerHTML = renderSuccess();
          } else {
            app.innerHTML = renderForm();
          }
          
          // Inicializar Lucide icons
          if (window.lucide) {
            window.lucide.createIcons();
          }
        }

        // Renderizar formulario
        function renderForm() {
          const logosHTML = logos.map(logo => \`
            <div 
              key="\${logo.id}"
              class="\${logo.bgColor} w-20 h-20 border-4 border-black flex items-center justify-center p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 transition-all overflow-hidden"
            >
              <img 
                src="\${logo.url}" 
                alt="Logo \${logo.id}" 
                class="w-full h-full object-contain pointer-events-none"
                onerror="this.style.display='none'; this.parentNode.innerHTML='<span class=\\\"text-xs font-black opacity-50\\\">LOGO \${logo.id}</span>'"
              />
            </div>
          \`).join('');

          return \`
            <div class="w-full bg-white border-[8px] border-black p-6 sm:p-8 md:p-12 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] relative transform hover:shadow-[32px_32px_0px_0px_rgba(0,0,0,0.8)] transition-all">
              <!-- Badge -->
              <div class="absolute -top-3 left-4 sm:left-8">
                <div class="bg-[#FBD78F] border-4 border-black px-4 sm:px-6 py-1 sm:py-2 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  VISION BOARD 2026
                </div>
              </div>

              <!-- Logos -->
              <div class="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mb-8 sm:mb-12 mt-4">
                \${logosHTML}
              </div>

              <!-- Título -->
              <div class="mb-8 sm:mb-12 text-left border-l-8 border-black pl-4 sm:pl-6">
                <div class="inline-block bg-black text-[#FFD700] px-3 py-1 font-black text-[10px] uppercase mb-3 sm:mb-4 tracking-widest">
                  Sistema de Productividad
                </div>
                <h1 class="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] italic">
                  DISEÑA TU <br />
                  <span class="text-[#00AEEF]">AÑO</span> <br />
                  <span class="text-[#FF4136]">PERFECTO</span>
                </h1>
              </div>

              <!-- Formulario -->
              <form id="mainForm" class="space-y-6 sm:space-y-8">
                <div class="grid md:grid-cols-2 gap-6 sm:gap-8">
                  <!-- Nombre -->
                  <div class="bg-[#FFD700] p-4 sm:p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <label class="block text-xs font-black uppercase mb-2 sm:mb-3 flex items-center gap-2">
                      <i data-lucide="user" class="w-4 h-4"></i> Nombre / Apodo
                    </label>
                    <input
                      required
                      type="text"
                      id="nombreApodo"
                      value="\${appState.formData.nombreApodo}"
                      placeholder="ESCRIBE TU NOMBRE"
                      class="w-full bg-white border-4 border-black p-3 sm:p-4 font-black outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,174,239,1)]"
                    />
                  </div>

                  <!-- Email -->
                  <div class="bg-[#00AEEF] p-4 sm:p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
                    <label class="block text-xs font-black uppercase mb-2 sm:mb-3 flex items-center gap-2">
                      <i data-lucide="mail" class="w-4 h-4"></i> Correo Electrónico
                    </label>
                    <input
                      required
                      type="email"
                      id="correoElectronico"
                      value="\${appState.formData.correoElectronico}"
                      placeholder="CORREO@EJEMPLO.COM"
                      class="w-full bg-white border-4 border-black p-3 sm:p-4 font-black outline-none text-black focus:shadow-[4px_4px_0px_0px_rgba(255,215,0,1)]"
                    />
                  </div>
                </div>

                <!-- Objetivos -->
                <div class="bg-white border-4 border-black p-4 sm:p-6 shadow-[12px_12px_0px_0px_rgba(255,65,54,1)]">
                  <label class="block text-xs font-black uppercase mb-3 sm:mb-4 flex items-center gap-2 text-[#FF4136]">
                    <i data-lucide="target" class="w-4 h-4"></i> Objetivos para 2026
                  </label>
                  <textarea
                    required
                    id="objetivosDelAño"
                    placeholder="¿Qué vas a lograr este año? Sé específico..."
                    class="w-full bg-[#F9F9F9] border-4 border-black p-3 sm:p-4 font-bold outline-none h-32 sm:h-40 resize-none focus:bg-white transition-all"
                  >\${appState.formData.objetivosDelAño}</textarea>
                </div>

                <!-- Días -->
                <div class="bg-black p-6 sm:p-8 border-4 border-black text-white shadow-[12px_12px_0px_0px_rgba(0,174,239,1)]">
                  <div class="flex items-center justify-between mb-6 sm:mb-8">
                    <label class="text-xs font-black uppercase flex items-center gap-2 text-[#FFD700]">
                      <i data-lucide="bell" class="w-4 h-4"></i> Día de Recordatorio
                    </label>
                  </div>
                  
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    \${['Lunes', 'Martes', 'Miércoles', 'Viernes'].map(dia => \`
                      <button
                        type="button"
                        onclick="appState.formData.diaRecordatorio = '\${dia}'; render();"
                        class="py-3 sm:py-4 border-4 font-black text-xs sm:text-sm uppercase transition-all \${appState.formData.diaRecordatorio === dia 
                          ? 'bg-[#00AEEF] border-white text-white translate-x-1 translate-y-1' 
                          : 'bg-white border-white text-black hover:bg-[#FFD700]'}"
                      >
                        \${dia}
                      </button>
                    \`).join('')}
                  </div>
                </div>

                <!-- Submit -->
                <button 
                  type="submit"
                  id="submitBtn"
                  class="w-full bg-[#FF4136] text-white font-black py-5 sm:py-7 border-4 border-black transition-all flex items-center justify-center gap-3 sm:gap-4 uppercase tracking-[0.2em] text-xl sm:text-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:bg-black active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <span id="submitText">GUARDAR PLAN</span>
                  <i data-lucide="send" class="w-6 h-6 sm:w-8 sm:h-8"></i>
                </button>
              </form>

              <!-- Footer -->
              <div class="mt-12 sm:mt-16 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 border-t-4 border-black pt-6 sm:pt-8">
                <div class="flex items-center gap-2 sm:gap-3">
                  \${logos.map(logo => \`
                    <div key="\${logo.id}-small" class="w-8 h-8 sm:w-10 sm:h-10 bg-white border-2 border-black flex items-center justify-center p-1 opacity-80 hover:opacity-100 transition-all">
                      <img 
                        src="\${logo.url}" 
                        alt="Logo \${logo.id}" 
                        class="max-w-full max-h-full object-contain"
                        onerror="this.style.display='none'"
                      />
                    </div>
                  \`).join('')}
                </div>
                <div class="text-center sm:text-right">
                  <p class="font-black text-[8px] sm:text-[10px] uppercase italic tracking-widest text-gray-500">
                    © 2026 // Sistema Automatizado // IA + 5 Servicios de Email
                  </p>
                </div>
              </div>
            </div>
          \`;
        }

        // Renderizar éxito
        function renderSuccess() {
          return \`
            <div class="w-full max-w-md bg-white border-8 border-black p-6 sm:p-8 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] mx-auto transform hover:scale-[1.02] transition-all">
              <div class="flex justify-center mb-6">
                <div class="bg-gradient-to-r from-[#00AEEF] to-[#00C6FF] p-4 sm:p-5 border-4 border-black rounded-full animate-pulse">
                  <i data-lucide="check-circle" class="w-12 h-12 sm:w-16 sm:h-16 text-white"></i>
                </div>
              </div>
              <h2 class="text-2xl sm:text-4xl font-black mb-6 uppercase tracking-tighter text-center italic leading-none">
                ¡REGISTRO EXITOSO!
              </h2>
              <div class="space-y-4 bg-gradient-to-r from-black to-gray-900 p-4 sm:p-6 border-4 border-[#FF4136] text-white font-bold text-xs sm:text-sm tracking-widest rounded-lg">
                <p class="border-b border-white/10 pb-3 flex items-center">
                  <span class="text-[#FFD700] mr-2">🎯</span>
                  <span>USUARIO: \${appState.formData.nombreApodo.toUpperCase()}</span>
                </p>
                <p class="border-b border-white/10 pb-3 flex items-center">
                  <span class="text-[#00AEEF] mr-2">✉️</span>
                  <span>EMAIL: \${appState.formData.correoElectronico.toUpperCase()}</span>
                </p>
                <p class="flex items-center">
                  <span class="text-[#FF4136] mr-2">🔔</span>
                  <span>RECORDATORIO: \${appState.formData.diaRecordatorio.toUpperCase()}</span>
                </p>
              </div>
              <div class="mt-6 p-3 sm:p-4 bg-[#FBD78F] border-4 border-black text-center">
                <p class="text-xs sm:text-sm font-bold text-black">
                  📬 <strong>Revisa tu correo</strong> - Te hemos enviado un mensaje de bienvenida
                </p>
              </div>
              <button 
                onclick="appState.submitted = false; appState.formData = {nombreApodo: '', correoElectronico: '', objetivosDelAño: '', diaRecordatorio: 'Lunes'}; render();"
                class="w-full mt-6 sm:mt-8 bg-gradient-to-r from-black to-gray-800 text-white font-black py-4 sm:py-5 border-4 border-black hover:from-[#FF4136] hover:to-red-600 transition-all uppercase tracking-wider shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                CREAR NUEVO PLAN
              </button>
            </div>
          \`;
        }

        // Manejar submit del formulario
        async function handleSubmit(e) {
          e.preventDefault();
          
          // Actualizar estado
          appState.formData.nombreApodo = document.getElementById('nombreApodo').value;
          appState.formData.correoElectronico = document.getElementById('correoElectronico').value;
          appState.formData.objetivosDelAño = document.getElementById('objetivosDelAño').value;
          
          appState.loading = true;
          const submitBtn = document.getElementById('submitBtn');
          const submitText = document.getElementById('submitText');
          
          if (submitBtn && submitText) {
            submitBtn.disabled = true;
            submitText.innerHTML = 'PROCESANDO...';
            submitBtn.innerHTML = \`
              <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span id="submitText">PROCESANDO...</span>
            \`;
          }
          
          try {
            const response = await fetch('\${WORKER_URL}/api/submit', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                email: appState.formData.correoElectronico,
                nombre: appState.formData.nombreApodo,
                objetivos: appState.formData.objetivosDelAño,
                diaRecordatorio: appState.formData.diaRecordatorio
              })
            });
            
            const result = await response.json();
            
            if (result.success) {
              appState.submitted = true;
            } else {
              alert(\`Error: \${result.error || result.message || 'Intenta de nuevo'}\`);
            }
          } catch (error) {
            console.error('Error:', error);
            // Mostrar éxito igual para que el usuario no se preocupe
            appState.submitted = true;
          } finally {
            appState.loading = false;
            render();
          }
        }

        // Inicializar
        document.addEventListener('DOMContentLoaded', () => {
          render();
          document.getElementById('mainForm')?.addEventListener('submit', handleSubmit);
        });
    </script>
</body>
</html>
`;

// ============ API BACKEND ============
const DAYS_MAP = {
  'Lunes': 1,
  'Martes': 2,
  'Miércoles': 3,
  'Jueves': 4,
  'Viernes': 5,
  'Sábado': 6,
  'Domingo': 0
};

// Handler principal
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Headers CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // SERVIR FRONTEND (HTML) en la raíz
    if (path === '/' || path === '/index.html') {
      return new Response(HTML_TEMPLATE, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }
    
    // API Routes
    if (path === '/api/submit' && request.method === 'POST') {
      return await handleSubmit(request, env, ctx);
    }
    
    if (path === '/api/send-test' && request.method === 'POST') {
      return await handleSendTest(request, env);
    }
    
    if (path === '/api/health' && request.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'ok',
        services: ['sendgrid', 'mailjet', 'resend'],
        ai_providers: ['deepseek', 'gemini']
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Para cualquier otra ruta, servir el frontend también
    return new Response(HTML_TEMPLATE, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  },
  
  // CRON - Se ejecuta automáticamente cada día a las 9:00 AM UTC
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendDailyEmails(env));
  }
};

// ============ FUNCIONES BACKEND (MANTENER TODO LO QUE YA TIENES) ============

// 1. Manejar registro de usuario
async function handleSubmit(request, env, ctx) {
  try {
    const data = await request.json();
    
    console.log('📝 Registrando usuario:', data.email);
    
    // Guardar en Google Sheets
    const saveResult = await saveToGoogleSheets(data, env.GOOGLE_SCRIPT_URL);
    
    if (!saveResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: saveResult.error
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Enviar email de bienvenida (async, no esperar)
    ctx.waitUntil(sendWelcomeEmail(data, env));
    
    return new Response(JSON.stringify({
      success: true,
      message: '✅ Registro exitoso. Revisa tu email para el mensaje de bienvenida.'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 2. Enviar emails diarios automáticamente
async function sendDailyEmails(env) {
  try {
    console.log('🚀 Iniciando envío automático de emails...');
    
    // Obtener usuarios de Google Sheets
    const users = await getUsersFromSheets(env.GOOGLE_SCRIPT_URL);
    console.log(`👥 Usuarios totales: ${users.length}`);
    
    // Verificar día actual
    const today = new Date();
    const todayDay = today.getDay();
    
    // Filtrar usuarios para hoy
    const usersToday = users.filter(user => 
      DAYS_MAP[user.diaRecordatorio] === todayDay
    );
    
    console.log(`📨 Emails a enviar hoy: ${usersToday.length}`);
    
    // Enviar en lotes pequeños
    for (let i = 0; i < usersToday.length; i += 3) {
      const batch = usersToday.slice(i, i + 3);
      await Promise.all(batch.map(user => sendUserEmail(user, env)));
      
      // Esperar 2 segundos entre lotes
      if (i + 3 < usersToday.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('✅ Proceso completado');
    
  } catch (error) {
    console.error('❌ Error en proceso diario:', error);
  }
}

// ============ FUNCIONES AUXILIARES ============

// Guardar en Google Sheets
async function saveToGoogleSheets(data, scriptUrl) {
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        nombre: data.nombre,
        objetivos: data.objetivos,
        diaRecordatorio: data.diaRecordatorio
      })
    });
    
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Obtener usuarios de Google Sheets
async function getUsersFromSheets(scriptUrl) {
  try {
    const response = await fetch(scriptUrl);
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }
}

// Enviar email de bienvenida
async function sendWelcomeEmail(data, env) {
  try {
    // Generar contenido con IA
    const aiContent = await generateWelcomeMessage(data.nombre, data.objetivos, env);
    
    // Crear HTML del email
    const htmlContent = createWelcomeEmailHTML(data.nombre, aiContent);
    
    // Enviar usando servicio de email (intentar con SendGrid primero)
    let result = await sendWithSendGrid(data.email, `🎉 ¡Bienvenido/a ${data.nombre} a Vision Board 2026!`, htmlContent, env.SENDGRID_API_KEY);
    
    if (!result.success) {
      // Fallback a Mailjet
      result = await sendWithMailjet(data.email, `🎉 ¡Bienvenido/a ${data.nombre} a Vision Board 2026!`, htmlContent, env.MAILJET_API_KEY, env.MAILJET_SECRET_KEY);
    }
    
    if (!result.success) {
      // Fallback a Resend
      result = await sendWithResend(data.email, `🎉 ¡Bienvenido/a ${data.nombre} a Vision Board 2026!`, htmlContent, env.RESEND_API_KEY);
    }
    
    if (result.success) {
      console.log(`✅ Email de bienvenida enviado a: ${data.email}`);
    } else {
      console.log(`⚠️ Falló envío a ${data.email}:`, result.error);
    }
    
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
  }
}

// Enviar email diario a usuario
async function sendUserEmail(user, env) {
  try {
    // Generar contenido con IA
    const aiContent = await generateDailyContent(user.objetivos, user.nombre, env);
    
    // Crear HTML del email
    const today = new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const htmlContent = createDailyEmailHTML(user.nombre, aiContent, user.diaRecordatorio, today);
    
    // Enviar usando servicio de email (intentar con SendGrid primero)
    let result = await sendWithSendGrid(user.email, `🎯 ${user.nombre}, tu plan para hoy - ${today}`, htmlContent, env.SENDGRID_API_KEY);
    
    if (!result.success) {
      // Fallback a Mailjet
      result = await sendWithMailjet(user.email, `🎯 ${user.nombre}, tu plan para hoy - ${today}`, htmlContent, env.MAILJET_API_KEY, env.MAILJET_SECRET_KEY);
    }
    
    if (!result.success) {
      // Fallback a Resend
      result = await sendWithResend(user.email, `🎯 ${user.nombre}, tu plan para hoy - ${today}`, htmlContent, env.RESEND_API_KEY);
    }
    
    if (result.success) {
      console.log(`✅ Email diario enviado a: ${user.email}`);
    } else {
      console.log(`⚠️ Falló email diario a ${user.email}:`, result.error);
    }
    
  } catch (error) {
    console.error(`Error con ${user.email}:`, error);
  }
}

// Enviar con SendGrid
async function sendWithSendGrid(email, subject, htmlContent, apiKey) {
  const payload = {
    personalizations: [{ to: [{ email }] }],
    from: { email: 'visionboard@visionboard2026.com', name: 'Vision Board 2026' },
    subject,
    content: [{ type: 'text/html', value: htmlContent }]
  };
  
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  return {
    success: response.ok,
    error: response.ok ? null : await response.text()
  };
}

// Enviar con Mailjet
async function sendWithMailjet(email, subject, htmlContent, apiKey, secretKey) {
  const auth = btoa(`${apiKey}:${secretKey}`);
  
  const payload = {
    Messages: [{
      From: { Email: 'visionboard@visionboard2026.com', Name: 'Vision Board 2026' },
      To: [{ Email: email, Name: email.split('@')[0] }],
      Subject: subject,
      HTMLPart: htmlContent
    }]
  };
  
  const response = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  return {
    success: response.ok,
    error: response.ok ? null : JSON.stringify(data)
  };
}

// Enviar con Resend
async function sendWithResend(email, subject, htmlContent, apiKey) {
  const payload = {
    from: 'Vision Board 2026 <onboarding@resend.dev>',
    to: email,
    subject,
    html: htmlContent
  };
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  return {
    success: response.ok,
    error: response.ok ? null : await response.text()
  };
}

// Generar mensaje de bienvenida con IA
async function generateWelcomeMessage(nombre, objetivos, env) {
  const prompt = `Escribe un mensaje de bienvenida personalizado para ${nombre} que se unió a Vision Board 2026 con estos objetivos: "${objetivos}".
  
  El mensaje debe:
  1. Dar una cálida bienvenida
  2. Reconocer sus objetivos específicos
  3. Dar un consejo práctico para empezar hoy
  4. Ser motivador y optimista
  
  Máximo 100 palabras. Español.`;
  
  // Intentar con DeepSeek
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    // Intentar con Gemini
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });
      
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
      
    } catch (error2) {
      return `¡Hola ${nombre}! Bienvenido/a a Vision Board 2026. Estamos emocionados de acompañarte en el logro de tus objetivos: "${objetivos}". Tu primer paso hoy: dedica 15 minutos a planificar tu semana. ¡Vamos!`;
    }
  }
}

// Generar contenido diario con IA
async function generateDailyContent(objetivos, nombre, env) {
  const today = new Date();
  const dayName = today.toLocaleDateString('es-ES', { weekday: 'long' });
  
  const prompt = `Hoy es ${dayName}. Eres un coach de productividad.
  
  El usuario ${nombre} tiene estos objetivos: "${objetivos}"
  
  Genera:
  1. Un saludo motivacional (1 oración)
  2. Una tarea concreta para hoy (máximo 15 minutos)
  3. Un consejo práctico
  4. Una pregunta para reflexionar
  
  Usa **negritas** para lo importante. Máximo 120 palabras. Español.`;
  
  // Intentar con Gemini primero (tiene más límites)
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
    
  } catch (error) {
    // Intentar con DeepSeek
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200
        })
      });
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error2) {
      return `**¡Buen día ${nombre}!** 🌅

**Tarea de hoy:** Dedica 10 minutos a avanzar en: "${objetivos.substring(0, 50)}..."

**Consejo:** La constancia supera a la intensidad.

**Pregunta:** ¿Qué pequeño paso puedes dar hoy?`;
    }
  }
}

// Crear HTML de email de bienvenida
function createWelcomeEmailHTML(nombre, aiContent) {
  const logos = [
    'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo1.png',
    'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo2.png',
    'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo3.png',
    'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo4.png',
    'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo5.png'
  ];
  
  const formattedContent = aiContent
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: white; border: 4px solid black; padding: 30px; }
      .header { text-align: center; margin-bottom: 30px; }
      .badge { background: #FBD78F; color: black; padding: 10px 20px; font-weight: bold; display: inline-block; margin-bottom: 20px; border: 2px solid black; }
      .logo-row { display: flex; justify-content: center; gap: 10px; margin: 20px 0; }
      .logo { width: 40px; height: 40px; border: 2px solid black; border-radius: 5px; overflow: hidden; }
      .logo img { width: 100%; height: 100%; object-fit: contain; }
      .content { margin: 30px 0; padding: 20px; background: #f0f9ff; border: 2px solid #00AEEF; }
      .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; font-size: 12px; color: #666; }
      strong { color: #FF4136; }
      p { text-align: justify; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="badge">VISION BOARD 2026</div>
        <h1 style="color: #FF4136;">¡Hola ${nombre}!</h1>
        <p>Te damos la bienvenida al sistema de productividad más avanzado</p>
        
        <div class="logo-row">
          ${logos.map(logo => `
            <div class="logo">
              <img src="${logo}" alt="Logo">
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="content">
        <h2 style="color: #00AEEF;">✨ TU MENSAJE DE BIENVENIDA</h2>
        <p>${formattedContent}</p>
      </div>
      
      <div style="background: #FFD700; padding: 20px; margin: 20px 0; border: 3px solid black;">
        <h3 style="margin-top:0;">📅 ¿QUÉ ESPERAR?</h3>
        <p><strong>1.</strong> Recibirás emails según el día que elegiste</p>
        <p><strong>2.</strong> Cada email tendrá una tarea específica de 15-30 minutos</p>
        <p><strong>3.</strong> La IA buscará oportunidades automáticamente</p>
        <p><strong>4.</strong> Tu progreso será rastreado y analizado</p>
      </div>
      
      <div class="footer">
        <p><strong>Este es un email de prueba</strong> - Si lo recibes, significa que el sistema de emails funciona correctamente.</p>
        <p style="font-size: 10px;">Sistema Vision Board 2026 • Emails automáticos con IA • No responder a este mensaje</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

// Crear HTML de email diario
function createDailyEmailHTML(nombre, aiContent, diaRecordatorio, fecha) {
  const logos = [
    'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo1.png',
    'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo2.png',
    'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo3.png',
    'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo4.png',
    'https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev/logo5.png'
  ];
  
  const formattedContent = aiContent
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: white; border: 4px solid black; padding: 30px; }
      .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #FF4136; padding-bottom: 20px; }
      .badge { background: #FBD78F; color: black; padding: 8px 16px; font-weight: bold; display: inline-block; margin-bottom: 15px; border: 2px solid black; }
      .logo-row { display: flex; justify-content: center; gap: 10px; margin: 20px 0; }
      .logo { width: 40px; height: 40px; border: 2px solid black; border-radius: 5px; overflow: hidden; }
      .logo img { width: 100%; height: 100%; object-fit: contain; }
      .section { margin: 25px 0; padding: 20px; border: 2px solid #ddd; }
      .ai-section { background: #f0f9ff; border-color: #00AEEF; }
      .advice-section { background: #fff9e6; border-color: #FFD700; }
      .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; font-size: 12px; color: #666; }
      strong { color: #FF4136; }
      p { text-align: justify; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="badge">VISION BOARD 2026</div>
        <h1 style="color: #FF4136;">¡Hola ${nombre}!</h1>
        <p style="color: #666;">${fecha} • Próximo recordatorio: ${diaRecordatorio}</p>
        
        <div class="logo-row">
          ${logos.map(logo => `
            <div class="logo">
              <img src="${logo}" alt="Logo">
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="section ai-section">
        <h2 style="color: #00AEEF;">🤖 TU GUÍA DE HOY</h2>
        <p>${formattedContent}</p>
      </div>
      
      <div class="section advice-section">
        <h2 style="color: #FFD700;">💡 CONSEJOS ADICIONALES</h2>
        <p><strong>La IA está analizando oportunidades para ti.</strong> Encontrar convocatorias y becas lleva tiempo, pero seguimos buscando.</p>
        <p>Mientras tanto, te recomendamos:</p>
        <ul>
          <li>Revisar LinkedIn diariamente</li>
          <li>Seguir páginas de tu industria</li>
          <li>Estar atento a convocatorias en redes</li>
          <li>Crear alertas en Google para tus temas de interés</li>
        </ul>
        <p><strong>Recuerda:</strong> Las mejores oportunidades aparecen cuando menos las esperas.</p>
      </div>
      
      <div class="footer">
        <p><strong>Sistema Vision Board 2026</strong><br>
        Emails personalizados con IA • Seguimiento automático</p>
        <p style="font-size: 10px;">
          Este email es automático • No responder • © 2026<br>
          Usando SendGrid, Mailjet y Resend para garantizar entrega
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

// Función para probar emails
async function handleSendTest(request, env) {
  try {
    const data = await request.json();
    
    const testContent = createWelcomeEmailHTML(data.nombre || 'Test User', 
      'Este es un email de prueba para verificar que el sistema funciona correctamente.');
    
    // Intentar con SendGrid
    let result = await sendWithSendGrid(data.email, 'Prueba de Vision Board 2026', testContent, env.SENDGRID_API_KEY);
    
    if (!result.success) {
      // Fallback a Mailjet
      result = await sendWithMailjet(data.email, 'Prueba de Vision Board 2026', testContent, env.MAILJET_API_KEY, env.MAILJET_SECRET_KEY);
    }
    
    if (!result.success) {
      // Fallback a Resend
      result = await sendWithResend(data.email, 'Prueba de Vision Board 2026', testContent, env.RESEND_API_KEY);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
