#!/bin/bash

# Script para criar uma build de produção e preparar para implantação

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando processo de build para produção...${NC}"

# Verificar se o Node.js está instalado
if ! [ -x "$(command -v node)" ]; then
  echo -e "${RED}Erro: Node.js não está instalado.${NC}" >&2
  exit 1
fi

# Verificar se o npm está instalado
if ! [ -x "$(command -v npm)" ]; then
  echo -e "${RED}Erro: npm não está instalado.${NC}" >&2
  exit 1
fi

# Instalar dependências
echo -e "${YELLOW}Instalando dependências...${NC}"
npm install

# Verificar se a instalação foi bem-sucedida
if [ $? -ne 0 ]; then
  echo -e "${RED}Erro: Falha ao instalar dependências.${NC}" >&2
  exit 1
fi

# Executar testes
echo -e "${YELLOW}Executando testes...${NC}"
npm test

# Verificar se os testes foram bem-sucedidos
if [ $? -ne 0 ]; then
  echo -e "${RED}Aviso: Alguns testes falharam. Deseja continuar? (y/n)${NC}"
  read -r response
  if [[ "$response" =~ ^([nN][oO]|[nN])$ ]]; then
    echo -e "${RED}Build cancelado pelo usuário.${NC}"
    exit 1
  fi
fi

# Criar build de produção
echo -e "${YELLOW}Criando build de produção...${NC}"
npm run build

# Verificar se a build foi bem-sucedida
if [ $? -ne 0 ]; then
  echo -e "${RED}Erro: Falha ao criar build de produção.${NC}" >&2
  exit 1
fi

# Criar pasta de distribuição se não existir
if [ ! -d "dist" ]; then
  mkdir dist
fi

# Copiar arquivos necessários para a pasta de distribuição
echo -e "${YELLOW}Preparando arquivos para implantação...${NC}"
cp -r build/* dist/
cp package.json dist/
cp README.md dist/

echo -e "${GREEN}Build de produção concluída com sucesso!${NC}"
echo -e "${GREEN}Os arquivos para implantação estão na pasta 'dist'.${NC}"
echo -e "${YELLOW}Para implantar, execute: npm run deploy${NC}"

exit 0
