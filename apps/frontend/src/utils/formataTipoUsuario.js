export default function formataTipoUsuario(tipo) {
  if (tipo == "dev") {
    return "Desenvolvedor";
  } else if (tipo == "admin") {
    return "Administrador";
  }
  return "Usuário";
}
