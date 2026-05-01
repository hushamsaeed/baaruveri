import type { CouncilMember } from "@/lib/types";

// Three representative council members per island for v0. Real councils have
// 5-19 seats; the full register comes when LGA data wires. Names are common
// Maldivian names; not impersonating any actual elected officials.

export const councilMembers: CouncilMember[] = [
  // Malé
  { id: "K-male-1", island_id: "K-male", name_dv: "ޢާއިޝަތު ޝިހާމް", name_en: "Aishath Shihaam", role_en: "Chair", role_dv: "ރައީސް", party: "MDP", ward_en: "Henveiru Dhekunu", elected_at: "2026-04-04" },
  { id: "K-male-2", island_id: "K-male", name_dv: "އަޙްމަދު ނާޒިމް", name_en: "Ahmed Naazim", role_en: "Vice-Chair", role_dv: "ނައިބު ރައީސް", party: "PNC", ward_en: "Galolhu Uthuru", elected_at: "2026-04-04" },
  { id: "K-male-3", island_id: "K-male", name_dv: "ފާޠިމަތު ނަސީމާ", name_en: "Fathmath Naseema", role_en: "Member", role_dv: "މެމްބަރު", party: "MDP", ward_en: "Maafannu Medhu", elected_at: "2026-04-04" },

  // Hulhumalé (HDC-administered, three citizen liaison reps for the prototype)
  { id: "K-hulhumale-1", island_id: "K-hulhumale", name_dv: "ޢަލީ ޒާހިރު", name_en: "Ali Zaahir", role_en: "Chair", role_dv: "ރައީސް", party: "Independent", elected_at: "2026-04-04" },
  { id: "K-hulhumale-2", island_id: "K-hulhumale", name_dv: "މަރްޔަމް ވަޙީދާ", name_en: "Mariyam Waheedha", role_en: "Member", role_dv: "މެމްބަރު", party: "MDP", elected_at: "2026-04-04" },
  { id: "K-hulhumale-3", island_id: "K-hulhumale", name_dv: "ޙުސައިން ފައިޞަލް", name_en: "Hussain Faisal", role_en: "Member", role_dv: "މެމްބަރު", party: "PNC", elected_at: "2026-04-04" },

  // Addu City
  { id: "S-addu-1", island_id: "S-addu", name_dv: "އިބްރާހީމް ނާއިލް", name_en: "Ibrahim Naail", role_en: "Chair", role_dv: "ރައީސް", party: "MDP", ward_en: "Hithadhoo Medhu", elected_at: "2026-04-04" },
  { id: "S-addu-2", island_id: "S-addu", name_dv: "ޚަދީޖާ ނަދީމާ", name_en: "Khadheeja Nadheema", role_en: "Vice-Chair", role_dv: "ނައިބު ރައީސް", party: "MDP", ward_en: "Feydhoo", elected_at: "2026-04-04" },
  { id: "S-addu-3", island_id: "S-addu", name_dv: "މުޙައްމަދު ރަޝީދު", name_en: "Mohamed Rasheed", role_en: "Member", role_dv: "މެމްބަރު", party: "PNC", ward_en: "Hulhudhoo", elected_at: "2026-04-04" },

  // Kulhudhuffushi
  { id: "HDh-kulhudhuffushi-1", island_id: "HDh-kulhudhuffushi", name_dv: "ޙަސަން ޒުހައިރު", name_en: "Hassan Zuhair", role_en: "Chair", role_dv: "ރައީސް", party: "MDP", elected_at: "2026-04-04" },
  { id: "HDh-kulhudhuffushi-2", island_id: "HDh-kulhudhuffushi", name_dv: "ޢާއިޝަތު ޝަރީފާ", name_en: "Aishath Shareefa", role_en: "Vice-Chair", role_dv: "ނައިބު ރައީސް", party: "MDP", elected_at: "2026-04-04" },
  { id: "HDh-kulhudhuffushi-3", island_id: "HDh-kulhudhuffushi", name_dv: "އަޙްމަދު ސަޢީދު", name_en: "Ahmed Saeed", role_en: "Member", role_dv: "މެމްބަރު", party: "PNC", elected_at: "2026-04-04" },

  // Fuvahmulah
  { id: "Gn-fuvahmulah-1", island_id: "Gn-fuvahmulah", name_dv: "އަޙްމަދު މުޢީދު", name_en: "Ahmed Mueed", role_en: "Chair", role_dv: "ރައީސް", party: "PNC", elected_at: "2026-04-04" },
  { id: "Gn-fuvahmulah-2", island_id: "Gn-fuvahmulah", name_dv: "ފާޠިމަތު ޝަޒީނާ", name_en: "Fathmath Shazeena", role_en: "Vice-Chair", role_dv: "ނައިބު ރައީސް", party: "MDP", elected_at: "2026-04-04" },
  { id: "Gn-fuvahmulah-3", island_id: "Gn-fuvahmulah", name_dv: "ޙުސައިން ފިރާޤު", name_en: "Hussain Firaaq", role_en: "Member", role_dv: "މެމްބަރު", party: "Independent", elected_at: "2026-04-04" },

  // Maafaru
  { id: "N-maafaru-1", island_id: "N-maafaru", name_dv: "އިބްރާހީމް ޝިހާމް", name_en: "Ibrahim Shihaam", role_en: "Chair", role_dv: "ރައީސް", party: "MDP", elected_at: "2026-04-04" },
  { id: "N-maafaru-2", island_id: "N-maafaru", name_dv: "ޢާއިޝަތު ނަސްރީނާ", name_en: "Aishath Nasreena", role_en: "Vice-Chair", role_dv: "ނައިބު ރައީސް", party: "PNC", elected_at: "2026-04-04" },
  { id: "N-maafaru-3", island_id: "N-maafaru", name_dv: "ޙަސަން މަނިކު", name_en: "Hassan Manik", role_en: "Member", role_dv: "މެމްބަރު", party: "MDP", elected_at: "2026-04-04" },
];

// getCouncilMembers moved to src/db/queries/council.ts. Seed-only file.
