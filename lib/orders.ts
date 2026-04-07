import type { AttendanceStatus, DelayReason } from "@/types/attendance";
import { supabase } from "./supabase";
import { getActiveCompany, getDefaultBranch } from "./company";

type ServiceType = "tire" | "corrective" | "preventive";

type DbStatus =
  | "checkin"
  | "diagnostico"
  | "aprovacao"
  | "aguardando_peca"
  | "em_servico"
  | "teste_final"
  | "finalizada"
  | "entregue"
  | "cancelada";

const DB_TO_APP_STATUS: Record<string, AttendanceStatus> = {
  checkin: "arrival",
  diagnostico: "waiting",
  aprovacao: "waiting",
  aguardando_peca: "waiting",
  em_servico: "in_service",
  teste_final: "in_service",
  finalizada: "completed",
  entregue: "completed",
  cancelada: "completed",
};

function normalizeServiceType(serviceType?: string | null): ServiceType {
  if (serviceType === "tire" || serviceType === "corrective" || serviceType === "preventive") {
    return serviceType;
  }
  return "preventive";
}

function mapNextDbStatus(currentDbStatus: string, nextStatus: AttendanceStatus): DbStatus {
  if (nextStatus === "waiting") return currentDbStatus === "checkin" ? "diagnostico" : "diagnostico";
  if (nextStatus === "in_service") return "em_servico";
  if (nextStatus === "completed") return "finalizada";
  return "checkin";
}

async function getCurrentAuthUserId() {
  const response = await supabase.auth.getUser();
  return response.data.user?.id ?? null;
}

async function findOrCreateCustomer(companyId: string, customerName?: string, customerPhone?: string) {
  if (customerPhone?.trim()) {
    const byPhone = await supabase
      .from("customers")
      .select("id, full_name, phone")
      .eq("company_id", companyId)
      .eq("phone", customerPhone.trim())
      .limit(1)
      .maybeSingle();

    if (byPhone.error) throw byPhone.error;
    if (byPhone.data) return byPhone.data;
  }

  if (customerName?.trim()) {
    const byName = await supabase
      .from("customers")
      .select("id, full_name, phone")
      .eq("company_id", companyId)
      .eq("full_name", customerName.trim())
      .limit(1)
      .maybeSingle();

    if (byName.error) throw byName.error;
    if (byName.data) return byName.data;
  }

  const created = await supabase
    .from("customers")
    .insert({
      company_id: companyId,
      full_name: customerName?.trim() || "Cliente da ordem",
      phone: customerPhone?.trim() || null,
    })
    .select("id, full_name, phone")
    .single();

  if (created.error) throw created.error;
  return created.data;
}

async function findOrCreateVehicle(companyId: string, customerId: string, licensePlate: string, vehicleModel: string) {
  const existing = await supabase
    .from("vehicles")
    .select("id, customer_id, plate, brand, model")
    .eq("company_id", companyId)
    .eq("plate", licensePlate)
    .limit(1)
    .maybeSingle();

  if (existing.error) throw existing.error;
  if (existing.data) return existing.data;

  const created = await supabase
    .from("vehicles")
    .insert({
      company_id: companyId,
      customer_id: customerId,
      plate: licensePlate,
      model: vehicleModel,
    })
    .select("id, customer_id, plate, brand, model")
    .single();

  if (created.error) throw created.error;
  return created.data;
}

export function mapOrderToAttendance(order: any) {
  return {
    id: String(order.id),
    licensePlate: order.vehicle?.plate || "-",
    vehicleModel: [order.vehicle?.brand, order.vehicle?.model].filter(Boolean).join(" ") || order.vehicle?.model || "VeГ­culo",
    customerName: order.customer?.full_name || undefined,
    customerPhone: order.customer?.phone || undefined,
    status: DB_TO_APP_STATUS[order.current_status] || "arrival",
    serviceType: normalizeServiceType(order.service_type),
    description: order.complaint || undefined,
    whatsappNotificationSent: order.whatsapp_notification_sent || undefined,
    delayReason: (order.delay_reason as DelayReason) || "none",
    operationalNote: order.operational_note || undefined,
    slaExceptionActive: Boolean(order.sla_exception_active),
    slaExceptionReason: order.sla_exception_reason || undefined,
    createdAt: new Date(order.created_at).getTime(),
    updatedAt: new Date(order.updated_at).getTime(),
  };
}

export async function getOrders(companyId: string) {
  const ordersResponse = await supabase
    .from("maintenance_orders")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (ordersResponse.error) throw ordersResponse.error;
  const orders = ordersResponse.data ?? [];

  const customerIds = [...new Set(orders.map((order) => order.customer_id).filter(Boolean))];
  const vehicleIds = [...new Set(orders.map((order) => order.vehicle_id).filter(›ЫЫX[ЉJWNВ‚€ЫЫњЭШЭ\ЭЫY\њФ™\ЬЫњЩK™ZXЫ\Ф™\ЬЫњЩWHH]ШZ]›ЫZ\ЩK[
В€Э\ЭЫY\’YЛ›[™Э€ИЭ\X\ЩK™њ›ЫJЭ\ЭЫY\њИЉKњЩ[XЭ
љYќ[Ы[YKЫ™K[XZ[ЉKљ[ЉљY‹Э\ЭЫY\’YКB€€›ЫZ\ЩKњ™\ЫЫ™JИ]N€ЧK\њ›ЬЋ€ќ[H\И[ћJK€™ZXЫRYИ‹›[™Э€ИЭ\X\ЩK™њ›ЫJќ™ZXЫ\ИЉKњЩ[XЭ
љYЭ\ЭЫY\—ЪY]Kњ[™[Щ[YX\‹ЫЫЬ€ЉKљ[ЉљY‹™ZXЫRYКB€€›ЫZ\ЩKњ™\ЫЫ™JИ]N€ЧK\њ›ЬЋ€ќ[H\И[ћJK€JNВ‚€Y€
Э\ЭЫY\њФ™\ЬЫњЩK™\њ›ЬЉH›ЭИЭ\ЭЫY\њФ™\ЬЫњЩK™\њ›ЬЋВ€Y€
™ZXЫ\Ф™\ЬЫњЩK™\њ›ЬЉH›ЭИ™ZXЫ\Ф™\ЬЫњЩK™\њ›ЬЋВ‚€ЫЫњЭЭ\ЭЫY\“X\H™]ИX\

Э\ЭЫY\њФ™\ЬЫњЩK™]HЧJK›X\

][N€[ћJHO€Ъ][KљY][WJJNВ€ЫЫњЭ™ZXЫSX\H™]ИX\

™ZXЫ\Ф™\ЬЫњЩK™]HЧJK›X\

][N€[ћJHO€Ъ][KљY][WJJNВ‚€™]\›€Ь™\њЛ›X\

Ь™\ЉHO€
В€‹‹›Ь™\‹€Э\ЭЫY\Ћ€Э\ЭЫY\“X\™Щ]
Ь™\‹Э\ЭЫY\—ЪY
Hќ[€™ZXЫN€™ZXЫSX\™Щ]
Ь™\‹ќ™ZXЫWЪY
Hќ[€JJNВџB‚™^Ьќ\Ю[Иќ[Э[Ы€Ь™X]SЬ™\Љ[њ]€В€XЩ[њЩT]N€Эљ[™ОВ€™ZXЫS[Щ[€Эљ[™ОВ€Щ\ќљXЩU\N€Щ\ќљXЩU\NВ€Э\ЭЫY\“[YOО€Эљ[™ОВ€Э\ЭЫY\”Ы™OО€Эљ[™ОВ€\ШЬљ\[ЫЏО€Эљ[™ОВџJHВ€ЫЫњЭЫЫ\[ћHH]ШZ]Щ]XЭ]™PЫЫ\[ћJ
NВ€ЫЫњЭњ[ЪH]ШZ]Щ]Y][њ[Ъ
ЫЫ\[ћKљY
NВ€ЫЫњЭЬ\]Ь’YH]ШZ]Щ]Э\њ™[ќ]]\Щ\’Y

NВ‚€ЫЫњЭЭ\ЭЫY\€H]ШZ]љ[™ЬђЬ™X]PЭ\ЭЫY\ЉЫЫ\[ћKљY[њ]Э\ЭЫY\“[YK[њ]Э\ЭЫY\”Ы™JNВ€ЫЫњЭ™ZXЫHH]ШZ]љ[™ЬђЬ™X]U™ZXЫJЫЫ\[ћKљYЭ\ЭЫY\‹љY[њ]›XЩ[њЩT]K[њ]ќ™ZXЫS[Щ[
NВ‚€ЫЫњЭЬ™X]YH]ШZ]Э\X\ЩB€™њ›ЫJ›XZ[ќ[[ЩWЫЬ™\њИЉB€љ[њЩ\ќ
В€ЫЫ\[ћWЪY€ЫЫ\[ћKљY€њ[ЪЪY€њ[ЪЛљYќ[€Э\ЭЫY\—ЪY€™ZXЫKЭ\ЭЫY\—ЪYЭ\ЭЫY\‹љY€™ZXЫWЪY€™ZXЫKљY€Ь\]Ь—ЪY€Ь\]Ь’Y€Э\њ™[ќЬЭ]\О€ЪXЪЪ[€‹€Щ\ќљXЩWЭ\N€[њ]њЩ\ќљXЩU\K€љ[Ьљ]N€››Ь›X[‹€ЫЫ\Z[ќ€[њ]™\ШЬљ\[Ы€ќ[€JB€њЩ[XЭ
Љ€ЉB€њЪ[™ЫJ
NВ‚€Y€
Ь™X]Y™\њ›ЬЉH›ЭИЬ™X]Y™\њ›ЬЋВ€™]\›€Ь™X]Y™]NВџB‚™^Ьќ\Ю[Иќ[Э[Ы€\]SЬ™\”Э]\КЬ™\’Y€Эљ[™Л™^Э]\О€][™[ЩTЭ]\КHВ€ЫЫњЭ^\Э[™ИH]ШZ]Э\X\ЩB€™њ›ЫJ›XZ[ќ[[ЩWЫЬ™\њИЉB€њЩ[XЭ
љYЭ\њ™[ќЬЭ]\ИЉB€™\JљY‹Ь™\’Y
B€›[Z]
JB€›X^X™TЪ[™ЫJ
NВ‚€Y€
^\Э[™Л™\њ›ЬЉH›ЭИ^\Э[™Л™\њ›ЬЋВ€Y€
Y^\Э[™Л™]JH›ЭИ™]И\њ›ЬЉ“Ь™[H°иЫИ[ЫЫќYHЉNВ‚€ЫЫњЭ”Э]\ИHX\™^”Э]\К^\Э[™Л™]KЭ\њ™[ќЬЭ]\Л™^Э]\КNВ€ЫЫњЭ]Ъ€™XЫЬ™Эљ[™Л[љЫ›ЭЫЏ€HИЭ\њ™[ќЬЭ]\О€”Э]\ИNВ‚€Y€
”Э]\ИOOH™[WЬЩ\ќљXЫИЉH]ЪњЭ\ќYШ]H™]И]J
KќТTУФЭљ[™К
NВ€Y€
”Э]\ИOOH™љ[[^YHЉH]Ъ™љ[љ\ЪYШ]H™]И]J
KќТTУФЭљ[™К
NВ€Y€
”Э]\ИOOH™[ќ™YЭYHЉH]Ъ™[]™\™YШ]H™]И]J
KќТTУФЭљ[™К
NВ€Y€
”Э]\ИOOHШ[Щ[YHЉH]ЪШ[Щ[YШ]H™]И]J
KќТTУФЭљ[™К
NВ‚€ЫЫњЭ\]YH]ШZ]Э\X\ЩB€™њ›ЫJ›XZ[ќ[[ЩWЫЬ™\њИЉB€ќ\]J]Ъ
B€™\JљY‹Ь™\’Y
B€њЩ[XЭ
Љ€ЉB€њЪ[™ЫJ
NВ‚€Y€
\]Y™\њ›ЬЉH›ЭИ\]Y™\њ›ЬЋВ€™]\›€\]Y™]NВџB‚™^Ьќ\Ю[Иќ[Э[Ы€\]SЬ™\‘ЫЭ™\›[ЩJ[њ]€В€Y€Эљ[™ОВ€[^T™X\ЫЫЋ€[^T™X\ЫЫЋВ€Ь\][Ы[›ЭOО€Эљ[™ОВ€ЫQ^Щ\[ЫђXЭ]™N€›ЫЫX[ЋВ€ЫQ^Щ\[Ы”™X\ЫЫЏО€Эљ[™ОВџJHВ€ЫЫњЭЫЫ\[ћHH]ШZ]Щ]XЭ]™PЫЫ\[ћJ
NВ€ЫЫњЭXЭЬ•\Щ\’YH]ШZ]Щ]Э\њ™[ќ]]\Щ\’Y

NВ‚€ЫЫњЭ\]YH]ШZ]Э\X\ЩB€™њ›ЫJ›XZ[ќ[[ЩWЫЬ™\њИЉB€ќ\]JВ€[^WЬ™X\ЫЫЋ€[њ]™[^T™X\ЫЫ‹€Ь\][Ы[Ы›ЭN€[њ]›Ь\][Ы[›ЭOЛќљ[J
Hќ[€ЫWЩ^Щ\[Ы—ШXЭ]™N€[њ]њЫQ^Щ\[ЫђXЭ]™K€ЫWЩ^Щ\[Ы—Ь™X\ЫЫЋ€[њ]њЫQ^Щ\[ЫђXЭ]™HИ[њ]њЫQ^Щ\[Ы”™X\ЫЫЏЛќљ[J
Hќ[€ќ[€JB€™\JљY‹[њ]љY
B€њЩ[XЭ
Љ€ЉB€њЪ[™ЫJ
NВ‚€Y€
\]Y™\њ›ЬЉH›ЭИ\]Y™\њ›ЬЋВ‚€]ШZ]Э\X\ЩK™њ›ЫJ›XZ[ќ[[ЩWЩ]™[ќИЉKљ[њЩ\ќ
В€ЫЫ\[ћWЪY€ЫЫ\[ћKљY€Ь™\—ЪY€[њ]љY€XЭЬ—Э\Щ\—ЪY€XЭЬ•\Щ\’Y€]™[ќЭ\N€™ЫЭ™\›[ЩWЭ\]Y‹€]N€‘ЫЭ™\›°и›ЪXH]X[^YH‹€›ЭN€В€[њ]™[^T™X\ЫЫ€OOH››Ы™H€И[Э]›О€	Ъ[њ]™[^T™X\ЫЫџX€ќ[€[њ]›Ь\][Ы[›ЭOЛќљ[J
HИ›ЭN€	Ъ[њ]›Ь\][Ы[›ЭKќљ[J
_X€ќ[€[њ]њЫQ^Щ\[ЫђXЭ]™HИ^ЩpйриЫИУN€	Ъ[њ]њЫQ^Щ\[Ы”™X\ЫЫЏЛќљ[J
H]]HџX€ќ[€B€™љ[\Љ›ЫЫX[ЉB€љ›Ъ[Љё (€
K€X›XЧЭЧШЭ\ЭЫY\Ћ€[ЩK€JNВ‚€™]\›€\]Y™]NВџB‚™^Ьќ\Ю[Иќ[Э[Ы€[]SЬ™\ЉЬ™\’Y€Эљ[™КHВ€ЫЫњЭ™[[Э™YH]ШZ]Э\X\ЩK™њ›ЫJ›XZ[ќ[[ЩWЫЬ™\њИЉK™[]J
K™\JљY‹Ь™\’Y
NВ€Y€
™[[Э™Y™\њ›ЬЉH›ЭИ™[[Э™Y™\њ›ЬЋВџB‚™^Ьќ\Ю[Иќ[Э[Ы€Щ]Ь™\’\ЭЬћJЬ™\’Y€Эљ[™КHВ€ЫЫњЭ]™[ќФ™\ЬЫњЩHH]ШZ]Э\X\ЩB€™њ›ЫJ›XZ[ќ[[ЩWЩ]™[ќИЉB€њЩ[XЭ
љYXЭЬ—Э\Щ\—ЪY]™[ќЭ\K]KЫЬЭ]\Л™]ЧЬЭ]\Л›ЭKЬ™X]YШ]ЉB€™\J›Ь™\—ЪY‹Ь™\’Y
B€›Ь™\ЉЬ™X]YШ]‹И\ШЩ[™[™О€[ЩHJNВ‚€Y€
]™[ќФ™\ЬЫњЩK™\њ›ЬЉH›ЭИ]™[ќФ™\ЬЫњЩK™\њ›ЬЋВ€ЫЫњЭ]™[ќИH]™[ќФ™\ЬЫњЩK™]HПИЧNВ€ЫЫњЭXЭЬ’YИHЛ‹‹›™]ИЩ]
]™[ќЛ›X\

]™[ќ
HO€]™[ќXЭЬ—Э\Щ\—ЪY
K™љ[\Љ›ЫЫX[ЉJWNВ‚€ЫЫњЭ›Щљ[\Ф™\ЬЫњЩHHXЭЬ’YЛ›[™Э€И]ШZ]Э\X\ЩK™њ›ЫJњ›Щљ[\ИЉKњЩ[XЭ
љYќ[Ы[YHЉKљ[ЉљY‹XЭЬ’YКB€€
И]N€ЧK\њ›ЬЋ€ќ[H\И[ћJNВ‚€Y€
›Щљ[\Ф™\ЬЫњЩK™\њ›ЬЉH›ЭИ›Щљ[\Ф™\ЬЫњЩK™\њ›ЬЋВ€ЫЫњЭ›Щљ[SX\H™]ИX\

›Щљ[\Ф™\ЬЫњЩK™]HЧJK›X\

›Щљ[N€[ћJHO€Ь›Щљ[KљY›Щљ[WJJNВ‚€™]\›€]™[ќЛ›X\

]™[ќ
HO€
В€‹‹™]™[ќ€XЭЬ—Ы[YN€]™[ќXЭЬ—Э\Щ\—ЪYИ›Щљ[SX\™Щ]
]™[ќXЭЬ—Э\Щ\—ЪY
OЛ™ќ[Ы[YHќ[€ќ[€JJNВџB