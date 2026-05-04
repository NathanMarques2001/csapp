const passport = require('passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
const Usuario = require('../models/Usuario');
const fs = require('fs');
require('dotenv').config();

let microsoftConfig = {};
try {
  // 1. Tenta carregar do Podman/Docker Secrets
  if (fs.existsSync('/run/secrets/secret.json')) {
    const parsed = JSON.parse(fs.readFileSync('/run/secrets/secret.json', 'utf8'));
    if (parsed && parsed.microsoft) microsoftConfig = parsed.microsoft;
  } 
  // 2. Tenta o caminho estático (produção legada)
  else if (fs.existsSync('/var/www/scrt/secret.json')) {
    const parsed = JSON.parse(fs.readFileSync('/var/www/scrt/secret.json', 'utf8'));
    if (parsed && parsed.microsoft) microsoftConfig = parsed.microsoft;
  }
} catch (e) {
  console.warn("Aviso: Falha ao ler secrets em passportConfig", e.message);
}

// 3. Fallback para variáveis de ambiente (para o docker-compose local)
if (!microsoftConfig.clientID) {
    microsoftConfig = {
        identityMetadata: process.env.MS_IDENTITY_METADATA || 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
        clientID: process.env.MS_CLIENT_ID || 'dummy-client-id',
        responseType: process.env.MS_RESPONSE_TYPE || 'id_token code',
        responseMode: process.env.MS_RESPONSE_MODE || 'form_post',
        redirectUrl: process.env.MS_REDIRECT_URL || 'http://localhost:8080/api/auth/callback',
        clientSecret: process.env.MS_CLIENT_SECRET || 'dummy-client-secret',
        scope: process.env.MS_SCOPE ? process.env.MS_SCOPE.split(' ') : ['profile', 'email', 'openid']
    };
}

passport.use(new OIDCStrategy({
    identityMetadata: microsoftConfig.identityMetadata,
    clientID: microsoftConfig.clientID,
    responseType: microsoftConfig.responseType,
    responseMode: microsoftConfig.responseMode,
    redirectUrl: microsoftConfig.redirectUrl,
    allowHttpForRedirectUrl: true,
    clientSecret: microsoftConfig.clientSecret,
    scope: microsoftConfig.scope,
    loggingLevel: 'info',
    logger: console,
    prompt: 'select_account',
    passReqToCallback: false
},
    async (iss, sub, profile, accessToken, refreshToken, done) => {
        console.log('----------------------------------------------------');
        console.log('[DEBUG] CHEGUEI NO CALLBACK DO PASSPORT!');
        console.log('[DEBUG] Perfil recebido da Microsoft:', profile);
        console.log('----------------------------------------------------');
        if (!profile.oid) {
            return done(new Error("No OID found in profile"), null);
        }

        try {
            const microsoftOid = profile.oid;
            const email = profile.upn || profile._json.email || profile._json.preferred_username;
            const nome = profile.displayName;

            let usuario = await Usuario.findOne({ where: { microsoft_oid: microsoftOid } });

            if (usuario) {
                return done(null, usuario);
            }

            usuario = await Usuario.findOne({ where: { email: email } });
            if (usuario) {
                usuario.microsoft_oid = microsoftOid;
                await usuario.save();
                return done(null, usuario);
            }

            const novoUsuario = await Usuario.create({
                nome: nome,
                email: email,
                microsoft_oid: microsoftOid,
                tipo: 'usuario',
                senha: null
            });
            return done(null, novoUsuario);

        } catch (error) {
            console.error('[DEBUG] ERRO DENTRO DO CALLBACK DO PASSPORT:', error);
            return done(error, null);
        }
    }));

// 🧠 ESSENCIAIS PARA EVITAR O ERRO "Failed to serialize user into session"
passport.serializeUser((usuario, done) => {
    done(null, usuario.id); // salva apenas o ID na sessão
});

passport.deserializeUser(async (id, done) => {
    try {
        const usuario = await Usuario.findByPk(id); // busca o usuário com base no ID
        done(null, usuario);
    } catch (err) {
        done(err, null);
    }
});
