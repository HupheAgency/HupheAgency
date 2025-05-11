"use client";

import Navbar from "../components/navbar";

export default function PricingPage() {
  const features = [
    "Aantal briefings per maand",
    "Output als platte tekst in PDF",
    "Output in Keynote / PowerPoint",
    "Creatief team actief (Copy + Art)",
    "Strategie + Gedragsanalyse",
    "Feedbackloops & reviews",
    "Presentatieklaar deck",
    "Designer & Studio betrokken",
    "Teambeheer & samenwerking",
    "API & white-label opties",
  ];

  const plans = [
    {
      name: "Free",
      description: "Voor nieuwsgierige geesten die willen proeven.",
      price: "€0",
      frequency: "/maand",
      button: "Start Gratis",
      features: [
        "3",
        true,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    {
      name: "Pro",
      description: "Voor kleine teams en zelfstandige creatives.",
      price: "€39",
      frequency: "/maand",
      button: "Upgrade naar Pro",
      features: [
        "Onbeperkt",
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
      ],
    },
    {
      name: "Business",
      description: "Voor merken met grotere ambities.",
      price: "€99",
      frequency: "/maand",
      button: "Word Business Partner",
      features: [
        "Onbeperkt",
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Ontdek Huphe Agency</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Het AI-first reclamebureau voor visionaire merken. Geef je briefing,
            ontvang creatieve concepten en laat ons de strategie verzorgen — met
            een team van AI-specialisten.
          </p>
        </header>

        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border ${
                plan.name === "Pro"
                  ? "border-black bg-gray-50 shadow-lg"
                  : "border-gray-200 shadow"
              } rounded-2xl p-6 flex flex-col`}
            >
              <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
              <p className="text-gray-500 mb-4">{plan.description}</p>
              <p className="text-3xl font-bold mb-6">
                {plan.price}{" "}
                <span className="text-base font-medium">{plan.frequency}</span>
              </p>
              <ul className="flex-1 space-y-2 mb-6 text-sm text-gray-700">
                {features.map((feature, index) => (
                  <li key={feature} className="flex items-start">
                    <span className="w-5 mr-2">
                      {plan.features[index] === true
                        ? "✅"
                        : plan.features[index] === false
                        ? "❌"
                        : null}
                    </span>
                    <span>
                      {feature}:{" "}
                      {typeof plan.features[index] === "string"
                        ? plan.features[index]
                        : null}
                    </span>
                  </li>
                ))}
              </ul>
              <button className="mt-auto bg-black text-white py-2 px-4 rounded-xl">
                {plan.button}
              </button>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
