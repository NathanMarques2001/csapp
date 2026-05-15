# 🖥️ Dossiê Completo de Infraestrutura — Servidor CSApp
**Data da Auditoria:** 04 de Maio de 2026
**Ambiente:** Oracle Linux / Nuvem (IP: 20.186.19.140)

Este relatório é um raio-x completo do servidor e registra toda a engenharia do ambiente de Produção e o novo ambiente de Stage containerizado.

---

## 1. Hardware e Sistema Operacional
- **OS:** Oracle Linux Server 8.10 (Compatível RHEL/Fedora).
- **Kernel:** 5.15.0-206.153.7.1.el8uek.x86_64 (Unbreakable Enterprise Kernel).
- **Memória RAM:** 7.5 GiB Total (Servidor roda com muita folga, média de 6.0 GiB livres).
- **Armazenamento:** Partição principal (`/`) com 19GB de tamanho. Ocupação atual na casa dos 74% (Atenção no longo prazo com logs de contêineres).
- **Carga (Load Average):** Extremamente baixa (~0.03). O servidor não sofre estresse de processamento atualmente.

---

## 2. Ambiente de PRODUÇÃO (Legado / Atual)
A produção roda de forma "bare-metal" (direto no host), espalhada no disco.
- **Localização dos Códigos:** `/var/www/csapp` (`csapp-back`, `csapp-email`, `csapp-front`).
- **Gerenciador de Processos:** **PM2** rodando como usuário `root` (PID 2958).
- **Portas de Serviço:**
  - API (Backend): Porta **8080**
  - Email Service: Porta **9090**
- **Tráfego e Proxy:** **Nginx** (PID 1938).
  - Escuta o domínio `csapp.prolinx.com.br`.
  - Redireciona HTTP para HTTPS automaticamente.
  - Entrega o Frontend de forma estática lendo direto de `/var/www/csapp/csapp-front/build`.
  - Repassa `/api/` e `/email/` para o PM2.
- **Deploy Automatizado:** Há um microsserviço oculto rodando na porta **3050** local. O Nginx direciona a rota `/deploy/` para ele, que recebe webhooks do GitHub e atualiza a produção.
- **Segredos e Credenciais:** Armazenados em arquivos JSON físicos pelo root na pasta oculta `/var/www/scrt` (`db.json`, `mail.json`, `secret.json`).

---

## 3. Banco de Dados (MySQL)
- **Versão:** MySQL 8.0.36.
- **Armazenamento:** Diretório padrão do Linux (`/var/lib/mysql`).
- **Comunicação:** Rodando nativamente no host (Portas **3306** e **33060**).
- **Segurança:** O MySQL está escutando em todas as interfaces (`*:3306`). Não representa risco se o firewall externo da nuvem bloquear a 3306, mas é um ponto de atenção.

---

## 4. Ambiente de STAGE (Novo / Containerizado)
Desenhado do zero com base em arquitetura de microsserviços seguros.
- **Localização:** `/var/www/stage-csapp` (totalmente isolado da produção).
- **Orquestrador:** **Podman** em modo *Rootless* (roda atrelado à conta do usuário `prolinx`, não tem privilégios de root no servidor físico, garantindo máxima segurança contra invasões).
- **Contêineres:**
  - `csapp_api_stage`: API Node.js (Mapeada apenas para o IP local `127.0.0.1:8081`).
  - `csapp_email_stage`: Email Service (Mapeado apenas para o IP local `127.0.0.1:9091`).
- **Rede Contêiner-Host:** Os contêineres conectam-se ao MySQL nativo do servidor usando a ponte de DNS interna do Podman (`host.containers.internal`).
- **Segredos:** Utiliza arquivo seguro `.env` nativo do ecossistema Node/Docker, eliminando a dependência do legados `scrt/*.json`.
- **Nginx Stage:** 
  - Subverte o bloco "Default" da porta 80.
  - Se alguém acessar pelo IP direto (`20.186.19.140`), cai no Frontend do Stage.
  - Acessos ao domínio real continuam caindo na Produção.

---

## 5. Segurança, Monitoramento e Nuvem
- **Certificados SSL:** Gerenciados de ponta a ponta pelo **Certbot** (Let's Encrypt), validando pelo caminho `.well-known` do próprio Nginx.
- **Monitoramento:** Zabbix Agent está ativo e rastreando a saúde da máquina através da porta **10050**.
- **Firewall Cloud:** O bloqueio da tentativa de usar a porta 8000 comprovou a existência de uma *Security List / Network Security Group* rígido configurado no painel da Cloud (provavelmente Oracle Cloud) da empresa, que atua fechando portas externas antes mesmo de chegarem no Linux.

## 📌 Próximos Passos (Evolução Contínua)
1. **Configurar o DNS Oficial:** Criar o subdomínio `stage.csapp.prolinx.com.br` no gerenciador do domínio para habilitar SSL (Certbot) também no Stage.
2. **Containerizar o Frontend no Stage:** No futuro, empacotar o React do Stage em um contêiner Nginx Alpine leve para replicar a arquitetura completa do monorepo, desobrigando compilações no host.
3. **Migração Final:** Assim que o Stage for exaustivamente validado pela equipe, a mesma receita do Podman pode "engolir" o PM2, desligando a produção legada e virando 100% contêineres.
