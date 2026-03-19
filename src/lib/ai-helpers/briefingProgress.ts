// src/lib/ai-helpers/briefingProgress.ts

export function calculateBriefingProgress(
  messages: { role: string; content: string }[]
) {
  const content = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");

  const checks = {
    opdracht:
      /(campagne|video|poster|naam|logo|slogan|pay-off|advertentie|branding)/.test(
        content
      ),
    doelgroep:
      /(voor (kinderen|jongeren|volwassenen|vrouwen|mannen|iedereen|klanten|doelgroep))/.test(
        content
      ),
    boodschap:
      /(de boodschap is|ik wil dat mensen|het moet duidelijk zijn dat)/.test(
        content
      ),
    toneOfVoice:
      /(serieus|grappig|rebels|stoer|professioneel|losjes|informeel|zakelijk)/.test(
        content
      ),
    vorm: /(campagne|video|beeld|tekst|naam|merk|strategie)/.test(content),
    bijzonderheden:
      /(mag niet|let op|belangrijk is dat|graag zonder|speciaal voor|extra|geen gebruik van)/.test(
        content
      ),
  };

  const total = Object.keys(checks).length;
  const completed = Object.values(checks).filter(Boolean).length;

  return {
    percentage: Math.round((completed / total) * 100),
    onderdelen: checks,
  };
}
