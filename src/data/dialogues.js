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
      text: "Scegli una direzione.",
      choices: [
        {
          text: "Laboratorio che luccica troppo.",
          next: "madama_intro",
          path: "madama"
        },
        {
          text: "Radura del matrimonio impossibile.",
          next: "sposine_intro",
          path: "sposine"
        },
        {
          text: "Sentiero del blu e della chitarra.",
          next: "pittore_intro",
          path: "pittore"
        }
      ]
    }
  ],

  madama_intro: [
    { speaker: "MADAMA", text: "Oh. Una visitatrice. Che fortuna preziosa." },
    { speaker: "ROMY", text: "Questo posto luccica troppo." }
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
