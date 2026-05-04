const passport = require("passport");
const OIDCStrategy = require("passport-azure-ad").OIDCStrategy;
const Usuario = require("../models/Usuario");
const microsoftConfig = require("../config/auth").microsoft;

passport.use(
  new OIDCStrategy(
    {
      identityMetadata: microsoftConfig.identityMetadata,
      clientID: microsoftConfig.clientID,
      responseType: "code",
      responseMode: "query",
      redirectUrl: microsoftConfig.redirectUrl,
      allowHttpForRedirectUrl: true,
      clientSecret: microsoftConfig.clientSecret,
      scope: microsoftConfig.scope,
      loggingLevel: "info",
      logger: console,
      prompt: "select_account",
      passReqToCallback: false,
      nonceCookieSecure: false
    },
    async (iss, sub, profile, accessToken, refreshToken, done) => {
      console.log("----------------------------------------------------");
      console.log("[DEBUG] CHEGUEI NO CALLBACK DO PASSPORT!");
      console.log("[DEBUG] Perfil recebido da Microsoft:", profile);
      console.log("----------------------------------------------------");
      if (!profile.oid) {
        return done(new Error("No OID found in profile"), null);
      }

      try {
        const microsoftOid = profile.oid;
        const email =
          profile.upn ||
          profile._json.email ||
          profile._json.preferred_username;
        const nome = profile.displayName;

        let usuario = await Usuario.findOne({
          where: { microsoft_oid: microsoftOid },
        });

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
          tipo: "usuario",
          senha: null,
        });
        return done(null, novoUsuario);
      } catch (error) {
        console.error("[DEBUG] ERRO DENTRO DO CALLBACK DO PASSPORT:", error);
        return done(error, null);
      }
    },
  ),
);

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
