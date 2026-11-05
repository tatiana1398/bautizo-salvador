import { Loader2, Minus, Plus, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { invitation } from "@/content/invitation";
import { cn } from "@/lib/utils";

import Reveal from "./Reveal";

type Attendance = "yes" | "no";
type SendStatus = "idle" | "sending" | "sent" | "error";

const MAX_COMPANIONS = 10;

export const RsvpSection = () => {
  const [name, setName] = useState("");
  const [companions, setCompanions] = useState<string[]>([""]);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [status, setStatus] = useState<SendStatus>("idle");

  const family = name.trim().replace(/^familia\s+/i, "");
  const guestNames = companions.map((companion) => companion.trim()).filter(Boolean);
  const canSend =
    family.length > 1 &&
    attendance !== null &&
    (attendance === "no" || guestNames.length > 0) &&
    status !== "sending";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSend) return;
    if (!invitation.rsvp.sheetEndpoint) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      // Apps Script no devuelve cabeceras CORS: se envía en modo no-cors y,
      // si la petición sale sin error de red, se da por recibida.
      await fetch(invitation.rsvp.sheetEndpoint, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          familia: family,
          asiste: attendance === "yes" ? "Sí" : "No",
          personas: attendance === "yes" ? String(guestNames.length) : "0",
          nombres: attendance === "yes" ? guestNames.join(", ") : "",
        }),
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const setGuestCount = (count: number) => {
    const next = Math.min(Math.max(count, 1), MAX_COMPANIONS);
    setCompanions((current) =>
      next > current.length
        ? [...current, ...Array<string>(next - current.length).fill("")]
        : current.slice(0, next),
    );
  };

  const updateCompanion = (index: number, value: string) => {
    setCompanions((current) => current.map((item, i) => (i === index ? value : item)));
  };

  return (
    <section id="rsvp" className="px-6 pb-24 pt-4 md:pb-32 md:pt-6">
      <Reveal className="mx-auto max-w-[560px]">
        <div className="border border-line bg-card/70 px-6 py-12 text-center md:px-12 md:py-14">
          <p className="eyebrow">Confirmación</p>
          <h2 className="mt-4 font-display text-[30px] font-light leading-tight text-ink md:text-[38px]">
            ¿Nos acompañas?
          </h2>
          <p className="mx-auto mt-4 max-w-[380px] text-pretty text-[13px] leading-relaxed text-ink-soft">
            {invitation.rsvp.message}
          </p>

          {status === "sent" ? (
            <div className="mt-9 print:hidden" role="status">
              <p className="font-display text-[22px] font-light leading-snug text-ink md:text-[26px]">
                ¡Gracias, familia {family}!
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                {attendance === "yes"
                  ? `Recibimos su confirmación para ${guestNames.length} ${
                      guestNames.length === 1 ? "persona" : "personas"
                    }. ¡Los esperamos!`
                  : "Recibimos su respuesta. Gracias por acompañarnos con el corazón."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-9 space-y-7 text-left print:hidden">
              <div>
                <label htmlFor="rsvp-name" className="eyebrow-muted">
                  Familia (apellidos)
                </label>
                <div className="mt-2 flex items-end gap-2">
                  <span className="mb-2 font-display text-[17px] text-ink">Familia</span>
                  <input
                    id="rsvp-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej. Leiva Montenegro"
                    autoComplete="family-name"
                    className="field"
                  />
                </div>
              </div>

              <div>
                <span className="eyebrow-muted">¿Podrás acompañarnos?</span>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(
                    [
                      { value: "yes", label: "Sí, asistiremos" },
                      { value: "no", label: "No podremos" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={attendance === option.value}
                      onClick={() => setAttendance(option.value)}
                      className={cn(
                        "border px-4 py-3.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
                        attendance === option.value
                          ? "border-moss bg-primary text-primary-foreground"
                          : "border-line text-ink-soft hover:border-moss/50 hover:text-moss",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {attendance === "no" ? (
                <p className="text-pretty text-center font-display text-[18px] font-light italic leading-relaxed text-ink-soft md:text-[20px]">
                  Los vamos a extrañar. Gracias por acompañarnos con el corazón y por tener a{" "}
                  {invitation.baby.name} presente en sus oraciones.
                </p>
              ) : null}

              {attendance === "yes" ? (
                <div>
                  <span className="eyebrow-muted">Número de personas</span>
                  <div className="mt-3 flex items-center gap-5">
                    <button
                      type="button"
                      onClick={() => setGuestCount(companions.length - 1)}
                      disabled={companions.length <= 1}
                      aria-label="Una persona menos"
                      className="flex h-10 w-10 items-center justify-center border border-line text-ink-soft transition-colors hover:border-moss hover:text-moss disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <span
                      aria-live="polite"
                      className="min-w-[2ch] text-center font-display text-[30px] font-light leading-none text-ink"
                    >
                      {companions.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuestCount(companions.length + 1)}
                      disabled={companions.length >= MAX_COMPANIONS}
                      aria-label="Una persona más"
                      className="flex h-10 w-10 items-center justify-center border border-line text-ink-soft transition-colors hover:border-moss hover:text-moss disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <span className="text-[12px] text-ink-soft">
                      {companions.length === 1 ? "persona" : "personas"}
                    </span>
                  </div>
                </div>
              ) : null}

              {attendance === "yes" ? (
                <div>
                  <span className="eyebrow-muted">¿Quiénes asisten?</span>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft/90">
                    Escribe el nombre de cada integrante de la familia que asistirá, incluyéndote.
                  </p>

                  <div className="mt-4 space-y-3">
                    {companions.map((companion, index) => (
                      <input
                        key={index}
                        type="text"
                        value={companion}
                        onChange={(event) => updateCompanion(index, event.target.value)}
                        placeholder={`Nombre de la persona ${index + 1}`}
                        aria-label={`Persona ${index + 1}`}
                        className="field"
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="pt-2 text-center">
                <Button type="submit" size="lg" className="w-full" disabled={!canSend}>
                  {status === "sending" ? (
                    <Loader2 className="animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Send strokeWidth={1.5} />
                  )}
                  {status === "sending" ? "Enviando…" : "Enviar"}
                </Button>
                {status === "error" ? (
                  <p className="mt-3 text-[12px] text-destructive" role="alert">
                    No pudimos enviar tu confirmación. Inténtalo de nuevo en un momento.
                  </p>
                ) : null}
              </div>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
};

export default RsvpSection;
