# UniBook Client Starter

Boilerplate Angular minimale per il progetto di esame. Questo starter arriva già collegato al backend deployato e include l'intera base di autenticazione: registrazione, login, persistenza della sessione, route protette e refresh automatico del token.

## Avvio del progetto

Installa le dipendenze e avvia il server di sviluppo:

```bash
npm install
npm start
```

Poi apri `http://localhost:4200/`.

## Verifica

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Cosa c'e già

- Pagina di registrazione collegata al backend.
- Pagina di login collegata al backend.
- Salvataggio di `token` e `refreshToken` in `localStorage`.
- HTTP interceptor che aggiunge sempre `apikey` e, quando serve, `Authorization: Bearer <token>`.
- Refresh automatico della sessione dopo un `401` sulle richieste protette.
- Guard per impedire l'accesso alle route protette senza sessione valida.
- Logout già predisposto con revoca del refresh token e pulizia della sessione locale.
- Interfacce TypeScript per gli oggetti principali dell'API.
- Service tipizzati gia pronti per `users`, `posts`, `feed` e `media`.

## Requisiti da implementare

Lo strato API tipizzato è già incluso. Da qui in poi il lavoro riguarda le feature applicative ancora da costruire:

Il dettaglio dei requisiti funzionali di riferimento è descritto in [requisiti.md](requisiti.md); l'elenco seguente ne riassume le funzionalita da implementare lato client:

- scelta e adozione di una libreria di componenti UI per il progetto, da selezionare tra Angular Material, PrimeNG, NG-ZORRO, Spartan NG etc.
- visualizzazione del proprio profilo
- modifica del profilo con bio e foto profilo
- visualizzazione del profilo pubblico di altri utenti con follower, utenti seguiti e post pubblicati
- ricerca utenti per nome o cognome
- follow e unfollow di altri utenti
- creazione di post con testo e immagine opzionale
- cancellazione dei propri post
- visualizzazione dei post in ordine cronologico inverso nei profili
- like e unlike ai post
- visualizzazione del numero di like e dello stato del like corrente
- feed personale con i post degli utenti seguiti e i propri post
- upload immagini per avatar e post

## Mappa rapida del codice

- Shell applicativa: in `src/app/` trovi bootstrap, configurazione globale Angular, routing e layout radice dell'app.
- Infrastruttura core: `src/app/core/` raccoglie tutto cio che e trasversale alle feature, in particolare autenticazione e sessione, configurazione API, interceptor HTTP e guard di navigazione.
- Accesso ai dati: `src/app/core/api/` contiene i service tipizzati verso il backend e i relativi modelli condivisi per utenti, post, feed e upload media.
- Pagine: `src/app/pages/` contiene le schermate agganciate alle route principali, oggi limitate a login, registrazione e home protetta da estendere con le feature del progetto.
- Form di riferimento: `src/app/pages/login/login.ts` e `src/app/pages/register/register.ts` sono esempi validi di come strutturare un form con `@angular/forms/signals`, validazioni dichiarative, gestione degli errori e submit asincrono.

## Pattern per service di stato

Quando una schermata deve caricare dati dal backend, conviene usare un service di stato dedicato alla UI della feature. Il service incapsula la chiamata API, conserva lo stato con i signals e lascia al template il solo compito di leggere e mostrare lo stato corrente.

I 4 stati da gestire sempre sono questi:

- `data`: la richiesta è andata a buon fine e ci sono dati da mostrare.
- `empty`: la richiesta è andata a buon fine ma i dati non ci sono.
- `loading`: la richiesta è in corso.
- `error`: la richiesta è fallita e va mostrato un messaggio utile, magari con un'azione di retry.

Una forma corretta del pattern e questa:

- tenere nel service almeno i signals `data`, `loading` ed `error`
- derivare `empty` con un `computed()` invece di salvarlo come quarto stato mutabile
- usare il service API tipizzato solo per l'accesso HTTP e tenere nel service stateful tutta la logica di presentazione
- far leggere al componente o al template solo i signals, senza duplicare la logica della richiesta nella pagina

Il feed della home e un esempio concreto di questo pattern:

- [unibook-client/src/app/pages/home/feed.service.ts](unibook-client/src/app/pages/home/feed.service.ts) mostra come centralizzare stato UI e chiamata al backend in un service stateful
- [unibook-client/src/app/pages/home/home.ts](unibook-client/src/app/pages/home/home.ts) usa il service come esempio di orchestrazione minima della pagina
- [unibook-client/src/app/pages/home/home.html](unibook-client/src/app/pages/home/home.html) mostra come mappare in modo esplicito i 4 stati della UI nel template


## Come effettuare l'upload del file per avatar profilo e immagine post

La prima cosa importante è questa: un `input type="file"` non va gestito con `[formField]` come i campi di [src/app/pages/login/login.html](src/app/pages/login/login.html) o [src/app/pages/register/register.html](src/app/pages/register/register.html).

Il motivo è pratico:

- `[formField]` funziona bene quando il controllo legge e scrive direttamente una proprieta normale del model, per esempio `string`, `number` o `date`
- un file selezionato non passa da un normale `value`, ma da `input.files`
- per motivi di sicurezza il browser non permette di impostare programmaticamente il contenuto di un file input come si fa con gli altri campi
- nel nostro dominio il `File` non è il dato finale da salvare: `users` e `posts` vogliono `avatarUrl` e `imageUrl`, quindi l'URL, non il file binario

Quindi il pattern corretto è questo:

1. i campi testuali restano nel `model` del form e usano `[formField]`
2. il file selezionato vive in un `signal<File | null>` separato, valorizzato manualmente con `(change)`
3. nel submit si fa prima l'upload con [src/app/core/api/media-api.service.ts](src/app/core/api/media-api.service.ts)
4. il backend restituisce una `url`
5. quella `url` viene usata per valorizzare il campo `avatarUrl`/`imageUrl` nel payload finale della request per fare l'update del profilo o per creare il post. 

In pratica il `File` non va passato dentro `updateMe()` o `create()`. I payload applicativi accettano gia la URL finale:

- profilo: `UpdateProfileRequest` usa `avatarUrl`
- post: `CreatePostRequest` usa `imageUrl`

Lo strato HTTP multipart è già incapsulato in [src/app/core/api/media-api.service.ts](src/app/core/api/media-api.service.ts), che espone due metodi:

- `uploadAvatar(file)` per la foto profilo
- `uploadPostImage(file)` per l'immagine opzionale del post

Il service costruisce internamente una `FormData`, aggiunge `kind` (`avatar` oppure `post`) e `file`, poi invia la richiesta a `/media-upload`.

### Pattern consigliato

- tieni nel model del form solo i dati applicativi veri, per esempio `text` o `bio`
- tieni il `File` selezionato in uno state locale della pagina o del service di stato della feature
- valida subito almeno la presenza del file, tipo MIME e dimensione, prima dell'upload
- esegui l'upload solo quando serve davvero, di solito nel submit del form
- salva la `url` restituita e riusala nel payload finale verso `users` o `posts`
- gestisci separatamente stato di upload (`uploading`, `fileError`) e stato del form principale

### Fare due chiamate HTTP consecutive: variante async/await nello stile di login e register

Se vuoi mantenere lo stesso stile di [src/app/pages/login/login.ts](src/app/pages/login/login.ts) e [src/app/pages/register/register.ts](src/app/pages/register/register.ts), puoi usare `firstValueFrom()`. `firstValueFrom()` è una funzione di RxJS che trasforma la prima emissione di un `Observable` in una `Promise`, cosi puoi usare `await` dentro `submission.action`.

Esempio di form per creare un post con immagine opzionale:

```ts
import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { MediaApiService } from '../../core/api/media-api.service';
import { PostsApiService } from '../../core/api/posts-api.service';
import { extractHttpErrorMessage } from '../../core/http/extract-http-error-message';

interface CreatePostFormModel {
	text: string;
}

@Component({
	selector: 'app-create-post-example',
	imports: [FormField, FormRoot],
	templateUrl: './create-post-example.html',
})
export class CreatePostExample {
	private readonly mediaApi = inject(MediaApiService);
	private readonly postsApi = inject(PostsApiService);

	protected readonly model = signal<CreatePostFormModel>({
		text: '',
	});

	protected readonly selectedImage = signal<File | null>(null);
	protected readonly fileError = signal<string | null>(null);
	protected readonly uploading = signal(false);

	protected readonly form = form(
		this.model,
		(post) => {
			required(post.text, { message: 'Inserisci il testo del post.' });
		},
		{
			submission: {
				action: async () => {
					if (this.fileError()) {
						return {
							kind: 'serverError',
							message: this.fileError() ?? 'Seleziona un file valido.',
						};
					}

					try {
						let imageUrl: string | null = null;
						const file = this.selectedImage();

						if (file) {
							this.uploading.set(true);
							const uploadedImage = await firstValueFrom(this.mediaApi.uploadPostImage(file));
							imageUrl = uploadedImage.url;
						}

						await firstValueFrom(
							this.postsApi.create({
								text: this.model().text,
								imageUrl,
							}),
						);

						return;
					} catch (error: unknown) {
						return {
							kind: 'serverError',
							message: extractHttpErrorMessage(
								error,
								'Upload immagine o creazione post non riusciti.',
							),
						};
					} finally {
						this.uploading.set(false);
					}
				},
				onInvalid: (field) => {
					field().errorSummary()[0]?.fieldTree().focusBoundControl();
				},
			},
		},
	);

	protected onImageSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0] ?? null;

		if (!file) {
			this.selectedImage.set(null);
			this.fileError.set(null);
			return;
		}

		if (!file.type.startsWith('image/')) {
			this.selectedImage.set(null);
			this.fileError.set('Seleziona un file immagine valido.');
			input.value = '';
			return;
		}

		this.selectedImage.set(file);
		this.fileError.set(null);
	}
}
```

Il template segue lo stesso pattern di `login` e `register` per i campi normali, ma il file input resta fuori da `[formField]` e usa `(change)`:

```html
<form class="post-form" [formRoot]="form">
	<label>
		<span>Testo</span>
		<textarea
			[formField]="form.text"
			[class.is-invalid]="form.text().touched() && form.text().invalid()"
			[attr.aria-invalid]="form.text().touched() && form.text().invalid() ? 'true' : null"
		></textarea>

		@if (form.text().touched() && form.text().invalid()) {
			<div class="field-errors">
				@for (error of form.text().errors(); track error) {
					<p class="inline-error" role="alert">{{ error.message ?? 'Inserisci il testo del post.' }}</p>
				}
			</div>
		}
	</label>

	<label>
		<span>Immagine opzionale</span>
		<input type="file" accept="image/*" (change)="onImageSelected($event)" />
	</label>

	@if (fileError()) {
		<div class="field-errors">
			<p class="inline-error" role="alert">{{ fileError() }}</p>
		</div>
	}

	@if (form().errors().length) {
		<div class="field-errors">
			@for (error of form().errors(); track error) {
				<p class="inline-error" role="alert">
					{{ error.message ?? 'Upload immagine o creazione post non riusciti.' }}
				</p>
			}
		</div>
	}

	<button type="submit" [disabled]="form().submitting() || uploading()">
		{{ form().submitting() ? 'Pubblicazione in corso...' : 'Pubblica' }}
	</button>
</form>
```

Per il profilo il pattern e identico: nel model lasci per esempio `bio`, mentre il file avatar resta separato e, dopo l'upload, la `url` va in `avatarUrl`.

```ts
const uploadedAvatar = await firstValueFrom(this.mediaApi.uploadAvatar(file));

await firstValueFrom(
	this.usersApi.updateMe({
		bio: this.model().bio,
		avatarUrl: uploadedAvatar.url,
	}),
);
```

### Fare due chiamate HTTP consecutive: variante RxJS con Observable e switchMap

Se si preferisce non convertire gli observable in promise, si può concatenare i due step con `switchMap`. Questa variante è utile soprattutto in un service di stato o se si vuole rimanere in RxJS puro.

```ts
import { Observable, of, switchMap } from 'rxjs';

import { Post } from '../../core/api/models/post.types';

protected submitPost$(): Observable<Post> {
	const file = this.selectedImage();
	const upload$ = file
		? this.mediaApi.uploadPostImage(file)
		: of({ url: null });

	return upload$.pipe(
		switchMap((uploadedImage) =>
			this.postsApi.create({
				text: this.model().text,
				imageUrl: uploadedImage.url,
			}),
		),
	);
}
```

Qui `switchMap` aspetta il risultato dell'upload e usa la `url` per lanciare subito la chiamata successiva `create()`.

