/**
 * Todos los datos de la invitación viven aquí.
 * Cambia estos valores y toda la página se actualiza.
 */

export type PlaceDetail = {
  label: string;
  time: string;
  place: string;
  address: string;
  city: string;
  mapUrl: string;
};

export const invitation = {
  baby: {
    name: "Salvador",
    fullName: "Salvador Leiva Montenegro",
    monogram: { left: "L", center: "S", right: "M" },
    nameArt: `${import.meta.env.BASE_URL}images/salvador-nombre-sin-paloma.png`,
    doveArt: `${import.meta.env.BASE_URL}images/paloma.png`,
    doveSealArt: `${import.meta.env.BASE_URL}images/paloma-sello.png`,
  },
  event: {
    label: "Bautizo",
    dateLong: "Sábado, 5 de diciembre de 2026",
    dateShort: "05 · 12 · 2026",
    dateISO: "2026-12-05T08:00:00-05:00",
    calendarDates: "20261205T080000/20261205T130000",
    dateParts: { day: "05", month: "Diciembre", year: "2026", weekday: "Sábado" },
  },
  parents: ["Tatiana Montenegro Domínguez", "Fernando Leiva Benachi"],
  godparents: ["Violet Leiva Benachi", "Nicolás Montenegro Domínguez"],
  welcome: {
    eyebrow: "Con alegría",
    title: "Tenemos el gusto de invitarte a celebrar el bautizo de Salvador.",
    note: "Acompáñanos a celebrar el día en que Salvador recibe la bendición de Dios y comienza su camino en la fe, rodeado del amor de su familia.",
  },
  places: [
    {
      label: "Ceremonia",
      time: "8:00 a.m.",
      place: "Parroquia San Ambrosio",
      address: "Carrera 50 # 123A-30, El Batán",
      city: "Bogotá, Colombia",
      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=Parroquia%20San%20Ambrosio%2C%20Carrera%2050%20%23%20123A-30%2C%20Bogot%C3%A1&query_place_id=ChIJkx8oasuaP44RucnoHB6NWSk",
    },
    {
      label: "Brunch",
      time: "9:30 a.m.",
      place: "Lumina Rooftop",
      address: "Calle 114 # 6A-92, Usaquén (terraza)",
      city: "Bogotá, Colombia",
      mapUrl:
        "https://maps.google.com/?cid=18186513256719743322",
    },
  ] satisfies PlaceDetail[],
  dressCode: {
    label: "Código de vestimenta",
    value: "Semi formal",
    note: "",
  },
  rsvp: {
    message:
      "Tu presencia es el mejor regalo. Confirma tu asistencia antes del 28 de noviembre de 2026.",
    whatsapp: "523312345678",
    phoneLabel: "+52 33 1234 5678",
    contactName: "Tatiana",
    deadline: "28 de noviembre",
  },
  hosts: "Tatiana y Fernando",
};

export const calendarUrl = () => {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Bautizo de ${invitation.baby.name}`,
    dates: invitation.event.calendarDates,
    details: `Ceremonia y brunch del bautizo de ${invitation.baby.fullName}.`,
    location: `${invitation.places[0].place}, ${invitation.places[0].city}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
