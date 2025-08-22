# NutriSnap Mobile (Expo)

## Setup
1) `npm i`
2) Ajuste o `BASE_URL` em `src/services/api.js` para o IP da sua máquina (ex: `http://192.168.0.2:3000`).
3) `npm start` e abra com o app Expo Go no Android/iOS, ou rode em emulador.

Telas:
- Login / Registro
- Home (meta diária vinda da API + progresso)
- IMC
- Meta de Peso (calcula calorias e salva como meta diária)
- Rotina de Treino (gera plano e salva)
- Refeições (fotografa, analisa via backend/Gemini, lista e salva)
