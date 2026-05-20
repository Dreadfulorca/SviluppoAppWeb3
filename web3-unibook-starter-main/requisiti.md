# Requisiti Funzionali — Social Network

## 1. Autenticazione e Account

- **RF-01** — L'utente può registrarsi fornendo: nome, cognome, email, password, data di nascita
- **RF-02** — L'utente può effettuare il login con email e password; il server restituisce un JWT
- **RF-03** — Il client salva il JWT in `localStorage` e lo include in ogni richiesta autenticata nell'header `Authorization: Bearer <token>` tramite un HTTP interceptor Angular
- **RF-04** — L'utente può effettuare il logout; il client rimuove il JWT da `localStorage` e reindirizza al login
- **RF-05** — Le route Angular protette sono accessibili solo se il JWT è presente; in caso contrario il client reindirizza al login tramite una route guard
- **RF-06** — Se una richiesta restituisce `401`, il client effettua il logout automaticamente e reindirizza al login
- **RF-07** *(opzionale)* — Il client può implementare il flusso di refresh token: alla scadenza del JWT, prima di fare logout automatico, tenta di ottenere un nuovo token tramite un refresh token salvato in `localStorage`

## 2. Profilo Utente

- **RF-08** — Ogni utente ha un profilo con: nome, cognome, foto profilo (URL), bio, data di nascita
- **RF-09** — L'utente può visualizzare il proprio profilo
- **RF-10** — L'utente può modificare i propri dati: foto profilo e bio (nome, cognome e data di nascita non modificabili dopo la registrazione)
- **RF-11** — L'utente può visualizzare il profilo pubblico di altri utenti: nome, foto, bio, numero di follower e numero di seguiti
- **RF-12** — Il profilo pubblico di un altro utente mostra i suoi post
- **RF-13** — L'utente può cercare altri utenti per nome o cognome; i risultati mostrano foto, nome completo e un pulsante per visitare il profilo

## 3. Following

- **RF-14** — L'utente può seguire un altro utente
- **RF-15** — L'utente può smettere di seguire un altro utente
- **RF-16** — Sul profilo pubblico di un altro utente, il sistema mostra se l'utente corrente lo sta già seguendo o meno

## 4. Post

- **RF-17** — L'utente può creare un post con un testo (max 500 caratteri) e opzionalmente un'immagine tramite URL
- **RF-18** — L'utente può eliminare un proprio post
- **RF-19** — I post sono visibili sul profilo dell'utente che li ha pubblicati, in ordine cronologico inverso
- **RF-20** — Ogni post mostra: foto e nome dell'autore, testo, immagine (se presente), data di pubblicazione e numero di like

## 5. Like

- **RF-21** — L'utente può mettere like a un post
- **RF-22** — L'utente può togliere il proprio like a un post
- **RF-23** — Ogni post mostra il numero totale di like e se l'utente corrente ha già messo like

## 6. Feed

- **RF-24** — L'utente ha un feed personale con i post di tutti gli utenti che segue in ordine cronologico inverso
- **RF-25** — Il feed mostra anche i propri post
