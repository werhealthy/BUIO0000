// Linee guida di tono per i dialoghi futuri:
// - Romy comunica in modo positivo, dolce, carino ed empatico: è curiosa, si entusiasma facilmente,
//   incoraggia gli altri e può essere confusa senza diventare sarcastica in modo cattivo.
// - La Margherita/FIORE è scherzosa, ironica e pungente, ma affettuosa e protettiva: prende in giro
//   senza diventare cinica o aggressiva.

export const dialogues = {
  intro_black: [
    { speaker: "ROMY", text: "...mmm." },
    { speaker: "ROMY", text: "No, aspetta." },
    { speaker: "ROMY", text: "Questo non è il mio letto.", action: "revealForestIntro" }
  ],

  main_intro: [
    { speaker: "ROMY", text: "A meno che il mio letto non abbia deciso di diventare umido, pieno di foglie...", showAction: "set_romy_pose wake_01" },
    { speaker: "ROMY", text: "e con un fungo che mi sta giudicando.", action: "set_romy_pose wake_02" },
    { speaker: "ROMY", text: "..." },
    { speaker: "ROMY", text: "Okay. Il fungo mi sta decisamente giudicando.", action: "set_romy_pose wake_03" },
    { speaker: "ROMY", text: "Dove sono? Pronto? C’è qualcuno?", action: ["set_romy_pose wake_04", "startCatEntrance"] },
    { speaker: "ROMY", text: "Oh." },
    { speaker: "ROMY", text: "Ciao, micetto." },
    { speaker: "ROMY", text: "Tu sai dove siamo?", action: "set_romy_pose idle" },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "ROMY", text: "Questo non è tecnicamente un consiglio." },
    { speaker: "VOCE", text: "Lo è, se sei un gatto." },
    { speaker: "ROMY", text: "Chi ha parlato?" },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "ROMY", text: "Non dirmi che sei ventriloquo." },
    { speaker: "VOCE", text: "Più in basso, creatura verticale." },
    { speaker: "ROMY", text: "Creatura... verticale?", action: "revealDaisy" },
    { speaker: "FIORE", text: "Finalmente." },
    { speaker: "FIORE", text: "Stavo iniziando a pensare che mi avresti calpestata con molta convinzione." },
    { speaker: "ROMY", text: "Tu sei una margherita." },
    { speaker: "FIORE", text: "E tu sei sdraiata in un bosco a parlare con una margherita. Direi che nessuna delle due è nella posizione di giudicare." },
    { speaker: "ROMY", text: "Le margherite parlano?" },
    { speaker: "FIORE", text: "Solo quando hanno qualcosa da dire. Oppure quando sono molto annoiate." },
    { speaker: "ROMY", text: "Okay. Sto sognando." },
    { speaker: "FIORE", text: "Forse." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Il gatto dice di no." },
    { speaker: "ROMY", text: "Il gatto ha detto “miao”." },
    { speaker: "FIORE", text: "Sì. È stato molto chiaro." },
    { speaker: "ROMY", text: "Va bene. Allora, margherita molto chiara, dove sono?" },
    { speaker: "FIORE", text: "Sei nel Bosco delle Mille Direzioni." },
    { speaker: "ROMY", text: "Non sembra un posto in cui volevo andare." },
    { speaker: "FIORE", text: "Oh, nessuno vuole mai venire qui." },
    { speaker: "FIORE", text: "Di solito ci si arriva per sbaglio, per magia, per distrazione..." },
    { speaker: "FIORE", text: "o perché qualcuno, da qualche parte, ha pensato che fosse un modo elegante per non dire subito la verità." },
    { speaker: "ROMY", text: "Quale verità?" },
    { speaker: "FIORE", text: "Quella dopo." },
    { speaker: "ROMY", text: "Quella dopo cosa?" },
    { speaker: "FIORE", text: "Dopo il bosco." },
    { speaker: "ROMY", text: "Io vorrei semplicemente uscire." },
    { speaker: "FIORE", text: "Semplicemente?" },
    { speaker: "FIORE", text: "Che parola buffa da usare in un bosco che non sa contare fino a uno." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Sì, hai ragione. A volte arriva a due, ma solo di martedì." },
    { speaker: "ROMY", text: "Oggi è martedì?" },
    { speaker: "FIORE", text: "Nel bosco, quasi mai." },
    { speaker: "ROMY", text: "Sto già odiando questa conversazione." },
    { speaker: "FIORE", text: "Ottimo. Vuol dire che stai ascoltando." },
    { speaker: "FIORE", text: "Ascolta bene, creatura smarrita." },
    { speaker: "FIORE", text: "Nel Bosco delle Mille Direzioni le strade bisbigliano opinioni." },
    { speaker: "FIORE", text: "Se dici “di qua”, si sposta di là." },
    { speaker: "FIORE", text: "Se corri sicura, ti perde a metà." },
    { speaker: "FIORE", text: "Le foglie fan mappe, i sassi fan finta, la nebbia si annoda se viene convinta." },
    { speaker: "FIORE", text: "Una parola può aprire un cancello, un dubbio può crescere e diventare un ruscello." },
    { speaker: "FIORE", text: "Non c’è una porta già pronta e già scritta: qui l’uscita si accende da una scelta non detta." },
    { speaker: "FIORE", text: "Tre volte il bosco ti chiederà piano: che forma ha il futuro che tieni nella mano?" },
    { speaker: "FIORE", text: "Rispondi col cuore, col dubbio o col naso." },
    { speaker: "FIORE", text: "Tanto il destino è un gatto distratto con pessimo caso." },
    { speaker: "ROMY", text: "Aspetta. Il destino è un gatto distratto?" },
    { speaker: "FIORE", text: "Terribilmente." },
    { speaker: "FIORE", text: "Una volta ha trasformato un principe in una teiera solo perché aveva detto “sono bollito”." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Sì, molto triste. Anche se comodo per il tè." },
    { speaker: "ROMY", text: "Quindi ogni cosa che scelgo cambia l’uscita?" },
    { speaker: "FIORE", text: "Più o meno." },
    { speaker: "ROMY", text: "“Più o meno” non mi rassicura." },
    { speaker: "FIORE", text: "La rassicurazione è una coperta. Io sono un fiore." },
    { speaker: "ROMY", text: "E tu cosa c’entri?" },
    { speaker: "FIORE", text: "Io conosco il bosco." },
    { speaker: "FIORE", text: "Conosco i suoi sentieri, le sue trappole, le sue scorciatoie e almeno tre dei suoi pettegolezzi più gravi." },
    { speaker: "ROMY", text: "E puoi aiutarmi a uscire?" },
    { speaker: "FIORE", text: "Posso accompagnarti." },
    { speaker: "ROMY", text: "Tu?" },
    { speaker: "FIORE", text: "Sì." },
    { speaker: "ROMY", text: "Sei piantata a terra." },
    { speaker: "FIORE", text: "Questo è un dettaglio logistico." },
    { speaker: "ROMY", text: "E quindi?" },
    { speaker: "FIORE", text: "E quindi vienimi a raccogliere." },
    { speaker: "ROMY", text: "Non è... crudele?" },
    { speaker: "FIORE", text: "Crudele è lasciare una margherita intelligente a parlare con i funghi." },
    { speaker: "FIORE", text: "Senza offesa, Onofrio." },
    { speaker: "ROMY", text: "Il fungo si chiama Onofrio?" },
    { speaker: "FIORE", text: "Purtroppo sì. Se l’è scelto da solo." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Il gatto dice che dobbiamo andare." },
    { speaker: "ROMY", text: "Il gatto ha solo detto “miao”." },
    { speaker: "FIORE", text: "Eppure continua ad avere ragione." },
    { speaker: "SISTEMA", text: "Muoviti con ← → / A D e premi E per interagire con gli oggetti.", action: "finishMainIntro" }
  ],

  daisy_picked: [
    { speaker: "SISTEMA", text: "Hai raccolto il fiore." },
    { speaker: "FIORE", text: "Ah. Molto meglio." },
    { speaker: "ROMY", text: "Ti ho appena raccolta e tu dici “molto meglio”?" },
    { speaker: "FIORE", text: "Certo. Da qui la vista è più drammatica." },
    { speaker: "ROMY", text: "Dove sei finita?" },
    { speaker: "FIORE", text: "Nel tuo taschino." },
    { speaker: "ROMY", text: "Io non ho un taschino." },
    { speaker: "FIORE", text: "Allora in un concetto equivalente." },
    { speaker: "ROMY", text: "Questa frase non mi rassicura." },
    { speaker: "FIORE", text: "Nel Bosco delle Mille Direzioni la rassicurazione è un lusso. Io sono una guida tascabile." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Dice che preferisce “compagno d’ombra”." },
    { speaker: "ROMY", text: "Quindi adesso siamo io, una margherita parlante e un gatto nero." },
    { speaker: "FIORE", text: "Un ottimo inizio per perdersi con stile." },
    { speaker: "ROMY", text: "Non posso credere che questa sia la mia mattina." },
    { speaker: "FIORE", text: "Nel Bosco delle Mille Direzioni non è mattina." },
    { speaker: "ROMY", text: "E cos’è?" },
    { speaker: "FIORE", text: "È “quasi”." },
    { speaker: "ROMY", text: "Quasi cosa?" },
    { speaker: "FIORE", text: "Esattamente." },
    { speaker: "SISTEMA", text: "Muoviti con Freccia Sinistra / Destra o A / D. Premi E vicino agli oggetti strani." },
    { speaker: "FIORE", text: "Avanti, creatura verticale. Il bosco non aspetta." },
    { speaker: "ROMY", text: "Mi sembrava proprio il tipo di bosco che aspetta." },
    { speaker: "FIORE", text: "Sì, ma in modo passivo-aggressivo." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "ROMY", text: "Va bene. Andiamo." }
  ],

  onofrio: [
    { speaker: "ROMY", text: "Il fungo mi sta ancora guardando." },
    { speaker: "FIORE", text: "Quello è Onofrio." },
    { speaker: "ROMY", text: "Il fungo ha un nome?" },
    { speaker: "FIORE", text: "Purtroppo sì. Se l’è scelto da solo." },
    { speaker: "ONOFRIO", text: "Non guardo. Valuto l’umidità dell’anima." },
    { speaker: "ROMY", text: "Questa frase mi ha fatto pentire di essermi svegliata." },
    { speaker: "ONOFRIO", text: "Ottimo segno. Sei pronta." },
    { speaker: "ROMY", text: "Per cosa?" },
    { speaker: "ONOFRIO", text: "Per lo Spruzzino." },
    { speaker: "ROMY", text: "Lo... spruzzino?" },
    { speaker: "ONOFRIO", text: "Un dispositivo di riordino cromatico interiore." },
    { speaker: "FIORE", text: "Lui li chiama così. Noi li chiamiamo “non metterlo vicino agli occhi”." },
    { speaker: "ONOFRIO", text: "Quando il mondo diventa opaco, un piccolo spruzzo e i colori ricordano di avere un lavoro." },
    { speaker: "ROMY", text: "Non so se questa cosa mi rassicura." },
    { speaker: "ONOFRIO", text: "Le migliori rassicurazioni non lo fanno. Prima di dartelo, rispondi. Quando il mondo diventa grigio, cosa dovrebbe tornare per prima?", choices: [
          { text: "Una luce calda, tipo pane e sole.", next: "onofrio_choice_calore", score: "calore" },
          { text: "Un rumore che fa muovere i piedi.", next: "onofrio_choice_ritmo", score: "ritmo" },
          { text: "Un respiro lento, senza fretta.", next: "onofrio_choice_quiete", score: "quiete" }
        ] }
  ],

  cat_intro: [
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Il gatto dice che questo dialogo non dovrebbe più comparire come tappa obbligatoria. E ha ragione." }
  ],

  onofrio_choice_calore: [
    { speaker: "ROMY", text: "Una luce calda. Tipo pane e sole." },
    { speaker: "ONOFRIO", text: "Risposta morbida. Profuma di muri che hanno visto l’estate." },
    { speaker: "SISTEMA", text: "Hai ottenuto lo Spruzzino di Onofrio.", action: "giveSpruzzino", next: "onofrio_after_choice" }
  ],

  onofrio_choice_ritmo: [
    { speaker: "ROMY", text: "Un rumore che fa muovere i piedi." },
    { speaker: "ONOFRIO", text: "Risposta frizzante. Il bosco approva con due funghi e mezzo." },
    { speaker: "SISTEMA", text: "Hai ottenuto lo Spruzzino di Onofrio.", action: "giveSpruzzino", next: "onofrio_after_choice" }
  ],

  onofrio_choice_quiete: [
    { speaker: "ROMY", text: "Un respiro lento. Senza fretta." },
    { speaker: "ONOFRIO", text: "Risposta calma. Pericolosamente vicina alla saggezza." },
    { speaker: "SISTEMA", text: "Hai ottenuto lo Spruzzino di Onofrio.", action: "giveSpruzzino", next: "onofrio_after_choice" }
  ],

  onofrio_after_choice: [
    { speaker: "ONOFRIO", text: "Tienilo vicino. Nel bosco anche i colori, ogni tanto, dimenticano la strada di casa." },
    { speaker: "ROMY", text: "Quindi è una cosa sicura?" },
    { speaker: "FIORE", text: "Nel bosco “sicuro” è un concetto decorativo." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Il gatto dice di non spruzzarlo sul gatto." },
    { speaker: "ROMY", text: "Finalmente un consiglio chiaro." }
  ],

  crossroad_cappellaio: [
    { speaker: "ROMY", text: "Tre direzioni. Una fragola, una stella e una zampa." },
    { speaker: "CAPPELLAIO", showAction: "startCappellaioEntrance", text: "Mi hanno rubato i colori!" },
    { speaker: "CAPPELLAIO", text: "Mi hanno rubato i colori!" },
    { speaker: "CAPPELLAIO", text: "Il rosso è scappato dalla mia giacca." },
    { speaker: "CAPPELLAIO", text: "Il blu mi ha lasciato un biglietto senza firma." },
    { speaker: "CAPPELLAIO", text: "E il giallo… il giallo si è nascosto dentro una cosa che rideva!" },
    { speaker: "ROMY", text: "Respira. O almeno… prova a respirare in ordine." },
    { speaker: "MARGHERITA", text: "Difficile. È vestito come un temporale che ha perso la tavolozza." },
    { speaker: "CAPPELLAIO", text: "Senza colori non posso fare una festa." },
    { speaker: "CAPPELLAIO", text: "E senza festa non posso dare indicazioni." },
    { speaker: "CAPPELLAIO", text: "E senza indicazioni finirò per indicare il dentro, il sopra e un cucchiaio!" },
    { speaker: "ROMY", text: "Forse possiamo aiutarti." },
    { speaker: "ROMY", text: "Aspetta… forse ho qualcosa che potrebbe aiutarti." },
    { speaker: "SISTEMA", text: "Hai dato lo spruzzino al Cappellaio.", action: "giveSpruzzinoToCappellaio" },
    { speaker: "CAPPELLAIO", text: "Ah!" },
    { speaker: "CAPPELLAIO", text: "Il rosso mi sta tornando sulle idee!" },
    { speaker: "CAPPELLAIO", text: "Il blu è rientrato dalle finestre!" },
    { speaker: "CAPPELLAIO", text: "E il giallo… oh, il giallo sta facendo rumore!" },
    { speaker: "MARGHERITA", text: "Colore ripristinato. Prudenza no." },
    { speaker: "CAPPELLAIO", text: "Grazie, creatura verticale con accessori floreali!" },
    { speaker: "CAPPELLAIO", text: "Ora posso indicarti una strada." },
    { speaker: "CAPPELLAIO", text: "Anzi tre." },
    { speaker: "CAPPELLAIO", text: "Ma sarebbero offese se le chiamassi strade." },
    {
      speaker: "CAPPELLAIO",
      text: "Cosa cerchi davvero, quando cerchi te?",
      choices: [
        {
          text: "Un posto che sappia di sole.",
          score: "calore",
          next: "cap_choice_calore"
        },
        {
          text: "Una luce lontana da seguire.",
          score: "ritmo",
          next: "cap_choice_ritmo"
        },
        {
          text: "Qualcosa che non chieda spiegazioni.",
          score: "quiete",
          next: "cap_choice_quiete"
        }
      ]
    }
  ],

  cap_choice_calore: [
    { speaker: "ROMY", text: "Un posto che sappia di sole." },
    { speaker: "CAPPELLAIO", text: "Ah! Il sole che cola, che scalda, che resta." },
    { speaker: "SISTEMA", text: "Osserva il cartello: scegli un simbolo e lascia che il bosco apra il prossimo sentiero.", next: "crossroad_choose_path" }
  ],

  cap_choice_ritmo: [
    { speaker: "ROMY", text: "Una luce lontana da seguire." },
    { speaker: "CAPPELLAIO", text: "Oh! La luce che chiama da sopra i cortili." },
    { speaker: "SISTEMA", text: "Osserva il cartello: scegli un simbolo e lascia che il bosco apra il prossimo sentiero.", next: "crossroad_choose_path" }
  ],

  cap_choice_quiete: [
    { speaker: "ROMY", text: "Qualcosa che non chieda spiegazioni." },
    { speaker: "CAPPELLAIO", text: "Ah! Una cosa che resta vicino al cuore." },
    { speaker: "SISTEMA", text: "Osserva il cartello: scegli un simbolo e lascia che il bosco apra il prossimo sentiero.", next: "crossroad_choose_path" }
  ],

  crossroad_choose_path: [
    {
      speaker: "SISTEMA",
      text: "Il cartello tace, ma i tre simboli brillano piano. Quale sentiero vuoi seguire?",
      choices: [
        {
          text: "Fragola",
          next: "path_fragola_transition"
        },
        {
          text: "Stella",
          next: "path_stella_transition"
        },
        {
          text: "Zampa di gatto",
          next: "path_zampa_transition"
        }
      ]
    }
  ],

  path_fragola_transition: [
    {
      speaker: "SISTEMA",
      text: "Segui la fragola incisa nel legno. Il bosco profuma improvvisamente di zucchero, oro e cose che costano troppo.",
      action: "setPathMadama",
      autoAdvance: true,
      autoAdvanceDelay: 2500
    },
    {
      speaker: "SISTEMA",
      text: "La strada si chiude alle tue spalle. Davanti, una luce calda diventa quasi dorata.",
      action: "transitionToAreaMadama",
      autoAdvance: true,
      autoAdvanceDelay: 2100
    }
  ],

  path_stella_transition: [
    {
      speaker: "SISTEMA",
      text: "Segui la stella che pulsa piano. Tra gli alberi iniziano a comparire nastri, fiori e una musica lontana che sembra già in ritardo.",
      action: "setPathSposine",
      autoAdvance: true,
      autoAdvanceDelay: 2600
    },
    {
      speaker: "SISTEMA",
      text: "Il buio scende piano, come un sipario. La stella resta accesa un istante in più.",
      action: "transitionToAreaSposine",
      autoAdvance: true,
      autoAdvanceDelay: 2100
    }
  ],

  path_zampa_transition: [
    {
      speaker: "SISTEMA",
      text: "Segui la zampa di gatto tra le radici. Il sentiero diventa blu, silenzioso, e da lontano arriva un nitrito dolce.",
      action: "setPathCavallo",
      autoAdvance: true,
      autoAdvanceDelay: 2600
    },
    {
      speaker: "SISTEMA",
      text: "Qualcosa nel bosco trattiene il respiro. Poi tutto sfuma verso un sentiero di criniere e vento.",
      action: "transitionToAreaCavallo",
      autoAdvance: true,
      autoAdvanceDelay: 2000
    }
  ],

  madama_intro: [
    { speaker: "ROMY", text: "Questo bosco ha un laboratorio?" },
    { speaker: "FIORE", text: "Il bosco ha tutto. Tranne il buon senso, ma quello era finito." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Il gatto dice di non toccare niente che luccica troppo." },
    { speaker: "ROMY", text: "Perché?" },
    { speaker: "FIORE", text: "Perché di solito vuole qualcosa in cambio." },
    { speaker: "MADAMA", text: "Oh. Una visitatrice. Che fortuna preziosa." },
    { speaker: "ROMY", text: "Buongiorno." },
    { speaker: "MADAMA", text: "Buongiorno? No, no, no. Qui i buongiorni si lucidano prima di essere detti." },
    { speaker: "ROMY", text: "Mi dispiace?" },
    { speaker: "MADAMA", text: "Lo accetto. Ma solo perché oggi sono generosa." },
    { speaker: "FIORE", text: "Brutto segno." },
    { speaker: "MADAMA", text: "Cara creatura smarrita. Se vuoi attraversare il mio laboratorio, devi aiutarmi con una piccola mansione." },
    { speaker: "ROMY", text: "Quanto piccola?" },
    { speaker: "MADAMA", text: "Minuscola. Devi solo lucidare settecento anelli, contare le perle che mentono, raddrizzare le collane malinconiche e sorridere mentre lo fai." },
    { speaker: "ROMY", text: "Questa non è una piccola mansione." },
    { speaker: "MADAMA", text: "Lo diventa se la chiami opportunità." },
    { speaker: "ROMY", text: "Ah. Quel tipo di piccola mansione." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Il gatto ha detto una parolaccia." },
    { speaker: "ROMY", text: "Ha fatto bene." },
    { speaker: "MADAMA", text: "Naturalmente verrai ricompensata." },
    { speaker: "ROMY", text: "Con cosa?" },
    { speaker: "MADAMA", text: "Con gratitudine." },
    { speaker: "ROMY", text: "Gratitudine non è una moneta." },
    { speaker: "MADAMA", text: "Allora con un gelato." },
    { speaker: "ROMY", text: "Un gelato?" },
    { speaker: "MADAMA", text: "Se vuoi puoi andartelo a prendere tu." },
    { speaker: "FIORE", text: "Io sto sviluppando un’allergia." },
    { speaker: "ROMY", text: "No." },
    { speaker: "MADAMA", text: "No?" },
    { speaker: "ROMY", text: "No." },
    { speaker: "MADAMA", text: "Temo tu non abbia capito." },
    { speaker: "ROMY", text: "Invece sì. È per questo che ho detto no." },
    { speaker: "MADAMA", text: "Che parola ruvida." },
    { speaker: "FIORE", text: "Ma molto ben tagliata." },
    { speaker: "MADAMA", text: "Nessuno esce dal mio laboratorio senza lasciare qualcosa." },
    { speaker: "ROMY", text: "Allora lascerò una cosa." },
    { speaker: "MADAMA", text: "Finalmente." },
    { speaker: "ROMY", text: "La voglia di restare." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Il gatto approva con una certa violenza emotiva." },
    {
      speaker: "MADAMA",
      text: "Se desideri davvero proseguire, scegli un piccolo frammento dal banco: il bosco ama lasciare ricordi luminosi.",
      choices: [
        {
          text: "Prendi la moneta tiepida che profuma di forno.",
          score: "calore",
          next: "madama_choice_calore"
        },
        {
          text: "Prendi l’anello che vibra quando qualcuno ride lontano.",
          score: "ritmo",
          next: "madama_choice_ritmo"
        },
        {
          text: "Prendi la chiave sottile che apre soltanto le porte stanche.",
          score: "quiete",
          next: "madama_choice_quiete"
        }
      ]
    }
  ],

  madama_choice_calore: [
    { speaker: "ROMY", text: "Prendo la moneta tiepida." },
    { speaker: "MADAMA", text: "Una scelta molto domestica. Diffiderei. Tornerai." },
    { speaker: "ROMY", text: "Forse. Ma non per restare." },
    { speaker: "FIORE", text: "Splendida frase. La ricamerò su una foglia." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Sì, gatto. Anche io ho sentito un po’ di soddisfazione." },
    { speaker: "SISTEMA", text: "Romy lascia il laboratorio: più avanti il sentiero sembra schiarirsi, come se il bosco stesse finendo.", action: "completeMadamaArea" }
  ],

  madama_choice_ritmo: [
    { speaker: "ROMY", text: "Prendo l’anello che vibra." },
    { speaker: "MADAMA", text: "Una scelta rumorosa. Costa più di quanto ammetta. Tornerai." },
    { speaker: "ROMY", text: "Forse. Ma non per restare." },
    { speaker: "FIORE", text: "Splendida frase. La ricamerò su una foglia." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Sì, gatto. Anche io ho sentito un po’ di soddisfazione." },
    { speaker: "SISTEMA", text: "Romy lascia il laboratorio: più avanti il sentiero sembra schiarirsi, come se il bosco stesse finendo.", action: "completeMadamaArea" }
  ],

  madama_choice_quiete: [
    { speaker: "ROMY", text: "Prendo la chiave sottile." },
    { speaker: "MADAMA", text: "Una scelta stanca. Le porte stanche sono le più sincere. Tornerai." },
    { speaker: "ROMY", text: "Forse. Ma non per restare." },
    { speaker: "FIORE", text: "Splendida frase. La ricamerò su una foglia." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Sì, gatto. Anche io ho sentito un po’ di soddisfazione." },
    { speaker: "SISTEMA", text: "Romy lascia il laboratorio: più avanti il sentiero sembra schiarirsi, come se il bosco stesse finendo.", action: "completeMadamaArea" }
  ],

  sposine_intro: [
    { speaker: "ROMY", text: "Adesso c’è un matrimonio?" },
    { speaker: "FIORE", text: "Nel bosco le cose importanti appaiono senza preavviso." },
    { speaker: "ROMY", text: "È bellissimo e leggermente preoccupante. Mi piace." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Il gatto dice che la torta sembra instabile." },
    { speaker: "ROMY", text: "Allora dobbiamo proteggerla. O proteggerci da lei." },
    { speaker: "SPOSINA UNO", text: "È arrivata!" },
    { speaker: "SPOSINA DUE", text: "È arrivata davvero!" },
    { speaker: "SPOSINA UNO", text: "Lo sapevo!" },
    { speaker: "SPOSINA DUE", text: "No, tu hai detto che era un lampione!" },
    { speaker: "SPOSINA UNO", text: "Un lampione importante!" },
    { speaker: "ROMY", text: "Ciao! Io sono Romy. Non so se sono invitata, ma sono molto felice di essere qui." },
    { speaker: "SPOSINA UNO", text: "Sei invitata!" },
    { speaker: "SPOSINA DUE", text: "Ovviamente!" },
    { speaker: "ROMY", text: "Che bello! A cosa?" },
    { speaker: "SPOSINE", text: "Al matrimonio!" },
    { speaker: "ROMY", text: "Di chi?" },
    { speaker: "SPOSINA UNO", text: "Domanda aggressiva." },
    { speaker: "SPOSINA DUE", text: "Molto istituzionale." },
    { speaker: "FIORE", text: "Nel bosco non si chiede ‘di chi è il matrimonio’. Si chiede ‘perché la torta mi sta fissando’." },
    { speaker: "ROMY", text: "La torta mi sta fissando con grande intensità." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Il gatto dice di fissarla per stabilire dominanza." },
    { speaker: "SPOSINA UNO", text: "Noi ci sposiamo." },
    { speaker: "SPOSINA DUE", text: "Sì." },
    { speaker: "SPOSINA UNO", text: "Tra di noi." },
    { speaker: "SPOSINA DUE", text: "Con noi." },
    { speaker: "SPOSINA UNO", text: "Con il giorno." },
    { speaker: "SPOSINA DUE", text: "Con la torta." },
    { speaker: "SPOSINA UNO", text: "Con l’idea di essere invitate ovunque." },
    { speaker: "ROMY", text: "È una definizione molto ampia di matrimonio. Però sembra piena di entusiasmo." },
    { speaker: "SPOSINE", text: "È romanticissimo!" },
    { speaker: "SPOSINA UNO", text: "Tu hai perso gli anelli!" },
    { speaker: "SPOSINA DUE", text: "Tu hai sposato una sedia durante le prove!" },
    { speaker: "SPOSINA UNO", text: "Era una sedia emotivamente disponibile!" },
    { speaker: "SPOSINA DUE", text: "Questo è vero." },
    { speaker: "SPOSINA UNO", text: "Ti amo." },
    { speaker: "SPOSINA DUE", text: "Anch’io." },
    { speaker: "ROMY", text: "Questo è stato un litigio o una promessa?" },
    { speaker: "FIORE", text: "Con loro, spesso entrambe." },
    { speaker: "SPOSINA UNO", text: "Però non puoi entrare al matrimonio senza un regalo." },
    { speaker: "ROMY", text: "Giusto. Un regalo è importante. Però io non sapevo di venire." },
    { speaker: "SPOSINA DUE", text: "Il regalo migliore è quello che non sapevi di avere." },
    { speaker: "ROMY", text: "Questa frase è quasi saggia." },
    { speaker: "SPOSINA UNO", text: "Grazie!" },
    { speaker: "SPOSINA DUE", text: "L’abbiamo rubata a una tovaglia." },
    { speaker: "SPOSINA UNO", text: "Scegli cosa lasciare sul tavolo degli sposi!" },
    {
      speaker: "SPOSINA DUE",
      text: "Scegli un dono gentile da lasciare sul tavolo degli sposi.",
      choices: [
        {
          text: "Lascia una tovaglia calda con briciole, agrumi e sole.",
          score: "calore",
          next: "sposine_choice_calore"
        },
        {
          text: "Lascia una canzone che fa ballare anche le sedie.",
          score: "ritmo",
          next: "sposine_choice_ritmo"
        },
        {
          text: "Lascia un’ora lenta, da aprire quando tutti parlano troppo.",
          score: "quiete",
          next: "sposine_choice_quiete"
        }
      ]
    }
  ],

  sposine_choice_calore: [
    { speaker: "ROMY", text: "Lascio una tovaglia calda." },
    { speaker: "SPOSINE", text: "Una tovaglia calda! Con le briciole! Questo matrimonio ha ufficialmente fame!" },
    { speaker: "ROMY", text: "È una tovaglia che sa di colazione, domenica e finestre aperte." },
    { speaker: "FIORE", text: "Praticamente hai regalato un abbraccio con gli angoli." },
    { speaker: "SPOSINA UNO", text: "Ora sei ufficialmente invitata." },
    { speaker: "SPOSINA DUE", text: "Anzi no." },
    { speaker: "SPOSINA UNO", text: "Sei ufficialmente già stata invitata da sempre." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Il gatto dice che il matrimonio è pericoloso ma ben organizzato." },
    { speaker: "SISTEMA", text: "Le Sposine ti salutano tra veli e coriandoli. Il sentiero più avanti sembra schiarirsi.", action: "completeSposineArea" }
  ],

  sposine_choice_ritmo: [
    { speaker: "ROMY", text: "Lascio una canzone." },
    { speaker: "SPOSINE", text: "La canzone! Le sedie hanno capito! Le sedie stanno ballando!" },
    { speaker: "ROMY", text: "Perfetto! Allora è una festa vera. Una festa deve sempre far muovere qualcosa." },
    { speaker: "FIORE", text: "Anche il panico, in certi casi." },
    { speaker: "SPOSINA UNO", text: "Ora sei ufficialmente invitata." },
    { speaker: "SPOSINA DUE", text: "Anzi no." },
    { speaker: "SPOSINA UNO", text: "Sei ufficialmente già stata invitata da sempre." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Il gatto dice che la torta sta seguendo il tempo in quattro quarti." },
    { speaker: "SISTEMA", text: "Le Sposine ti salutano tra veli e coriandoli. Il sentiero più avanti sembra schiarirsi.", action: "completeSposineArea" }
  ],

  sposine_choice_quiete: [
    { speaker: "ROMY", text: "Lascio un’ora lenta." },
    { speaker: "SPOSINE", text: "Oh. È un’ora lenta. Possiamo tenerla per dopo?" },
    { speaker: "ROMY", text: "Certo. Per quando tutti avranno parlato, ballato e riso tantissimo." },
    { speaker: "FIORE", text: "Un regalo per il momento in cui anche il caos si siede." },
    { speaker: "SPOSINA UNO", text: "Ora sei ufficialmente invitata." },
    { speaker: "SPOSINA DUE", text: "Anzi no." },
    { speaker: "SPOSINA UNO", text: "Sei ufficialmente già stata invitata da sempre." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Il gatto dice che apprezza le ore lente. Soprattutto se includono sonnellini." },
    { speaker: "SISTEMA", text: "Le Sposine ti salutano tra veli e coriandoli. Il sentiero più avanti sembra schiarirsi.", action: "completeSposineArea" }
  ],

  cavallo_intro: [
    { speaker: "ROMY", text: "Ciao. Tu sei il padrone di questo sentiero?" },
    { speaker: "CAVALLO", text: "Padrone no. Diciamo che lo attraverso con una certa eleganza." },
    { speaker: "FIORE", text: "Traduzione: si sente molto importante perché ha una criniera." },
    { speaker: "CAVALLO", text: "Una criniera è una responsabilità poetica." },
    { speaker: "ROMY", text: "Io sto cercando l'uscita dal bosco." },
    { speaker: "CAVALLO", text: "Allora dimmi con quale passo vuoi accompagnare il tuo coraggio.", choices: [
      { text: "Un passo caldo, come sole sulla strada.", score: "calore", next: "cavallo_choice_calore" },
      { text: "Un galoppo leggero, pieno di ritmo.", score: "ritmo", next: "cavallo_choice_ritmo" },
      { text: "Un passo quieto, senza spaventare l'erba.", score: "quiete", next: "cavallo_choice_quiete" }
    ] }
  ],

  cavallo_choice_calore: [
    { speaker: "ROMY", text: "Scelgo un passo caldo." },
    { speaker: "CAVALLO", text: "Allora il sentiero saprà ricordare il sole." },
    { speaker: "SISTEMA", text: "Il Cavallo si sposta con grazia. Più avanti il bosco sembra finire.", action: "completeCavalloArea" }
  ],

  cavallo_choice_ritmo: [
    { speaker: "ROMY", text: "Scelgo un galoppo leggero." },
    { speaker: "CAVALLO", text: "Ottima scelta. Anche le ombre hanno bisogno di tempo." },
    { speaker: "SISTEMA", text: "Il Cavallo si sposta con grazia. Più avanti il bosco sembra finire.", action: "completeCavalloArea" }
  ],

  cavallo_choice_quiete: [
    { speaker: "ROMY", text: "Scelgo un passo quieto." },
    { speaker: "CAVALLO", text: "Allora arriverai senza ferire il silenzio." },
    { speaker: "SISTEMA", text: "Il Cavallo si sposta con grazia. Più avanti il bosco sembra finire.", action: "completeCavalloArea" }
  ],

  pittore_intro: [
    { speaker: "PITTORE", text: "Io non vivo nel bosco. Io lascio che il bosco mi attraversi." },
    { speaker: "ROMY", text: "Quindi vivi nel bosco." }
  ],

  final_meadow_intro: [
    { speaker: "ROMY", text: "Guarda quante margherite…" },
    { speaker: "FIORE", text: "Finalmente un posto con un po’ di presenza scenica." },
    { speaker: "ROMY", text: "Ti piace?" },
    { speaker: "FIORE", text: "Romy… mi poseresti qui?" },
    { speaker: "ROMY", text: "Sì. Questo sembra proprio il posto giusto." },
    { speaker: "SISTEMA", text: "Premi E per posare la Margherita." }
  ],

  final_daisy_placed: [
    { speaker: "SISTEMA", text: "Romy posa la Margherita nel prato. I petali si muovono come se sorridessero." },
    { speaker: "ROMY", text: "Eccoti. Stai benissimo qui." },
    { speaker: "FIORE", text: "Lo so, ma detto da te è più carino.", action: "startFinalRabbit" }
  ],

  final_rabbit_reaction: [
    { speaker: "ROMY", text: "Oddio…" },
    { speaker: "ROMY", text: "Che bello quel coniglio…" },
    { speaker: "ROMY", text: "Mi si stanno chiudendo gli occhi…" },
    { speaker: "ROMY", text: "Forse non mi sento bene." },
    { speaker: "ROMY", text: "Non so cosa sta succedendo…" },
    { speaker: "SISTEMA", text: "Il prato si fa silenzioso. Romy scivola lentamente nel sonno.", action: "finishFinalFade", autoAdvance: true, autoAdvanceDelay: 2200 }
  ],

  final_checco: [
    { speaker: "CHECCO", text: "Tutto bene, amore?" },
    { speaker: "CHECCO", text: "Per un attimo mi è sembrato che ti fossi persa in un altro mondo." },
    { speaker: "ROMY", text: "Io…" },
    { speaker: "ROMY", text: "Credo di essere caduta giù per un BUKO." },
    { speaker: "CHECCO", text: "Un buco?" },
    { speaker: "ROMY", text: "No. Un BUKO. Con la K." },
    { speaker: "CHECCO", text: "Allora dev’essere stato serio." },
    { speaker: "ROMY", text: "C’erano funghi, cartelli, margherite, un coniglio…" },
    { speaker: "ROMY", text: "E credo di aver lasciato un pezzetto di me in un prato." },
    { speaker: "CHECCO", text: "Magari era il posto giusto." }
  ]
};
