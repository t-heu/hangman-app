# Hangman (app)

![alt text](docs/icon.png "Icone do app")

## Recurso gráficos
![alt text](docs/PAINEL.png "Recurso gráfico")

## Capturas de telas do telefone
![alt text](docs/Screenshot_2025-06-28-19-49-35-902_host.exp.exponent.jpg "Scree 1")
![alt text](docs/Screenshot_2025-06-28-21-17-23-618_host.exp.exponent.jpg "Scree 2")
![alt text](docs/Screenshot_2025-06-28-21-17-38-458_host.exp.exponent.jpg "Screen 3")
![alt text](docs/Screenshot_2025-06-28-22-03-26-234_host.exp.exponent.jpg "Screen 4")

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   # Exportado
   npx eas build --profile development --platform android
   npx expo start --dev-client --tunnel

   # ou
   npx expo start --tunnel
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

Reletra é um jogo de adivinhação de palavras em português inspirado no clássico Wordle, mas com novas possibilidades e mais liberdade para você jogar como quiser.
