import countries from "world-countries";

// 🔥 alias pour gérer les cas réels utilisateurs
const countryAliases: Record<string, string> = {
    usa: "US",
    "united states": "US",
    us: "US",

    uk: "GB",
    "united kingdom": "GB",

    cameroun: "CM",
    cameroon: "CM",

    france: "FR",
    germany: "DE",
    india: "IN",
};

// 🔥 normalisation propre
function normalize(name: string) {
    return name.trim().toLowerCase();
}

export function getCountryData(name: string) {
  const normalized = normalize(name);

  const aliasCode = countryAliases[normalized];

  let country;

  if (aliasCode) {
    country = countries.find(
      (c) => c.cca2 === aliasCode || c.cca3 === aliasCode
    );
  } else {
    country = countries.find(
      (c) =>
        c.name.common.toLowerCase() === normalized ||
        c.name.official.toLowerCase() === normalized ||
        c.cca2.toLowerCase() === normalized ||
        c.cca3.toLowerCase() === normalized
    );
  }

  if (!country) return null;

  return {
    latLng: country.latlng as [number, number],
    code: country.cca2.toLowerCase(), // 🔥 IMPORTANT
    name: country.name.common,
  };
}

export function getCountryLatLng(name: string): [number, number] | null {
    const normalized = normalize(name);

    // 1️⃣ essayer alias → ISO code
    const aliasCode = countryAliases[normalized];

    let country;

    if (aliasCode) {
        country = countries.find(
            (c) => c.cca2 === aliasCode || c.cca3 === aliasCode
        );
    } else {
        // 2️⃣ matching strict (SANS includes ❌)
        country = countries.find(
            (c) =>
                c.name.common.toLowerCase() === normalized ||
                c.name.official.toLowerCase() === normalized ||
                c.cca2.toLowerCase() === normalized ||
                c.cca3.toLowerCase() === normalized
        );
    }

    if (!country) {
        console.warn("Pays non trouvé:", name);
        return null;
    }

    return country.latlng as [number, number];
}