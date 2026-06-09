// Linee guida di tono per i dialoghi futuri:
// - Romy comunica in modo positivo, dolce, carino ed empatico: è curiosa, si entusiasma facilmente,
//   incoraggia gli altri e può essere confusa senza diventare sarcastica in modo cattivo.
// - La Margherita/FIORE è scherzosa, ironica e pungente, ma affettuosa e protettiva: prende in giro
//   senza diventare cinica o aggressiva.

export const dialogues = {
  main_intro: [
    { speaker: "ROMY", text: "Dove sono?" },
    { speaker: "FIORE", text: "Sei nel Bosco delle Mille Direzioni." }
  ],

  daisy_picked: [
    { speaker: "SISTEMA", text: "Hai raccolto il fiore." },
    { speaker: "FIORE", text: "Ah. Molto meglio. Finalmente qualcuno con gusto botanico." },
    { speaker: "ROMY", text: "Vieni con me? C'è un cartello in fondo al sentiero." }
  ],

  cat_intro: [
    { speaker: "ROMY", text: "Un gatto! Sta camminando come se conoscesse già la strada." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "ROMY", text: "Va bene, va bene. Ti seguo piano." }
  ],

  onofrio: [
    { speaker: "ROMY", text: "Laggiù c'è un fungo. Forse mi stava aspettando." },
    { speaker: "ONOFRIO", text: "Mi chiamo Onofrio, e aspetto solo chi procede senza correre." },
    { speaker: "ONOFRIO", text: "Prima di darti lo Spruzzino, rispondi." },
    {
      speaker: "ONOFRIO",
      text: "Quando il mondo diventa grigio, cosa dovrebbe tornare per prima?",
      choices: [
        {
          text: "Una luce calda, tipo pane e sole.",
          score: "calore",
          next: "onofrio_choice_calore"
        },
        {
          text: "Un rumore che fa muovere i piedi.",
          score: "ritmo",
          next: "onofrio_choice_ritmo"
        },
        {
          text: "Un respiro lento, senza fretta.",
          score: "quiete",
          next: "onofrio_choice_quiete"
        }
      ]
    }
  ],

  onofrio_choice_calore: [
    { speaker: "ROMY", text: "Una luce calda. Tipo pane e sole." },
    { speaker: "ONOFRIO", text: "Risposta morbida. Profuma di muri che hanno visto l’estate." },
    { speaker: "SISTEMA", text: "Hai ottenuto lo Spruzzino di Onofrio.", action: "giveSpruzzino" }
  ],

  onofrio_choice_ritmo: [
    { speaker: "ROMY", text: "Un rumore che fa muovere i piedi." },
    { speaker: "ONOFRIO", text: "Risposta frizzante. Il bosco approva con due funghi e mezzo." },
    { speaker: "SISTEMA", text: "Hai ottenuto lo Spruzzino di Onofrio.", action: "giveSpruzzino" }
  ],

  onofrio_choice_quiete: [
    { speaker: "ROMY", text: "Un respiro lento. Senza fretta." },
    { speaker: "ONOFRIO", text: "Risposta calma. Pericolosamente vicina alla saggezza." },
    { speaker: "SISTEMA", text: "Hai ottenuto lo Spruzzino di Onofrio.", action: "giveSpruzzino" }
  ],

  crossroad_cappellaio: [
    { speaker: "ROMY", text: "Tre direzioni. Una fragola, una stella e una zampa." },
    { speaker: "CAPPELLAIO", text: "Mi hanno rubato i colori!" },
    { speaker: "ROMY", text: "Lo Spruzzino di Onofrio fa brillare i simboli." },
    { speaker: "SISTEMA", text: "Il cartello si accende appena.", action: "useSpruzzinoOnHatter" },
    { speaker: "CAPPELLAIO", text: "Oh! Fragola, stella e zampa hanno ritrovato il colore!" },
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
    { speaker: "SISTEMA", text: "Scegli una direzione sul cartello, poi prosegui oltre per entrare nel sentiero nero.", next: "crossroad_choose_path" }
  ],

  cap_choice_ritmo: [
    { speaker: "ROMY", text: "Una luce lontana da seguire." },
    { speaker: "CAPPELLAIO", text: "Oh! La luce che chiama da sopra i cortili." },
    { speaker: "SISTEMA", text: "Scegli una direzione sul cartello, poi prosegui oltre per entrare nel sentiero nero.", next: "crossroad_choose_path" }
  ],

  cap_choice_quiete: [
    { speaker: "ROMY", text: "Qualcosa che non chieda spiegazioni." },
    { speaker: "CAPPELLAIO", text: "Ah! Una cosa che resta vicino al cuore." },
    { speaker: "SISTEMA", text: "Scegli una direzione sul cartello, poi prosegui oltre per entrare nel sentiero nero.", next: "crossroad_choose_path" }
  ],

  crossroad_choose_path: [
    {
      speaker: "SISTEMA",
      text: "Il cartello non ha parole. Solo tre simboli incisi nel legno. Quale segui?",
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
      action: "setPathMadama"
    }
  ],

  path_stella_transition: [
    {
      speaker: "SISTEMA",
      text: "Segui la stella che pulsa piano. Tra gli alberi iniziano a comparire nastri, fiori e una musica lontana che sembra già in ritardo.",
      action: "setPathSposine"
    }
  ],

  path_zampa_transition: [
    {
      speaker: "SISTEMA",
      text: "Segui la zampa di gatto tra le radici. Il sentiero diventa blu, silenzioso, e da lontano arriva il suono morbido di una chitarra.",
      action: "setPathPittore"
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
      text: "Se proprio devi andartene, scegli almeno un frammento dal banco. Il bosco ama chi porta via prove.",
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
    { speaker: "SISTEMA", text: "Fine ramo Madama — prossimo step: prato delle margherite." }
  ],

  madama_choice_ritmo: [
    { speaker: "ROMY", text: "Prendo l’anello che vibra." },
    { speaker: "MADAMA", text: "Una scelta rumorosa. Costa più di quanto ammetta. Tornerai." },
    { speaker: "ROMY", text: "Forse. Ma non per restare." },
    { speaker: "FIORE", text: "Splendida frase. La ricamerò su una foglia." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Sì, gatto. Anche io ho sentito un po’ di soddisfazione." },
    { speaker: "SISTEMA", text: "Fine ramo Madama — prossimo step: prato delle margherite." }
  ],

  madama_choice_quiete: [
    { speaker: "ROMY", text: "Prendo la chiave sottile." },
    { speaker: "MADAMA", text: "Una scelta stanca. Le porte stanche sono le più sincere. Tornerai." },
    { speaker: "ROMY", text: "Forse. Ma non per restare." },
    { speaker: "FIORE", text: "Splendida frase. La ricamerò su una foglia." },
    { speaker: "GATTO", text: "Miao." },
    { speaker: "FIORE", text: "Sì, gatto. Anche io ho sentito un po’ di soddisfazione." },
    { speaker: "SISTEMA", text: "Fine ramo Madama — prossimo step: prato delle margherite." }
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
      text: "Che poi forse siamo noi!",
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
    { speaker: "SISTEMA", text: "Fine ramo Sposine — prossimo step: prato delle margherite." }
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
    { speaker: "SISTEMA", text: "Fine ramo Sposine — prossimo step: prato delle margherite." }
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
    { speaker: "SISTEMA", text: "Fine ramo Sposine — prossimo step: prato delle margherite." }
  ],

  pittore_intro: [
    { speaker: "PITTORE", text: "Io non vivo nel bosco. Io lascio che il bosco mi attraversi." },
    { speaker: "ROMY", text: "Quindi vivi nel bosco." }
  ]
};
