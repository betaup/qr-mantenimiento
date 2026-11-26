import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  NOMBRE_DE_TIPO,
  TIPOS_SERVICIO,
  type TipoServicio,
} from "@/lib/dominio";

export function CamposServicio({
  prefijo,
  tipo,
  descripcion,
}: {
  prefijo: string;
  tipo?: TipoServicio | null;
  descripcion?: string;
}) {
  return (
    <>
      <fieldset className="@container/servicio flex min-w-0 flex-col gap-2">
        <legend className="mb-2 text-sm leading-none font-medium">
          Tipo de servicio
        </legend>
        <div className="grid gap-2 @min-[28rem]/servicio:grid-cols-3">
          {TIPOS_SERVICIO.map((valor) => (
            <label
              key={valor}
              className="has-checked:border-brand has-checked:bg-brand/15 has-focus-visible:ring-ring/50 flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-2.5 text-sm font-medium has-focus-visible:ring-3"
            >
              <input
                type="radio"
                name="tipo"
                value={valor}
                defaultChecked={valor === tipo}
                required
                className="accent-primary size-4 shrink-0"
              />
              {
                // eslint-disable-next-line security/detect-object-injection -- valor sale de TIPOS_SERVICIO
                NOMBRE_DE_TIPO[valor]
              }
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${prefijo}-descripcion`}>Trabajo realizado</Label>
        <Textarea
          id={`${prefijo}-descripcion`}
          name="descripcion"
          required
          minLength={5}
          maxLength={2000}
          defaultValue={descripcion}
          className="max-h-48 min-h-28 resize-y overflow-y-auto"
        />
      </div>
    </>
  );
}

/** Motivo obligatorio de una correccion o anulacion (RS-13). */
export function CampoMotivo({ prefijo }: { prefijo: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${prefijo}-motivo`}>Motivo</Label>
      <Textarea
        id={`${prefijo}-motivo`}
        name="motivo"
        required
        minLength={5}
        maxLength={500}
      />
    </div>
  );
}
