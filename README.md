# BlueHarbor — site

Site público do BlueHarbor: https://lucianomathias1982.github.io/blueharbor-site/

- `index.html`, `styles.css`, `main.js` — a página, sem framework nem build. Ao mudar CSS ou JS, aumente o `?v=` nos links do `index.html` (o GitHub Pages guarda cache por 10 minutos).
- `app/` — versão web do app (modo demonstração), gerada a partir do repositório do app. Não edite à mão.
- `404.html` — gerado junto com `app/`: abre as rotas internas do app (o GitHub Pages não tem rewrite).
- `assets/` — logo, ícones, telas do app e QR code.

## Atualizar a versão web do app

Com o repositório do app clonado ao lado deste (`../blueharbor`, sem `.env.local`):

```bash
./scripts/build-app.sh
```

Se o site ganhar domínio próprio na raiz (ex.: `blueharbor.app`), rode com o novo caminho base: `./scripts/build-app.sh ../blueharbor /app`.

## Novo APK

Publique uma release neste repositório com o arquivo chamado exatamente `BlueHarbor-android.apk`. O botão do site usa `releases/latest/download/BlueHarbor-android.apk`, então sempre baixa a versão mais nova.

## Contato dos parceiros

Preencha `CONTACT` no topo de `main.js` (e-mail ou WhatsApp) para os botões "Quero ser prestador", "Cadastrar minha poita" e "Fale com a gente" abrirem o canal certo.
