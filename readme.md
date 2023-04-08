# Lettore Schermo 

## Description
CLI app che dallo schermo a intervalli regolari legge il contenuto e appende il contenuto ad un file

## Usage

Per utilizzare l'applicazione è necessario avere una versione di node.js ed npm installata (https://nodejs.org/en/download) .

Una volta installato node è sufficente aprire un terminale nella cartella dell'applicazione ed eseguire la prima volta il seguente comando:
```sh
npm install 
```
una volta installato per avviare l'applicazione è sufficente eseguire il comando

```sh
npm run dev
```

### configuarzione
il file di configurazione deve essere in formato json.
!!! TUTTE LE DIMENSIONI SONO RIFERITE IN PIXEL !!!
crea un file "screen.config.json" 
è possibile configuare i seguenti parametri:
- interval: intervallo di screen (in ms):
  es: 1000 equivale a uno screen ogni 1000ms 
- cropW: larghezza della porzione da ritagliare
- cropH: altezza della porzione da ritagliare
- cropOffsetLeft: offset da sinistra per il ritaglio
- cropOffsetTop: offset dal top per il ritaglio
- screenW: la larghezza dello schermo (se non inserita l'app tenta di rilevarla automaticamente altrimenti il prompt richiede di inserirla)
- screenH: l'altezza dello schermo

esempio del contenuto del file di configurazione

```json
{
  "interval": 2000,
  "cropW": 500,
  "cropH": 500,
  "cropOffsetLeft": 200,
  "cropOffsetTop": 200,
  "screenW": 1920,
  "screenH": 1080
}
```
