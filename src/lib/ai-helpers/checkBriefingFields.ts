export function checkBriefingFields(
  messages: { role: string; content: string }[]
) {
  const text = messages
    .map((m) => m.content)
    .join(" ")
    .toLowerCase();

  const lastUserMessage =
    [...messages]
      .reverse()
      .find((m) => m.role === "user")
      ?.content.toLowerCase() || "";

  const opdracht = /\b(campagne|merk|video|slogan|project)\b/.test(text);
  const doelgroep =
    /\b(doelgroep|klanten|consumenten|mensen|jongeren|iedereen)\b/.test(text);
  const boodschap =
    /\b(boodschap|kern|blijven hangen|wat wil je zeggen|kernboodschap|communiceren|overbrengen)\b/.test(
      text
    );
  const tone =
    /\b(tone of voice|gevoel|sfeer|toon|stoer|grappig|serieus|cool|uitdagend)\b/.test(
      text
    );
  const vorm =
    /\b(video|social|social media|poster|event|uiting|vorm|kanaal|instagram|advertentie)\b/.test(
      text
    );
  const bijzonder =
    /\b(let op|gevoelig|context|mag niet|voorkeur|persoonlijk|randvoorwaarde|bijzonderheid)\b/.test(
      text
    );
  const extra =
    /\b(nee|nee hoor|niets meer|niks toevoegen|dat was het|dat is alles)\b/.test(
      lastUserMessage
    );

  const flags = {
    opdracht,
    doelgroep,
    boodschap,
    tone,
    vorm,
    bijzonder,
    extra,
  };

  const total = Object.keys(flags).length;
  const completed = Object.values(flags).filter(Boolean).length;

  const claireHasSaidSheIsDone = messages.some(
    (m) =>
      m.role === "assistant" &&
      m.content.toLowerCase().includes("ik denk dat we alles hebben")
  );

  const reallyComplete = completed === total || claireHasSaidSheIsDone;

  const percentage = claireHasSaidSheIsDone
    ? 100
    : Math.round((completed / total) * 100);

  const source = claireHasSaidSheIsDone ? "claire" : "checklist";

  return {
    percentage,
    complete: reallyComplete,
    source,
    ...flags,
  };
}
