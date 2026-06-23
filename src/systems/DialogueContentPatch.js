import { dialogues } from '../data/dialogues.js';
import { DialogueManager } from './DialogueManager.js';

const placePhrase = (cityName = 'Grecia') => (
  cityName === 'Bristol' ? 'a Bristol' : `in ${cityName}`
);

const patchInterpolation = () => {
  if (DialogueManager.prototype.__placePhrasePatched) {
    return;
  }
  DialogueManager.prototype.__placePhrasePatched = true;
  const originalInterpolateText = DialogueManager.prototype.interpolateText;
  DialogueManager.prototype.interpolateText = function patchedInterpolateText(text) {
    const cityName = this.context?.cityName ?? 'Grecia';
    return originalInterpolateText
      .call(this, text)
      .replaceAll('[LUOGO]', placePhrase(cityName));
  };
};

const patchCappellaio = () => {
  dialogues.crossroad_cappellaio = [
    { speaker: 'ROMY', text: 'Tre direzioni. Una fragola, una stella e una zampa.' },
    { speaker: 'CAPPELLAIO', showAction: 'startCappellaioEntrance', text: 'Mi hanno rubato i colori!' },
    { speaker: 'CAPPELLAIO', text: 'Mi hanno rubato i colori due volte, forse tre, forse ieri!' },
    { speaker: 'CAPPELLAIO', text: 'Il rosso è scappato dalla mia giacca.' },
    { speaker: 'CAPPELLAIO', text: 'Il blu mi ha lasciato un biglietto senza firma.' },
    { speaker: 'CAPPELLAIO', text: 'E il giallo… il giallo si è nascosto dentro una cosa che rideva!' },
    { speaker: 'ROMY', text: 'Respira. O almeno… prova a respirare in ordine.' },
    { speaker: 'MARGHERITA', text: 'Difficile. È vestito come un temporale che ha perso la tavolozza.' },
    { speaker: 'CAPPELLAIO', text: 'Senza colori non posso fare una festa.' },
    { speaker: 'CAPPELLAIO', text: 'E senza festa non posso dare indicazioni.' },
    { speaker: 'CAPPELLAIO', text: 'E senza indicazioni finirò per indicare il dentro, il sopra e un cucchiaio!' },
    { speaker: 'ROMY', text: 'Forse possiamo aiutarti.' },
    { speaker: 'ROMY', text: 'Aspetta… forse ho qualcosa che potrebbe aiutarti.' },
    { speaker: 'SISTEMA', text: 'Hai dato lo spruzzino al Cappellaio.', action: 'giveSpruzzinoToCappellaio' },
    { speaker: 'CAPPELLAIO', text: 'Ah!' },
    { speaker: 'CAPPELLAIO', text: 'Il rosso mi sta tornando sulle idee!' },
    { speaker: 'CAPPELLAIO', text: 'Il blu è rientrato dalle finestre!' },
    { speaker: 'CAPPELLAIO', text: 'E il giallo… oh, il giallo sta facendo rumore!' },
    { speaker: 'MARGHERITA', text: 'Colore ripristinato. Prudenza no.' },
    { speaker: 'CAPPELLAIO', text: 'Grazie, creatura verticale con accessori floreali!' },
    { speaker: 'CAPPELLAIO', text: 'Ora ascolta senza scegliere, che scegliere prima di capire porta le scarpe al contrario.' },
    { speaker: 'CAPPELLAIO', text: 'La fragola non è una fragola: è una bocca rossa del bosco, dolce davanti e appiccicosa dietro.' },
    { speaker: 'CAPPELLAIO', text: 'La stella non è una stella: è un buco luminoso che ha imparato a sembrare una promessa.' },
    { speaker: 'CAPPELLAIO', text: 'La zampa non è una zampa: è il passo di chi sa già dove andare e non lo dice per eleganza.' },
    { speaker: 'ROMY', text: 'Quindi quale strada dovrei prendere?' },
    { speaker: 'CAPPELLAIO', text: 'Ah! Se te lo dicessi, il cartello si offenderebbe, la fragola diventerebbe una sedia, la stella tossirebbe e la zampa firmerebbe un contratto.' },
    { speaker: 'CAPPELLAIO', text: 'Io ho detto tutto e niente. Che è il modo più onesto di parlare quando un bosco ascolta.' },
    { speaker: 'MARGHERITA', text: 'Traduzione: adesso tocca a noi.' },
    { speaker: 'CAPPELLAIO', text: 'Traduzione corretta, fiore pungente! Tre simboli, tre guai ben vestiti. Guardali finché uno non ti guarda indietro.' },
    { speaker: 'CAPPELLAIO', text: 'E ricordati: se la strada sembra sicura, probabilmente sta recitando.' },
    { speaker: 'SISTEMA', text: 'Il Cappellaio fa un inchino impossibile. Il cartello resta muto, ma i simboli brillano.', next: 'crossroad_choose_path' }
  ];
};

const patchFinalChecco = () => {
  dialogues.final_cecco = [
    { speaker: 'CHECCO', text: 'Ehi. Tutto bene, amore?' },
    { speaker: 'ROMY', text: 'Checco?' },
    { speaker: 'ROMY', text: 'Aspetta… dove siamo?' },
    { speaker: 'CHECCO', text: 'Siamo [LUOGO].' },
    { speaker: 'ROMY', text: 'No. Cioè… sì. Ma perché siamo [LUOGO]?' },
    { speaker: 'CHECCO', text: 'Perché questo è il viaggio del tuo compleanno.' },
    { speaker: 'ROMY', text: 'Il viaggio del mio compleanno?' },
    { speaker: 'CHECCO', text: 'Sì. Solo che dirtelo normalmente mi sembrava troppo facile.' },
    { speaker: 'ROMY', text: 'Io ho appena attraversato un bosco parlante.' },
    { speaker: 'ROMY', text: 'C’era una margherita che mi dava ordini, un gatto che sapeva tutto, un fungo che giudicava la mia umidità interiore…' },
    { speaker: 'CHECCO', text: 'Mi sembra un percorso abbastanza credibile per arrivare a una sorpresa.' },
    { speaker: 'ROMY', text: 'E un Cappellaio senza colori.' },
    { speaker: 'CHECCO', text: 'Questo lo capisco. Anche a me certe mattine rubano il blu.' },
    { speaker: 'ROMY', text: 'E poi ho visto un coniglio bianco.' },
    { speaker: 'CHECCO', text: 'Allora il bosco ha fatto le cose per bene.' },
    { speaker: 'ROMY', text: 'Era tutto un sogno?' },
    { speaker: 'CHECCO', text: 'Forse era un sogno. O forse era un modo molto complicato per svegliarti nel posto giusto.' },
    { speaker: 'ROMY', text: 'Quindi adesso siamo davvero [LUOGO].' },
    { speaker: 'CHECCO', text: 'Davvero davvero.' },
    { speaker: 'ROMY', text: 'Che bello…' },
    { speaker: 'CHECCO', text: 'E il bello è che non dobbiamo scegliere subito nessuna strada.' },
    { speaker: 'ROMY', text: 'Dopo quel cartello, questa frase mi commuove.' },
    { speaker: 'CHECCO', text: 'Oggi seguiamo solo quello che ci va. Il resto può aspettare fuori dalla mappa.' },
    { speaker: 'ROMY', text: 'Mi sembra ancora di cadere giù per un buco.' },
    { speaker: 'CHECCO', text: 'Allora tienimi la mano. Così se cadiamo, almeno cadiamo in vacanza.', action: 'showFinalWallpaper' }
  ];
};

const installDialogueContentPatch = () => {
  patchInterpolation();
  patchCappellaio();
  patchFinalChecco();
};

installDialogueContentPatch();
