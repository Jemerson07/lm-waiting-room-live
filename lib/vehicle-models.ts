/**
 * Lista de modelos de veículos populares no Brasil
 * Usado para autocomplete no formulário de atendimento
 */

export const VEHICLE_MODELS = [
  // Volkswagen
  "VW Gol",
  "VW Polo",
  "VW Golf",
  "VW Jetta",
  "VW Passat",
  "VW Tiguan",
  "VW Touareg",
  "VW Amarok",
  "VW Saveiro",
  "VW Nivus",
  "VW Virtus",
  "VW T-Cross",

  // Fiat
  "Fiat Argo",
  "Fiat Mobi",
  "Fiat Uno",
  "Fiat Palio",
  "Fiat Strada",
  "Fiat Toro",
  "Fiat Cronos",
  "Fiat 500",
  "Fiat Pulse",

  // Chevrolet
  "Chevrolet Onix",
  "Chevrolet Cruze",
  "Chevrolet Equinox",
  "Chevrolet Tracker",
  "Chevrolet Prisma",
  "Chevrolet Spin",
  "Chevrolet Bolt",
  "Chevrolet Montana",

  // Hyundai
  "Hyundai HB20",
  "Hyundai Creta",
  "Hyundai Tucson",
  "Hyundai Santa Fe",
  "Hyundai Elantra",
  "Hyundai Veloster",
  "Hyundai i30",
  "Hyundai Venue",

  // Kia
  "Kia Picanto",
  "Kia Cerato",
  "Kia Sportage",
  "Kia Sorento",
  "Kia Telluride",
  "Kia Niro",
  "Kia Rio",

  // Toyota
  "Toyota Corolla",
  "Toyota Camry",
  "Toyota Hilux",
  "Toyota Yaris",
  "Toyota Etios",
  "Toyota RAV4",
  "Toyota Prius",
  "Toyota Land Cruiser",

  // Honda
  "Honda Civic",
  "Honda Accord",
  "Honda CR-V",
  "Honda Fit",
  "Honda HR-V",
  "Honda Odyssey",
  "Honda Pilot",

  // Nissan
  "Nissan Versa",
  "Nissan Sentra",
  "Nissan Altima",
  "Nissan Qashqai",
  "Nissan X-Trail",
  "Nissan Frontier",
  "Nissan Pathfinder",

  // Ford
  "Ford Fiesta",
  "Ford Focus",
  "Ford Fusion",
  "Ford EcoSport",
  "Ford Ranger",
  "Ford F-150",
  "Ford Mustang",
  "Ford Territory",

  // Renault
  "Renault Kwid",
  "Renault Sandero",
  "Renault Duster",
  "Renault Logan",
  "Renault Captur",
  "Renault Koleos",

  // Peugeot
  "Peugeot 208",
  "Peugeot 308",
  "Peugeot 408",
  "Peugeot 3008",
  "Peugeot 5008",
  "Peugeot 2008",

  // Citroën
  "Citroën C3",
  "Citroën C4",
  "Citroën C5",
  "Citroën Aircross",
  "Citroën Berlingo",

  // Jeep
  "Jeep Renegade",
  "Jeep Compass",
  "Jeep Cherokee",
  "Jeep Wrangler",
  "Jeep Grand Cherokee",

  // BMW
  "BMW 320i",
  "BMW 330i",
  "BMW X1",
  "BMW X3",
  "BMW X5",
  "BMW i3",
  "BMW i4",

  // Audi
  "Audi A3",
  "Audi A4",
  "Audi A6",
  "Audi Q3",
  "Audi Q5",
  "Audi Q7",

  // Mercedes-Benz
  "Mercedes-Benz A-Class",
  "Mercedes-Benz C-Class",
  "Mercedes-Benz E-Class",
  "Mercedes-Benz GLA",
  "Mercedes-Benz GLC",
  "Mercedes-Benz GLE",

  // Outros
  "Mitsubishi Outlander",
  "Mitsubishi ASX",
  "Mitsubishi L200",
  "Subaru Outback",
  "Subaru Forester",
  "Suzuki Swift",
  "Suzuki Vitara",
  "Chery Tiggo",
  "BYD Song",
  "BYD Qin",
  "JAC J6",
  "Geely Emgrand",
];

/**
 * Buscar modelos de veículos por termo
 * @param searchTerm - Termo de busca
 * @returns Array de modelos que correspondem ao termo
 */
export function searchVehicleModels(searchTerm: string): string[] {
  if (!searchTerm.trim()) {
    return VEHICLE_MODELS;
  }

  const term = searchTerm.toLowerCase().trim();
  return VEHICLE_MODELS.filter((model) =>
    model.toLowerCase().includes(term)
  ).sort((a, b) => {
    // Priorizar modelos que começam com o termo
    const aStartsWith = a.toLowerCase().startsWith(term);
    const bStartsWith = b.toLowerCase().startsWith(term);

    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;

    return a.localeCompare(b);
  });
}

/**
 * Obter sugestões de modelos (máximo 10)
 * @param searchTerm - Termo de busca
 * @returns Array com até 10 modelos sugeridos
 */
export function getVehicleModelSuggestions(searchTerm: string): string[] {
  return searchVehicleModels(searchTerm).slice(0, 10);
}
