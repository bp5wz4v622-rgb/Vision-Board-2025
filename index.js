// Cloudflare Worker para Vision Board 2026
// Con 3 servicios de email (400 emails/día) y 2 APIs de IA

// Variables de configuración
const CONFIG = {
  googleScriptUrl: "https://script.google.com/macros/s/AKfycbwOojihRugk1rsO7CMNQCu-CUOLDF5RWbJvNOPwAc_BHOt2M3GvonuQDN8F9lFQmc_j/exec",
  logosR2Url: "https://pub-427abfa5785a4d66ba550c33b5c48cd2.r2.dev"
};

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
    
    // Rutas
    if (path === '/api/submit' && request.method === 'POST') {
      return await handleSubmit(request, env);
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
    
    return new Response('Vision Board 2026 API', { status: 200 });
  },
  
  // CRON - Se ejecuta automáticamente cada día
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendDailyEmails(env));
  }
};

// ============ FUNCIONES PRINCIPALES ============

// 1. Manejar registro de usuario
async function handleSubmit(request, env) {
  try {
    const data = await request.json();
    
    console.log('📝 Registrando usuario:', data.email);
    
    // Guardar en Google Sheets
    const saveResult = await saveToGoogleSheets(data, env.GOOGLE_SCRIPT_URL || CONFIG.googleScriptUrl);
    
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
    sendWelcomeEmail(data, env);
    
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
    const users = await getUsersFromSheets(env.GOOGLE_SCRIPT_URL || CONFIG.googleScriptUrl);
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
    
    // Enviar usando servicio de email
    const result = await sendEmailWithService('welcome', data.email, data.nombre, htmlContent, env);
    
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
    const htmlContent = createDailyEmailHTML(user.nombre, aiContent, user.diaRecordatorio);
    
    // Enviar usando servicio de email
    const result = await sendEmailWithService('daily', user.email, user.nombre, htmlContent, env);
    
    if (result.success) {
      console.log(`✅ Email diario enviado a: ${user.email}`);
    } else {
      console.log(`⚠️ Falló email diario a ${user.email}:`, result.error);
    }
    
  } catch (error) {
    console.error(`Error con ${user.email}:`, error);
  }
}

// Seleccionar y usar servicio de email
async function sendEmailWithService(type, email, nombre, htmlContent, env) {
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const subject = type === 'welcome' 
    ? `🎉 ¡Bienvenido/a ${nombre} a Vision Board 2026!`
    : `🎯 ${nombre}, tu plan para hoy - ${today}`;
  
  // Intentar con SendGrid primero
  try {
    const sendgridResult = await sendWithSendGrid(email, subject, htmlContent, env.SENDGRID_API_KEY);
    if (sendgridResult.success) return sendgridResult;
  } catch (error) {
    console.log('SendGrid falló, intentando Mailjet...');
  }
  
  // Intentar con Mailjet
  try {
    const mailjetResult = await sendWithMailjet(email, subject, htmlContent, env.MAILJET_API_KEY, env.MAILJET_SECRET_KEY);
    if (mailjetResult.success) return mailjetResult;
  } catch (error) {
    console.log('Mailjet falló, intentando Resend...');
  }
  
  // Intentar con Resend
  try {
    return await sendWithResend(email, subject, htmlContent, env.RESEND_API_KEY);
  } catch (error) {
    console.log('Todos los servicios fallaron');
    return { success: false, error: 'Todos los servicios fallaron' };
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
      .logo { width: 40px; height: 40px; border: 2px solid black; border-radius: 5px; }
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
          <div class="logo" style="background: #FFD700;"></div>
          <div class="logo" style="background: #00AEEF;"></div>
          <div class="logo" style="background: white; border-color: #000;"></div>
          <div class="logo" style="background: #FF4136;"></div>
          <div class="logo" style="background: black;"></div>
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
function createDailyEmailHTML(nombre, aiContent, diaRecordatorio) {
  const fecha = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
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
      .logo { width: 40px; height: 40px; border: 2px solid black; border-radius: 5px; }
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
          <div class="logo" style="background: #FFD700;"></div>
          <div class="logo" style="background: #00AEEF;"></div>
          <div class="logo" style="background: white; border-color: #000;"></div>
          <div class="logo" style="background: #FF4136;"></div>
          <div class="logo" style="background: black;"></div>
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
    
    const result = await sendEmailWithService('welcome', data.email, data.nombre || 'Usuario', testContent, env);
    
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
