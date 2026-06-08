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
    { speaker: "FIORE", text: "Ah. Molto meglio." }
  ],

  onofrio: [
    { speaker: "ROMY", text: "Il fungo mi sta ancora guardando." },
    { speaker: "FIORE", text: "Quello è Onofrio." },
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
    { speaker: "ROMY", text: "Va bene. Ecco a te lo Spruzzino di Onofrio." },
    { speaker: "SISTEMA", text: "Hai donato lo Spruzzino di Onofrio al Cappellaio.", action: "useSpruzzinoOnHatter" },
    { speaker: "CAPPELLAIO", text: "Oh! Il rosso ritorna, il blu fa rumore, il giallo mi morde!" },
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
    { speaker: "SISTEMA", text: "Più avanti sceglierai una direzione.", next: "crossroad_choose_path" }
  ],

  cap_choice_ritmo: [
    { speaker: "ROMY", text: "Una luce lontana da seguire." },
    { speaker: "CAPPELLAIO", text: "Oh! La luce che chiama da sopra i cortili." },
    { speaker: "SISTEMA", text: "Più avanti sceglierai una direzione.", next: "crossroad_choose_path" }
  ],

  cap_choice_quiete: [
    { speaker: "ROMY", text: "Qualcosa che non chieda spiegazioni." },
    { speaker: "CAPPELLAIO", text: "Ah! Una cosa che resta vicino al cuore." },
    { speaker: "SISTEMA", text: "Più avanti sceglierai una direzione.", next: "crossroad_choose_path" }
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
    { speaker: "SISTEMA", text: "Segui la fragola incisa nel legno. Il bosco profuma improvvisamente di zucchero, oro e cose che costano troppo.", action: "transitionToMadamaArea" }
  ],

  path_stella_transition: [
    { speaker: "SISTEMA", text: "Segui la stella che pulsa piano. Tra gli alberi iniziano a comparire nastri, fiori e una musica lontana che sembra già in ritardo.", action: "transitionToSposineArea" }
  ],

  path_zampa_transition: [
    { speaker: "SISTEMA", text: "Segui la zampa di gatto tra le radici. Il sentiero diventa blu, silenzioso, e da lontano arriva il suono morbido di una chitarra.", action: "transitionToPittoreArea" }
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
    { speaker: "SPOSINE", text: "È arrivata!" },
    { speaker: "ROMY", text: "A cosa sono stata invitata?" }
  ],

  pittore_intro: [
    { speaker: "PITTORE", text: "Io non vivo nel bosco. Io lascio che il bosco mi attraversi." },
    { speaker: "ROMY", text: "Quindi vivi nel bosco." }
  ]
};
