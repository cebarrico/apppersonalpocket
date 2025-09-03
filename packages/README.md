# Pacotes Compartilhados

Este diretório contém pacotes compartilhados entre `apps/web` e `apps/mobile`.

## Estrutura sugerida

```
packages/
├── ui/                    # Componentes UI compartilhados
├── types/                 # Tipos TypeScript
├── utils/                 # Funções utilitárias
├── api/                   # Cliente API
└── config/                # Configurações compartilhadas
```

## Criando um novo pacote

Para criar um novo pacote:

1. Crie uma pasta em `packages/`
2. Adicione um `package.json` com `"name": "@pocket-trainer-hub/nome-do-pacote"`
3. Configure o TypeScript com `tsconfig.json`
4. Exporte funcionalidades no `index.ts`

## Exemplo de package.json

```json
{
  "name": "@pocket-trainer-hub/utils",
  "version": "0.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```
