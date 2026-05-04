import pandas as pd

nome_arquivo = "CsApp.xlsx"

# Cria os dataframes
df_default = pd.read_excel(nome_arquivo, sheet_name=0)
df_clientes = pd.read_excel(nome_arquivo, sheet_name=1)
df_usuarios = pd.read_excel(nome_arquivo, sheet_name=2)
df_segmentos = pd.read_excel(nome_arquivo, sheet_name=3)
df_fabricantes = pd.read_excel(nome_arquivo, sheet_name=4)
df_produtos = pd.read_excel(nome_arquivo, sheet_name=5)
df_faturados = pd.read_excel(nome_arquivo, sheet_name=6)
df_contratos = pd.read_excel(nome_arquivo, sheet_name=7)

df_clientes['razao_social'] = df_clientes['razao_social'].str.strip()
df_clientes['cpf_cnpj'] = df_clientes['cpf_cnpj'].str.strip()
df_produtos['nome'] = df_produtos['nome'].str.strip()

# Cria novos dataframes sem valores vazios nas linhas
new_df_default = df_default.dropna().drop_duplicates()
new_df_clientes = df_clientes.dropna().drop_duplicates(subset=['razao_social'], keep="first")
new_df_clientes = new_df_clientes.dropna().drop_duplicates(subset=['cpf_cnpj'], keep="first")
new_df_usuarios = df_usuarios.dropna().drop_duplicates()
new_df_segmentos = df_segmentos.dropna().drop_duplicates()
new_df_fabricantes = df_fabricantes.dropna().drop_duplicates()
new_df_produtos = df_produtos.dropna().drop_duplicates(subset=['nome'], keep="first")
new_df_faturados = df_faturados.dropna().drop_duplicates()
new_df_contratos = df_contratos.dropna().drop_duplicates()
#subset=['id_cliente', 'id_produto'], keep=False
# new_df_clientes.to_excel("clientes.xlsx", index=False)

# Cria novos dataframes contendo apenas as linhas com valores nulos
df_default_nulos = df_default[df_default.isnull().any(axis=1)]
df_clientes_nulos = df_clientes[df_clientes.isnull().any(axis=1)]
df_usuarios_nulos = df_usuarios[df_usuarios.isnull().any(axis=1)]
df_segmentos_nulos = df_segmentos[df_segmentos.isnull().any(axis=1)]
df_fabricantes_nulos = df_fabricantes[df_fabricantes.isnull().any(axis=1)]
df_produtos_nulos = df_produtos[df_produtos.isnull().any(axis=1)]
df_faturados_nulos = df_faturados[df_faturados.isnull().any(axis=1)]
df_contratos_nulos = df_contratos[df_contratos.isnull().any(axis=1)]
# df_clientes_nulos.to_excel("clientes_nulos.xlsx", index=False)

def validate_cpf(cpf):
    cpf = cpf.replace(".", "").replace("-", "")

    if len(cpf) != 11 or cpf == cpf[0] * len(cpf):
        return False

    cpf_array = list(map(int, cpf))

    def calcular_digito(cpf_parcial, pesos):
        soma = sum(d * p for d, p in zip(cpf_parcial, pesos))
        resto = soma % 11
        return 0 if resto < 2 else 11 - resto

    pesos1 = [10, 9, 8, 7, 6, 5, 4, 3, 2]
    pesos2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]

    primeiro_digito = calcular_digito(cpf_array[:9], pesos1)
    segundo_digito = calcular_digito(cpf_array[:9] + [primeiro_digito], pesos2)

    return primeiro_digito == cpf_array[9] and segundo_digito == cpf_array[10]

def validate_cnpj(cnpj):
    cnpj = cnpj.replace(".", "").replace("/", "").replace("-", "")

    if len(cnpj) != 14 or cnpj == cnpj[0] * len(cnpj):
        return False

    cnpj_array = list(map(int, cnpj))

    def calcular_digito(cnpj_parcial, pesos):
        soma = sum(d * p for d, p in zip(cnpj_parcial, pesos))
        resto = soma % 11
        return 0 if resto < 2 else 11 - resto

    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    primeiro_digito = calcular_digito(cnpj_array[:12], pesos1)
    segundo_digito = calcular_digito(cnpj_array[:12] + [primeiro_digito], pesos2)

    return primeiro_digito == cnpj_array[12] and segundo_digito == cnpj_array[13]

def validate_cpf_or_cnpj(cpf_cnpj):
    cpf_cnpj = cpf_cnpj.replace(".", "").replace("/", "").replace("-", "")

    if len(cpf_cnpj) == 11:
        return validate_cpf(cpf_cnpj)
    elif len(cpf_cnpj) == 14:
        return validate_cnpj(cpf_cnpj)
    else:
        return False

# Filtra os clientes com CPF/CNPJ válidos
valid_df_clientes = new_df_clientes[new_df_clientes['cpf_cnpj'].apply(validate_cpf_or_cnpj)]

# Salvando em um arquivo JSON
new_df_usuarios.to_json("usuarios.json", orient='records')
new_df_segmentos.to_json("segmentos.json", orient='records')
new_df_fabricantes.to_json("fabricantes.json", orient='records')
new_df_faturados.to_json("faturados.json", orient='records')
new_df_produtos.to_json("produtos.json", orient='records')
valid_df_clientes.to_json("clientes.json", orient='records')

new_df_contratos.to_json("contratos.json", orient='records')



