import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  NOMBRE_DE_TIPO,
  TIPOS_SERVICIO,
  type TipoServicio,
} from "@/lib/dominio";

/** Tipo de servicio y descripción del trabajo. */
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
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm leading-none font-medium">
          Tipo de servicio
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {TIPOS_SERVICIO.map((valor) => (
            <label
              key={valor}
              className="has-checked:border-brand has-checked:bg-brand/15 has-focus-visible:ring-ring/50 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 text-sm font-medium has-focus-visible:ring-3"
            >
              <input
                type="radio"
                name="tipo"
                value={valor}
                defaultChecked={valor === tipo}
                required
                className="accent-primary size-4"
              />
              {NOMBRE_DE_TIPO[valor]}
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
          className="min-h-28"
        />
      </div>
    </>
  );
}

/** Motivo obligatorio de una corrección o anulación (RS-13). */
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
